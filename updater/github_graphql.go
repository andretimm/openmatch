package main

import (
	"context"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/shurcooL/graphql"
)

var (
	githubToken string
)

type FragmentIssue struct {
	ID        graphql.ID `graphql:"id"`
	Title     graphql.String
	State     graphql.String
	UpdatedAt time.Time
	Labels    struct {
		Nodes []struct {
			Name  graphql.String
			Color graphql.String
		}
	} `graphql:"labels(first:10)"`
	Assignees struct {
		TotalCount graphql.Int
	} `graphql:"assignees(first:1)"`
	Repository struct {
		StargazerCount graphql.Int
		ForkCount      graphql.Int
		OpenIssues     struct {
			TotalCount graphql.Int
		} `graphql:"issues(states: [OPEN])"`
	} `graphql:"repository"`
}

type NodesQuery struct {
	Nodes []struct {
		Issue FragmentIssue `graphql:"... on Issue"`
	} `graphql:"nodes(ids: $ids)"`
}

func fetchUpdatesFromGitHubGraphQL(ctx context.Context, nodeIDs []graphql.ID) ([]UpdatedInfo, error) {
	if len(nodeIDs) == 0 {
		return nil, nil
	}

	client := graphql.NewClient("https://api.github.com/graphql", &http.Client{
		Transport: &authTransport{Token: githubToken},
	})

	variables := map[string]interface{}{
		"ids": nodeIDs,
	}

	var query NodesQuery
	err := client.Query(ctx, &query, variables)
	if err != nil {
		return nil, fmt.Errorf("erro ao executar a query GraphQL: %w", err)
	}

	var updatedInfos []UpdatedInfo
	for _, node := range query.Nodes {
		if node.Issue.ID == nil {
			continue
		}

		var labelsToSave []Label
		for _, l := range node.Issue.Labels.Nodes {
			labelsToSave = append(labelsToSave, Label{Name: string(l.Name), Color: string(l.Color)})
		}

		updatedInfos = append(updatedInfos, UpdatedInfo{
			ID:                  fmt.Sprintf("%v", node.Issue.ID),
			Title:               string(node.Issue.Title),
			State:               strings.ToLower(string(node.Issue.State)),
			Labels:              labelsToSave,
			UpdatedAt:           node.Issue.UpdatedAt,
			AssigneeCount:       int(node.Issue.Assignees.TotalCount),
			RepoStars:           int(node.Issue.Repository.StargazerCount),
			RepoForks:           int(node.Issue.Repository.ForkCount),
			RepoOpenIssuesCount: int(node.Issue.Repository.OpenIssues.TotalCount),
		})
	}

	return updatedInfos, nil
}

type authTransport struct {
	Token string
}

func (t *authTransport) RoundTrip(req *http.Request) (*http.Response, error) {
	req.Header.Set("Authorization", "Bearer "+t.Token)
	return http.DefaultTransport.RoundTrip(req)
}
