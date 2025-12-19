package database

import (
	"fmt"
	"log"

	"github.com/hsr-tools/backend/internal/config"
	"github.com/hsr-tools/backend/internal/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func Connect(cfg *config.Config) error {
	var err error

	logLevel := logger.Info
	if cfg.Environment == "production" {
		logLevel = logger.Warn
	}

	DB, err = gorm.Open(postgres.Open(cfg.DatabaseURL), &gorm.Config{
		Logger: logger.Default.LogMode(logLevel),
	})
	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}

	log.Println("✅ Database connected successfully")
	return nil
}

func Migrate() error {
	log.Println("🔄 Running database migrations...")

	err := DB.AutoMigrate(
		// Core entities
		&models.Element{},
		&models.Path{},
		&models.RelicSet{},

		// Characters
		&models.Character{},
		&models.CharacterSkill{},
		&models.CharacterBuild{},
		&models.CharacterBuildSet{},
		&models.CharacterBuildSubstat{},

		// Users
		&models.User{},
		&models.UserCharacter{},

		// Game data
		&models.Banner{},
		&models.BannerCharacter{},
		&models.Code{},
		&models.Event{},
	)

	if err != nil {
		return fmt.Errorf("migration failed: %w", err)
	}

	// Create unique constraint for user_characters
	DB.Exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_user_character_unique ON user_characters(user_id, character_id)")

	log.Println("✅ Migrations completed successfully")
	return nil
}

func Close() {
	sqlDB, err := DB.DB()
	if err != nil {
		log.Printf("Error getting underlying DB: %v", err)
		return
	}
	sqlDB.Close()
}
