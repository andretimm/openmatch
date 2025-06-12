package main

import (
	"context"
	"log"
	"time"

	"github.com/shurcooL/graphql"
)

func main() {
	log.Println("🛠️ Iniciando script de atualização de issues...")
	startTime := time.Now()

	connString := "postgres://postgres:D69RPDWl0zrRudtYpJjm86oULbmw4iX5h6ASGJhvxHuG0dg8ElPwdIWfyG3gj3m8@test-vps.timm.software:5432/postgres"
	githubToken = "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"
	pool, err := initDB(connString)
	if err != nil {
		log.Fatalf("Não foi possível conectar ao PostgreSQL: %v\n", err)
	}
	defer pool.Close()
	ctx := context.Background()

	var totalUpdated int64
	var totalChecked int

	// Loop de processamento em lotes
	for offset := 0; ; offset += BATCH_SIZE {
		log.Printf("Processando lote a partir do offset %d...\n", offset)

		// 1. Busca um lote de issues 'open' do nosso banco
		issuesToUpdate, err := fetchBatchOfOpenIssues(ctx, pool, offset)
		if err != nil {
			log.Fatalf("Erro ao buscar lote de issues: %v\n", err)
		}

		// Condição de parada: se não vierem mais issues, terminamos.
		if len(issuesToUpdate) == 0 {
			log.Println("Não há mais issues abertas para verificar.")
			break
		}
		totalChecked += len(issuesToUpdate)

		// 2. Busca as informações atualizadas do GitHub via GraphQL
		// Precisamos de sub-lotes, pois a API GraphQL aceita no máximo 100 nodes por vez.
		const gqlBatchSize = 100 // A API aceita no máximo 100 nodes por vez.
		var allUpdatedInfos []UpdatedInfo
		for i := 0; i < len(issuesToUpdate); i += gqlBatchSize {
			end := i + gqlBatchSize
			if end > len(issuesToUpdate) {
				end = len(issuesToUpdate)
			}
			subBatch := issuesToUpdate[i:end]

			// --- INÍCIO DA MUDANÇA ---
			// Prepara o slice de IDs no formato que a função GraphQL espera
			var nodeIDs []graphql.ID
			for _, issue := range subBatch {
				nodeIDs = append(nodeIDs, issue.NodeID)
			}

			updatedInfos, err := fetchUpdatesFromGitHubGraphQL(ctx, nodeIDs)
			// --- FIM DA MUDANÇA ---

			if err != nil {
				log.Printf("⚠️ Erro ao buscar lote GraphQL (continuando): %v", err)
				continue // Continua para o próximo sub-lote
			}
			allUpdatedInfos = append(allUpdatedInfos, updatedInfos...)
		}

		// 3. Atualiza o nosso banco de dados em massa
		updatedCount, err := bulkUpdateDatabase(ctx, pool, allUpdatedInfos)
		if err != nil {
			log.Fatalf("Erro ao atualizar o banco de dados: %v", err)
		}

		totalUpdated += updatedCount
		log.Printf("Lote processado. %d issues atualizadas no banco.\n", updatedCount)
	}

	log.Printf("🏁 Script de atualização finalizado. Verificadas: %d. Atualizadas: %d. Tempo total: %v\n", totalChecked, totalUpdated, time.Since(startTime))
}
