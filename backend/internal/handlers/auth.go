package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/hsr-tools/backend/internal/database"
	"github.com/hsr-tools/backend/internal/models"
	"github.com/hsr-tools/backend/pkg/utils"
	"golang.org/x/crypto/bcrypt"
)

type RegisterRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
	Name     string `json:"name" binding:"required"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type AuthResponse struct {
	Token        string      `json:"token"`
	RefreshToken string      `json:"refreshToken"`
	User         models.User `json:"user"`
}

func Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if email already exists
	var existing models.User
	if database.DB.Where("email = ?", req.Email).First(&existing).Error == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Email already registered"})
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	user := models.User{
		Email:        req.Email,
		PasswordHash: string(hashedPassword),
		Name:         req.Name,
	}

	if err := database.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	// Generate tokens
	token, _ := utils.GenerateToken(user.ID, user.Email)
	refreshToken, _ := utils.GenerateRefreshToken(user.ID, user.Email)

	c.JSON(http.StatusCreated, AuthResponse{
		Token:        token,
		RefreshToken: refreshToken,
		User:         user,
	})
}

func Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if err := database.DB.Where("email = ?", req.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	token, _ := utils.GenerateToken(user.ID, user.Email)
	refreshToken, _ := utils.GenerateRefreshToken(user.ID, user.Email)

	c.JSON(http.StatusOK, AuthResponse{
		Token:        token,
		RefreshToken: refreshToken,
		User:         user,
	})
}

func RefreshToken(c *gin.Context) {
	var req struct {
		RefreshToken string `json:"refreshToken" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	claims, err := utils.ValidateToken(req.RefreshToken)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid refresh token"})
		return
	}

	token, _ := utils.GenerateToken(claims.UserID, claims.Email)
	refreshToken, _ := utils.GenerateRefreshToken(claims.UserID, claims.Email)

	c.JSON(http.StatusOK, gin.H{
		"token":        token,
		"refreshToken": refreshToken,
	})
}

func GetCurrentUser(c *gin.Context) {
	userID, _ := c.Get("userID")

	var user models.User
	if err := database.DB.Preload("Characters.Character").Where("id = ?", userID).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, user)
}

func SetUID(c *gin.Context) {
	userID, _ := c.Get("userID")

	var req struct {
		UID      string `json:"uid"`
		Nickname string `json:"nickname"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if err := database.DB.Where("id = ?", userID).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	user.UID = req.UID
	user.Nickname = req.Nickname

	if err := database.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update UID"})
		return
	}

	c.JSON(http.StatusOK, user)
}

func GetUserCharacters(c *gin.Context) {
	userID, _ := c.Get("userID")

	var characters []models.UserCharacter
	database.DB.Preload("Character.Element").Preload("Character.Path").
		Where("user_id = ?", userID).Find(&characters)

	c.JSON(http.StatusOK, characters)
}

func AddUserCharacter(c *gin.Context) {
	userID, _ := c.Get("userID")
	uid := userID.(uuid.UUID)

	var req struct {
		CharacterID string `json:"characterId" binding:"required"`
		Eidolon     int    `json:"eidolon"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check character exists
	var char models.Character
	if database.DB.Where("id = ?", req.CharacterID).First(&char).Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Character not found"})
		return
	}

	userChar := models.UserCharacter{
		UserID:      uid,
		CharacterID: req.CharacterID,
		Eidolon:     req.Eidolon,
	}

	// Upsert
	result := database.DB.Where("user_id = ? AND character_id = ?", uid, req.CharacterID).
		Assign(userChar).FirstOrCreate(&userChar)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add character"})
		return
	}

	c.JSON(http.StatusCreated, userChar)
}

func UpdateUserCharacter(c *gin.Context) {
	userID, _ := c.Get("userID")
	charID := c.Param("id")

	var req struct {
		Eidolon int `json:"eidolon"`
		Level   int `json:"level"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result := database.DB.Model(&models.UserCharacter{}).
		Where("user_id = ? AND character_id = ?", userID, charID).
		Updates(map[string]interface{}{"eidolon": req.Eidolon, "level": req.Level})

	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Character not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Updated successfully"})
}

func DeleteUserCharacter(c *gin.Context) {
	userID, _ := c.Get("userID")
	charID := c.Param("id")

	result := database.DB.Where("user_id = ? AND character_id = ?", userID, charID).
		Delete(&models.UserCharacter{})

	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Character not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Deleted successfully"})
}
