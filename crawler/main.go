package main

import (
	"context"
	"log"
	"sync"
	"time"
)

func main() {
	log.Println("🚀 Iniciando crawler performático em Go...")
	startTime := time.Now()

	// --- 1. Configuração e Conexão com o Banco ---
	// Ex: "postgres://user:password@host:port/dbname"
	connString := "postgres://postgres:D69RPDWl0zrRudtYpJjm86oULbmw4iX5h6ASGJhvxHuG0dg8ElPwdIWfyG3gj3m8@test-vps.timm.software:5432/postgres"
	// if connString == "" {
	// 	log.Fatal("Variável de ambiente DATABASE_URL não definida.")
	// }
	// if os.Getenv("GITHUB_TOKEN") != "" {
	// 	githubToken = os.Getenv("GITHUB_TOKEN")
	// }
	githubToken = "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"

	pool, err := initDB(connString)
	if err != nil {
		log.Fatalf("Não foi possível conectar ao PostgreSQL: %v\n", err)
	}
	defer pool.Close()
	ctx := context.Background()

	// --- 2. Busca o Timestamp da Última Execução ---
	lastRun, err := getLatestTimestamp(ctx, pool)
	if err != nil {
		log.Fatalf("Erro ao buscar último timestamp: %v\n", err)
	}
	log.Printf("Buscando issues criadas desde: %s\n", lastRun)
	currentRunTimestamp := time.Now().UTC()

	// --- 3. Execução Concorrente da Busca na API ---
	// languages := []string{"go", "python", "javascript", "typescript", "rust", "java", "ruby", "csharp", "php", "swift"}
	languages := []string{"javascript", "typescript"}
	var wg sync.WaitGroup
	issueChan := make(chan []Issue, len(languages))
	errChan := make(chan error, len(languages))

	for _, lang := range languages {
		wg.Add(1)
		go fetchIssuesForLanguage(lang, lastRun, &wg, issueChan, errChan)
	}

	// Espera todas as goroutines terminarem e fecha os canais
	wg.Wait()
	close(issueChan)
	close(errChan)

	// --- 4. Agregação dos Resultados ---
	var allIssues []Issue
	for issues := range issueChan {
		allIssues = append(allIssues, issues...)
	}

	// Verifica se houve algum erro durante as buscas
	for err := range errChan {
		log.Printf("⚠️ Erro durante a busca: %v\n", err)
	}

	log.Printf("Total de %d issues encontradas em todas as linguagens.\n", len(allIssues))

	// --- 5. Inserção em Massa no Banco de Dados ---
	if len(allIssues) > 0 {
		copyCount, err := bulkInsertIssues(ctx, pool, allIssues)
		if err != nil {
			log.Fatalf("Erro na inserção em massa: %v\n", err)
		}
		log.Printf("✅ %d novas issues salvas no banco de dados.\n", copyCount)
	}

	// --- 6. Atualiza o Timestamp para a Próxima Execução ---
	if err := updateLatestTimestamp(ctx, pool, currentRunTimestamp); err != nil {
		log.Fatalf("Erro ao atualizar o timestamp: %v\n", err)
	}

	log.Printf("🏁 Crawler finalizado com sucesso em %v.\n", time.Since(startTime))
}
