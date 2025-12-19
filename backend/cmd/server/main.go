package main

import (
	"log"
	"os"
	"path/filepath"

	"github.com/gin-gonic/gin"
	"github.com/hsr-tools/backend/internal/config"
	"github.com/hsr-tools/backend/internal/database"
	"github.com/hsr-tools/backend/internal/handlers"
	"github.com/hsr-tools/backend/internal/middleware"
)

func main() {
	// Load configuration
	cfg := config.Load()

	// Connect to database
	if err := database.Connect(cfg); err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer database.Close()

	// Check for command line arguments
	if len(os.Args) > 1 {
		switch os.Args[1] {
		case "migrate":
			if err := database.Migrate(); err != nil {
				log.Fatalf("Migration failed: %v", err)
			}
			log.Println("✅ Migration completed successfully!")
			return

		case "seed":
			// First run migrations
			if err := database.Migrate(); err != nil {
				log.Fatalf("Migration failed: %v", err)
			}

			// Get data path (relative to frontend)
			dataPath := getDataPath()
			if err := database.Seed(dataPath); err != nil {
				log.Fatalf("Seeding failed: %v", err)
			}
			log.Println("✅ Seeding completed successfully!")
			return

		case "fresh":
			// Drop all tables and re-migrate
			log.Println("🗑️ Dropping all tables...")
			if err := dropAllTables(); err != nil {
				log.Fatalf("Failed to drop tables: %v", err)
			}

			if err := database.Migrate(); err != nil {
				log.Fatalf("Migration failed: %v", err)
			}

			dataPath := getDataPath()
			if err := database.Seed(dataPath); err != nil {
				log.Fatalf("Seeding failed: %v", err)
			}
			log.Println("✅ Fresh migration and seeding completed!")
			return
		}
	}

	// Run migrations on startup
	if err := database.Migrate(); err != nil {
		log.Fatalf("Migration failed: %v", err)
	}

	// Setup Gin router
	if cfg.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.Default()

	// Apply middleware
	r.Use(middleware.CORS())

	// Setup routes
	api := r.Group("/api")
	{
		// Health check
		api.GET("/health", func(c *gin.Context) {
			c.JSON(200, gin.H{"status": "ok", "message": "HSR Tools API is running"})
		})

		// Auth routes
		auth := api.Group("/auth")
		{
			auth.POST("/register", handlers.Register)
			auth.POST("/login", handlers.Login)
			auth.POST("/refresh", handlers.RefreshToken)
		}

		// User routes (protected)
		users := api.Group("/users")
		users.Use(middleware.Auth())
		{
			users.GET("/me", handlers.GetCurrentUser)
			users.PATCH("/uid", handlers.SetUID)
			users.GET("/characters", handlers.GetUserCharacters)
			users.POST("/characters", handlers.AddUserCharacter)
			users.PATCH("/characters/:id", handlers.UpdateUserCharacter)
			users.DELETE("/characters/:id", handlers.DeleteUserCharacter)
		}

		// Public game data routes
		api.GET("/characters", handlers.GetCharacters)
		api.GET("/characters/:id", handlers.GetCharacterByID)
		api.GET("/banners", handlers.GetBanners)
		api.GET("/codes", handlers.GetCodes)
		api.GET("/events", handlers.GetEvents)
		api.GET("/mihomo/:uid", handlers.GetMihomoProfile)
	}

	// Start server
	log.Printf("🚀 Server starting on port %s", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

func getDataPath() string {
	// Try to find data path relative to current directory
	candidates := []string{
		"../src/data", // When running from backend/
		"src/data",    // When running from project root
		"data",        // Local data folder
	}

	for _, path := range candidates {
		absPath, _ := filepath.Abs(path)
		if _, err := os.Stat(filepath.Join(absPath, "characters.json")); err == nil {
			return absPath
		}
	}

	// Default fallback
	return "../src/data"
}

func dropAllTables() error {
	tables := []string{
		"user_characters",
		"banner_characters",
		"character_build_substats",
		"character_build_sets",
		"character_builds",
		"character_skills",
		"characters",
		"relic_sets",
		"paths",
		"elements",
		"banners",
		"codes",
		"events",
		"users",
	}

	for _, table := range tables {
		if err := database.DB.Exec("DROP TABLE IF EXISTS " + table + " CASCADE").Error; err != nil {
			log.Printf("Warning: Failed to drop table %s: %v", table, err)
		}
	}
	return nil
}
