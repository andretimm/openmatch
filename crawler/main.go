package main

import (
	"context"
	"log"
	"os"
	"sync"
	"time"
)

func main() {
	log.Println("Iniciando crawler performático em Go...")
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

	lastRun, err := getLatestTimestamp(ctx, pool)
	if err != nil {
		log.Fatalf("Erro ao buscar último timestamp: %v\n", err)
	}
	log.Printf("Buscando issues criadas desde: %s\n", lastRun)
	currentRunTimestamp := time.Now().UTC()

	languages := []string{"python", "javascript", "typescript", "html", "java", "php", "ruby", "c#", "go", "rust", "dart", "kotlin", "swift"}

	var wg sync.WaitGroup
	issueChan := make(chan []Issue, len(languages))
	errChan := make(chan error, len(languages))

	for _, lang := range languages {
		wg.Add(1)
		go fetchIssuesForLanguage(lang, lastRun, &wg, issueChan, errChan)
	}

	wg.Wait()
	close(issueChan)
	close(errChan)

	var allIssues []Issue
	for issues := range issueChan {
		allIssues = append(allIssues, issues...)
	}

	for err := range errChan {
		log.Printf("Erro durante a busca: %v\n", err)
	}

	log.Printf("Total de %d issues encontradas em todas as linguagens.\n", len(allIssues))

	if len(allIssues) > 0 {
		copyCount, err := bulkInsertIssues(ctx, pool, allIssues)
		if err != nil {
			log.Fatalf("Erro na inserção em massa: %v\n", err)
		}
		log.Printf("%d novas issues salvas no banco de dados.\n", copyCount)
	}

	if err := updateLatestTimestamp(ctx, pool, currentRunTimestamp); err != nil {
		log.Fatalf("Erro ao atualizar o timestamp: %v\n", err)
	}

	log.Printf("Crawler finalizado com sucesso em %v.\n", time.Since(startTime))
}
