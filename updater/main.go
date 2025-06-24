package main

import (
	"context"
	"log"
	"os"
	"time"

	"github.com/shurcooL/graphql"
)

func main() {
	log.Println("🛠️ Iniciando script de atualização de issues...")
	startTime := time.Now()

	connString := os.Getenv("DATABASE_URL")
	if connString == "" {
		log.Fatal("Variável de ambiente DATABASE_URL não definida.")
	}
	if os.Getenv("GITHUB_TOKEN") != "" {
		githubToken = os.Getenv("GITHUB_TOKEN")
	}
	pool, err := initDB(connString)
	if err != nil {
		log.Fatalf("Não foi possível conectar ao PostgreSQL: %v\n", err)
	}
	defer pool.Close()
	ctx := context.Background()

	var totalUpdated int64
	var totalChecked int

	for offset := 0; ; offset += BATCH_SIZE {
		log.Printf("Processando lote a partir do offset %d...\n", offset)

		issuesToUpdate, err := fetchBatchOfOpenIssues(ctx, pool, offset)
		if err != nil {
			log.Fatalf("Erro ao buscar lote de issues: %v\n", err)
		}

		if len(issuesToUpdate) == 0 {
			log.Println("Não há mais issues abertas para verificar.")
			break
		}
		totalChecked += len(issuesToUpdate)

		const gqlBatchSize = 100
		var allUpdatedInfos []UpdatedInfo
		for i := 0; i < len(issuesToUpdate); i += gqlBatchSize {
			end := i + gqlBatchSize
			if end > len(issuesToUpdate) {
				end = len(issuesToUpdate)
			}
			subBatch := issuesToUpdate[i:end]

			var nodeIDs []graphql.ID
			for _, issue := range subBatch {
				nodeIDs = append(nodeIDs, issue.NodeID)
			}

			updatedInfos, err := fetchUpdatesFromGitHubGraphQL(ctx, nodeIDs)

			if err != nil {
				log.Printf("Erro ao buscar lote GraphQL (continuando): %v", err)
				continue
			}
			allUpdatedInfos = append(allUpdatedInfos, updatedInfos...)
		}

		updatedCount, err := bulkUpdateDatabase(ctx, pool, allUpdatedInfos)
		if err != nil {
			log.Fatalf("Erro ao atualizar o banco de dados: %v", err)
		}

		totalUpdated += updatedCount
		log.Printf("Lote processado. %d issues atualizadas no banco.\n", updatedCount)
	}

	log.Printf("Script de atualização finalizado. Verificadas: %d. Atualizadas: %d. Tempo total: %v\n", totalChecked, totalUpdated, time.Since(startTime))
}
