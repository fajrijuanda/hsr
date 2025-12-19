package handlers

import (
	"io"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/hsr-tools/backend/internal/database"
	"github.com/hsr-tools/backend/internal/models"
)

type CharacterListResponse struct {
	ID           string `json:"id"`
	CharID       string `json:"charId"`
	Name         string `json:"name"`
	Element      string `json:"element"`
	Path         string `json:"path"`
	Rarity       int    `json:"rarity"`
	BaseSpeed    int    `json:"baseSpeed"`
	ReleaseOrder int    `json:"releaseOrder"`
}

func GetCharacters(c *gin.Context) {
	var characters []models.Character

	query := database.DB.Preload("Element").Preload("Path")

	// Optional filters
	if element := c.Query("element"); element != "" {
		query = query.Joins("JOIN elements ON characters.element_id = elements.id").
			Where("elements.name = ?", element)
	}
	if path := c.Query("path"); path != "" {
		query = query.Joins("JOIN paths ON characters.path_id = paths.id").
			Where("paths.name = ?", path)
	}
	if rarity := c.Query("rarity"); rarity != "" {
		query = query.Where("rarity = ?", rarity)
	}

	// Sorting
	sort := c.DefaultQuery("sort", "release_order")
	order := c.DefaultQuery("order", "desc")
	query = query.Order(sort + " " + order)

	if err := query.Find(&characters).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch characters"})
		return
	}

	// Transform to response format
	response := make([]CharacterListResponse, len(characters))
	for i, char := range characters {
		response[i] = CharacterListResponse{
			ID:           char.ID,
			CharID:       char.CharID,
			Name:         char.Name,
			Element:      char.Element.Name,
			Path:         char.Path.Name,
			Rarity:       char.Rarity,
			BaseSpeed:    char.BaseSpeed,
			ReleaseOrder: char.ReleaseOrder,
		}
	}

	c.JSON(http.StatusOK, response)
}

func GetCharacterByID(c *gin.Context) {
	id := c.Param("id")

	var character models.Character
	if err := database.DB.
		Preload("Element").
		Preload("Path").
		Preload("Skills").
		Preload("Build.Substats").
		Preload("Build.Sets.RelicSet").
		Where("id = ?", id).
		First(&character).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Character not found"})
		return
	}

	c.JSON(http.StatusOK, character)
}

func GetBanners(c *gin.Context) {
	var banners []models.Banner

	// Get active banners by default
	now := time.Now()
	query := database.DB.Preload("Characters.Character")

	if c.Query("active") != "false" {
		query = query.Where("start_date <= ? AND end_date >= ?", now, now)
	}

	if err := query.Order("start_date DESC").Find(&banners).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch banners"})
		return
	}

	c.JSON(http.StatusOK, banners)
}

func GetCodes(c *gin.Context) {
	var codes []models.Code

	query := database.DB

	// Only active by default
	if c.Query("all") != "true" {
		query = query.Where("is_active = ?", true)
	}

	if err := query.Order("created_at DESC").Find(&codes).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch codes"})
		return
	}

	c.JSON(http.StatusOK, codes)
}

func GetEvents(c *gin.Context) {
	var events []models.Event

	now := time.Now()
	query := database.DB

	// Current events by default
	if c.Query("all") != "true" {
		query = query.Where("start_date <= ? AND end_date >= ?", now, now)
	}

	if err := query.Order("start_date DESC").Find(&events).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch events"})
		return
	}

	c.JSON(http.StatusOK, events)
}

func GetMihomoProfile(c *gin.Context) {
	uid := c.Param("uid")

	// Proxy request to Mihomo API
	resp, err := http.Get("https://api.mihomo.me/sr_info_parsed/" + uid + "?lang=en")
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "Failed to fetch from Mihomo API"})
		return
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read response"})
		return
	}

	c.Data(resp.StatusCode, "application/json", body)
}
