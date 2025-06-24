package main

import "time"

type Label struct {
	Name  string `json:"name"`
	Color string `json:"color"`
}

type IssueToUpdate struct {
	ID     int64
	NodeID string
}

type UpdatedInfo struct {
	ID            string
	Title         string
	State         string
	Labels        []Label
	UpdatedAt     time.Time
	AssigneeCount int
}
