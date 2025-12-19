package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// User represents an authenticated user
type User struct {
	ID            uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Email         string         `gorm:"uniqueIndex;not null" json:"email"`
	PasswordHash  string         `gorm:"" json:"-"`
	Name          string         `gorm:"" json:"name"`
	UID           string         `gorm:"uniqueIndex" json:"uid"`
	Nickname      string         `gorm:"" json:"nickname"`
	EmailVerified bool           `gorm:"default:false" json:"emailVerified"`
	CreatedAt     time.Time      `json:"createdAt"`
	UpdatedAt     time.Time      `json:"updatedAt"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`

	// Relations
	Characters []UserCharacter `gorm:"foreignKey:UserID" json:"characters,omitempty"`
}

// UserCharacter represents a character owned by a user
type UserCharacter struct {
	ID          uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID      uuid.UUID `gorm:"type:uuid;not null;index" json:"userId"`
	CharacterID string    `gorm:"not null;index" json:"characterId"`
	Eidolon     int       `gorm:"default:0" json:"eidolon"`
	Level       int       `gorm:"default:1" json:"level"`
	CreatedAt   time.Time `json:"createdAt"`

	// Relations
	User      User      `gorm:"foreignKey:UserID" json:"-"`
	Character Character `gorm:"foreignKey:CharacterID" json:"character,omitempty"`
}

// Unique constraint for user-character combination
func (UserCharacter) TableName() string {
	return "user_characters"
}

type UserCharacterUnique struct {
	UserID      uuid.UUID `gorm:"uniqueIndex:idx_user_character"`
	CharacterID string    `gorm:"uniqueIndex:idx_user_character"`
}
