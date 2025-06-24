package main

import (
	"context"
	"encoding/json"
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

const BATCH_SIZE = 200

func initDB(connString string) (*pgxpool.Pool, error) {
	return pgxpool.New(context.Background(), connString)
}

func fetchBatchOfOpenIssues(ctx context.Context, pool *pgxpool.Pool, offset int) ([]IssueToUpdate, error) {
	query := `
		SELECT id, node_id FROM issues 
		WHERE state != 'closed' 
		ORDER BY id 
		LIMIT $1 OFFSET $2
	`
	rows, err := pool.Query(ctx, query, BATCH_SIZE, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var issues []IssueToUpdate
	for rows.Next() {
		var issue IssueToUpdate
		if err := rows.Scan(&issue.ID, &issue.NodeID); err != nil {
			return nil, err
		}
		issues = append(issues, issue)
	}
	return issues, nil
}

func bulkUpdateDatabase(ctx context.Context, pool *pgxpool.Pool, updates []UpdatedInfo) (int64, error) {
	if len(updates) == 0 {
		return 0, nil
	}

	const colsPerUpdate = 6
	var valueStrings []string
	var flatValues []interface{}

	paramIndex := 1
	for _, update := range updates {
		placeholders := fmt.Sprintf("($%d, $%d, $%d, $%d, $%d, $%d)",
			paramIndex, paramIndex+1, paramIndex+2, paramIndex+3, paramIndex+4, paramIndex+5)
		valueStrings = append(valueStrings, placeholders)
		paramIndex += colsPerUpdate

		labelsJSON, err := json.Marshal(update.Labels)
		if err != nil {
			return 0, fmt.Errorf("erro ao serializar labels para JSON: %w", err)
		}

		updatedAtString := update.UpdatedAt.UTC().Format(time.RFC3339)
		assigneeCountString := strconv.Itoa(update.AssigneeCount)

		flatValues = append(flatValues, update.ID, update.Title, update.State, labelsJSON, updatedAtString, assigneeCountString)
	}

	var sqlBuilder strings.Builder
	sqlBuilder.WriteString(`
		UPDATE issues
		SET
			title = data.title::TEXT,
			state = CASE
				WHEN data.state_from_api = 'closed' THEN 'closed'				
				WHEN data.assignee_count::integer > 0 THEN 'assigned'
				ELSE 'open'
			END,
			labels = data.labels::jsonb,
			updated_at = data.updated_at::timestamptz
		FROM (VALUES 
	`)
	sqlBuilder.WriteString(strings.Join(valueStrings, ", "))
	sqlBuilder.WriteString(`
		) AS data(node_id, title, state_from_api, labels, updated_at, assignee_count)
		WHERE issues.node_id = data.node_id
	`)

	commandTag, err := pool.Exec(ctx, sqlBuilder.String(), flatValues...)
	if err != nil {
		return 0, fmt.Errorf("erro ao executar o bulk update: %w", err)
	}

	return commandTag.RowsAffected(), nil
}
