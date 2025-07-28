package main

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

func initDB(connString string) (*pgxpool.Pool, error) {
	return pgxpool.New(context.Background(), connString)
}

func sanitizeString(s string) string {
	return strings.ReplaceAll(s, "\x00", "")
}

func getLatestTimestamp(ctx context.Context, pool *pgxpool.Pool) (string, error) {
	var lastRun time.Time
	err := pool.QueryRow(ctx, "SELECT last_run_timestamp FROM crawler_state WHERE id = 1").Scan(&lastRun)
	if err != nil {
		return "", err
	}
	return lastRun.UTC().Format(time.RFC3339), nil
}

func updateLatestTimestamp(ctx context.Context, pool *pgxpool.Pool, newTimestamp time.Time) error {
	_, err := pool.Exec(ctx, "UPDATE crawler_state SET last_run_timestamp = $1 WHERE id = 1", newTimestamp)
	return err
}

func bulkInsertIssues(ctx context.Context, pool *pgxpool.Pool, issues []Issue) (int64, error) {
	if len(issues) == 0 {
		return 0, nil
	}

	tx, err := pool.Begin(ctx)
	if err != nil {
		return 0, fmt.Errorf("erro ao iniciar a transação: %w", err)
	}
	defer tx.Rollback(ctx)

	tempTableName := fmt.Sprintf("temp_issues_%d", time.Now().UnixNano())
	createTempTableSQL := fmt.Sprintf(`
		CREATE TEMP TABLE %s (LIKE issues INCLUDING DEFAULTS) ON COMMIT DROP;
	`, tempTableName)

	_, err = tx.Exec(ctx, createTempTableSQL)
	if err != nil {
		return 0, fmt.Errorf("erro ao criar tabela temporária: %w", err)
	}

	_, err = tx.CopyFrom(
		ctx,
		pgx.Identifier{tempTableName},
		[]string{"id", "node_id", "url", "repository_url", "title", "user_login", "state", "project_name", "language",
			"labels", "created_at", "updated_at", "body", "stargazers_count", "forks_count", "open_issues_count",
		},
		pgx.CopyFromSlice(len(issues), func(i int) ([]interface{}, error) {
			issue := issues[i]
			projectName := strings.Join(strings.Split(issue.RepositoryURL, "/")[len(strings.Split(issue.RepositoryURL, "/"))-2:], "/")
			labelsJSON, err := json.Marshal(issue.Labels)
			if err != nil {
				return nil, err
			}

			return []interface{}{
				issue.ID,
				issue.NodeID,
				issue.URL,
				issue.RepositoryURL,
				sanitizeString(issue.Title),
				issue.User.Login,
				issue.State,
				sanitizeString(projectName),
				issue.Language,
				labelsJSON,
				issue.CreatedAt,
				issue.UpdatedAt,
				sanitizeString(issue.Body),
				issue.RepoStars,
				issue.RepoForks,
				issue.OpenIssuesCount,
			}, nil
		}),
	)
	if err != nil {
		return 0, fmt.Errorf("erro no COPY para tabela temporária: %w", err)
	}

	// Insere na tabela principal, ignorando conflitos na chave primária 'id'
	insertSQL := fmt.Sprintf(`
		INSERT INTO issues SELECT * FROM %s
		ON CONFLICT (id) DO NOTHING;
	`, tempTableName)

	commandTag, err := tx.Exec(ctx, insertSQL)
	if err != nil {
		return 0, fmt.Errorf("erro ao inserir com ON CONFLICT: %w", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return 0, fmt.Errorf("erro ao comitar a transação: %w", err)
	}

	return commandTag.RowsAffected(), nil
}
