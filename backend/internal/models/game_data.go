package models

import "time"

// Banner represents a character/weapon banner
type Banner struct {
	ID        int       `gorm:"primaryKey;autoIncrement" json:"id"`
	Name      string    `gorm:"not null;size:200" json:"name"`
	Type      string    `gorm:"size:50" json:"type"` // "character", "weapon", "standard"
	StartDate time.Time `gorm:"not null;index" json:"startDate"`
	EndDate   time.Time `gorm:"not null;index" json:"endDate"`
	ImageURL  string    `gorm:"size:500" json:"imageUrl"`

	// Relations
	Characters []BannerCharacter `gorm:"foreignKey:BannerID" json:"characters,omitempty"`
}

// BannerCharacter links banners to featured characters
type BannerCharacter struct {
	ID          int    `gorm:"primaryKey;autoIncrement" json:"id"`
	BannerID    int    `gorm:"not null;index" json:"bannerId"`
	CharacterID string `gorm:"not null;size:50;index" json:"characterId"`
	IsFeatured  bool   `gorm:"default:false" json:"isFeatured"`

	// Relations
	Banner    Banner    `gorm:"foreignKey:BannerID" json:"-"`
	Character Character `gorm:"foreignKey:CharacterID" json:"character,omitempty"`
}

// Code represents a redemption code
type Code struct {
	ID        int        `gorm:"primaryKey;autoIncrement" json:"id"`
	Code      string     `gorm:"uniqueIndex;not null;size:50" json:"code"`
	Rewards   string     `gorm:"type:text" json:"rewards"`
	IsActive  bool       `gorm:"default:true;index" json:"isActive"`
	ExpiresAt *time.Time `gorm:"index" json:"expiresAt"`
	CreatedAt time.Time  `json:"createdAt"`
}

// Event represents a game event
type Event struct {
	ID          int       `gorm:"primaryKey;autoIncrement" json:"id"`
	Name        string    `gorm:"not null;size:200" json:"name"`
	Type        string    `gorm:"size:50" json:"type"`
	Description string    `gorm:"type:text" json:"description"`
	StartDate   time.Time `gorm:"not null;index" json:"startDate"`
	EndDate     time.Time `gorm:"not null;index" json:"endDate"`
	ImageURL    string    `gorm:"size:500" json:"imageUrl"`
}
