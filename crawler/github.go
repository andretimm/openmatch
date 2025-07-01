package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"sync"
)

var (
	githubToken = ""
	client      = &http.Client{}
)

func fetchIssuesForLanguage(lang, sinceTimestamp string, wg *sync.WaitGroup, issueChan chan<- []Issue, errChan chan<- error) {
	defer wg.Done()

	query := fmt.Sprintf(`label:"good first issue","help wanted","documentation","beginner","easy","first-timers-only","beginner friendly" is:issue is:open no:assignee -linked:pr language:%s created:>%s`, lang, sinceTimestamp)
	searchURL := fmt.Sprintf("https://api.github.com/search/issues?q=%s&sort=created&order=asc&per_page=100", url.QueryEscape(query))

	req, err := http.NewRequest("GET", searchURL, nil)
	if err != nil {
		errChan <- fmt.Errorf("erro ao criar requisição para %s: %w", lang, err)
		return
	}
	req.Header.Set("Authorization", "token "+githubToken)
	req.Header.Set("Accept", "application/vnd.github.v3+json")

	resp, err := client.Do(req)
	if err != nil {
		errChan <- fmt.Errorf("erro ao fazer requisição para %s: %w", lang, err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		errChan <- fmt.Errorf("API do GitHub retornou status %d para %s", resp.StatusCode, lang)
		return
	}

	var result SearchResult
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		errChan <- fmt.Errorf("erro ao decodificar JSON para %s: %w", lang, err)
		return
	}

	for i := range result.Items {
		result.Items[i].Language = lang
	}

	var issuesWithDescription []Issue
	for _, issue := range result.Items {
		if issue.Body != "" {
			issuesWithDescription = append(issuesWithDescription, issue)
		}
	}

	fmt.Printf("Encontradas %d issues para a linguagem %s.\n", len(issuesWithDescription), lang)

	issueChan <- issuesWithDescription
}
