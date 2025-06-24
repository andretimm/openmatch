package main

import "time"

type SearchResult struct {
	Items []Issue `json:"items"`
}

type Label struct {
	Name  string `json:"name"`
	Color string `json:"color"`
}

type Issue struct {
	ID            int64     `json:"id"`
	NodeID        string    `json:"node_id"`
	URL           string    `json:"html_url"`
	RepositoryURL string    `json:"repository_url"`
	Title         string    `json:"title"`
	Body          string    `json:"body"`
	User          User      `json:"user"`
	State         string    `json:"state"`
	Labels        []Label   `json:"labels"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
	ProjectName   string    `json:"-"`
	Language      string    `json:"-"`
}

type User struct {
	Login string `json:"login"`
}
