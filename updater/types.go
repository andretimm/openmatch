package main

import "time"

// Label (sem alterações)
type Label struct {
	Name  string `json:"name"`
	Color string `json:"color"` // <<<< CAMPO NOVO
}

// IssueToUpdate (sem alterações)
type IssueToUpdate struct {
	ID     int64
	NodeID string
}

// UpdatedInfo agora inclui o AssigneeCount (contador de atribuídos).
type UpdatedInfo struct {
	ID            string
	Title         string
	State         string
	Labels        []Label
	UpdatedAt     time.Time
	AssigneeCount int // <<<< NOVO CAMPO
}
