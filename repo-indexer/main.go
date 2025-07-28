package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"

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

	languages := []string{"python", "javascript", "typescript", "html", "java", "php", "ruby", "c#", "go", "rust", "dart", "kotlin", "css"}

	var wg sync.WaitGroup
	issueChan := make(chan []Issue, len(languages))
	errChan := make(chan error, len(languages))
	repoName := "cumbucadev/cinemaempoa"
	for _, lang := range languages {
		wg.Add(1)
		go fetchIssuesForLanguage(repoName, lang, lastRun, &wg, issueChan, errChan)
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

	uniqueRepoURLs := make(map[string]bool)
	for _, issue := range allIssues {
		uniqueRepoURLs[issue.RepositoryURL] = true
	}

	repoDetailsChan := make(chan *RepositoryDetails, len(uniqueRepoURLs))
	repoErrChan := make(chan error, len(uniqueRepoURLs))
	var repoWg sync.WaitGroup

	repoDetailsMap := make(map[string]*RepositoryDetails)

	for repoURL := range uniqueRepoURLs {
		repoWg.Add(1)
		go func(url string) {
			defer repoWg.Done()
			req, err := http.NewRequest("GET", url, nil)
			if err != nil {
				repoErrChan <- err
				return
			}
			req.Header.Set("Authorization", "token "+githubToken)
			req.Header.Set("Accept", "application/vnd.github.v3+json")

			resp, err := client.Do(req)
			if err != nil {
				repoErrChan <- err
				return
			}
			defer resp.Body.Close()

			if resp.StatusCode != http.StatusOK {
				// Ignora erros de repositório (ex: 404 se foi deletado)
				return
			}

			var details RepositoryDetails
			if err := json.NewDecoder(resp.Body).Decode(&details); err != nil {
				repoErrChan <- err
				return
			}
			details.Description = url
			repoDetailsChan <- &details
		}(repoURL)
	}

	repoWg.Wait()
	close(repoDetailsChan)
	close(repoErrChan)

	for err := range repoErrChan {
		log.Printf("⚠️ Erro durante a busca de detalhes do repositório: %v\n", err)
	}

	for details := range repoDetailsChan {
		repoDetailsMap[details.Description] = details // Mapeia URL -> Detalhes
	}

	for i := range allIssues {
		if details, ok := repoDetailsMap[allIssues[i].RepositoryURL]; ok {
			allIssues[i].RepoStars = details.StargazersCount
			allIssues[i].RepoForks = details.ForksCount
			allIssues[i].OpenIssuesCount = details.OpenIssuesCount
		}
	}

	log.Println("Enriquecimento de dados concluído. Salvando no banco...")

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
