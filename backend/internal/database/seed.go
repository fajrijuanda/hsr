package database

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path/filepath"

	"github.com/hsr-tools/backend/internal/models"
)

// CharacterJSON represents the JSON structure for characters
type CharacterJSON struct {
	ID           string `json:"id"`
	CharID       string `json:"charId"`
	Name         string `json:"name"`
	Path         string `json:"path"`
	Element      string `json:"element"`
	Rarity       int    `json:"rarity"`
	BaseSpeed    int    `json:"baseSpeed"`
	ReleaseOrder int    `json:"releaseOrder"`
}

// SkillJSON represents the JSON structure for skills
type SkillJSON struct {
	BasicMultiplier float64 `json:"basicMultiplier"`
	SkillMultiplier float64 `json:"skillMultiplier"`
	UltMultiplier   float64 `json:"ultMultiplier"`
	BasicEnergy     int     `json:"basicEnergy"`
	SkillEnergy     int     `json:"skillEnergy"`
	UltCost         int     `json:"ultCost"`
	UltType         string  `json:"ultType"`
	Passive         string  `json:"passive"`
	BaseAtk         int     `json:"baseAtk"`
	BaseCritRate    float64 `json:"baseCritRate"`
	BaseCritDmg     float64 `json:"baseCritDmg"`
}

// BuildJSON represents the JSON structure for builds
type BuildJSON struct {
	Name      string             `json:"name"`
	Substats  map[string]float64 `json:"substats"`
	MainStats struct {
		Body string `json:"body"`
		Feet string `json:"feet"`
		Orb  string `json:"orb"`
		Rope string `json:"rope"`
	} `json:"mainStats"`
	Sets []string `json:"sets"`
}

func Seed(dataPath string) error {
	log.Println("🌱 Starting database seeding...")

	// Seed elements
	if err := seedElements(); err != nil {
		return fmt.Errorf("failed to seed elements: %w", err)
	}

	// Seed paths
	if err := seedPaths(); err != nil {
		return fmt.Errorf("failed to seed paths: %w", err)
	}

	// Seed characters from JSON
	if err := seedCharacters(dataPath); err != nil {
		return fmt.Errorf("failed to seed characters: %w", err)
	}

	// Seed skills from JSON
	if err := seedSkills(dataPath); err != nil {
		return fmt.Errorf("failed to seed skills: %w", err)
	}

	// Seed builds from JSON
	if err := seedBuilds(dataPath); err != nil {
		return fmt.Errorf("failed to seed builds: %w", err)
	}

	log.Println("✅ Database seeding completed")
	return nil
}

func seedElements() error {
	elements := []models.Element{
		{Name: "Physical", IconURL: "https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/element/Physical.png"},
		{Name: "Fire", IconURL: "https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/element/Fire.png"},
		{Name: "Ice", IconURL: "https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/element/Ice.png"},
		{Name: "Lightning", IconURL: "https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/element/Thunder.png"},
		{Name: "Wind", IconURL: "https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/element/Wind.png"},
		{Name: "Quantum", IconURL: "https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/element/Quantum.png"},
		{Name: "Imaginary", IconURL: "https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/element/Imaginary.png"},
	}

	for _, elem := range elements {
		result := DB.Where("name = ?", elem.Name).FirstOrCreate(&elem)
		if result.Error != nil {
			return result.Error
		}
	}
	log.Printf("   ✓ Seeded %d elements", len(elements))
	return nil
}

func seedPaths() error {
	paths := []models.Path{
		{Name: "Destruction", IconURL: "https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/path/Destruction.png"},
		{Name: "The Hunt", IconURL: "https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/path/Hunt.png"},
		{Name: "Erudition", IconURL: "https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/path/Erudition.png"},
		{Name: "Harmony", IconURL: "https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/path/Harmony.png"},
		{Name: "Nihility", IconURL: "https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/path/Nihility.png"},
		{Name: "Preservation", IconURL: "https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/path/Preservation.png"},
		{Name: "Abundance", IconURL: "https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/path/Abundance.png"},
		{Name: "Remembrance", IconURL: "https://raw.githubusercontent.com/Mar-7th/StarRailRes/master/icon/path/Remembrance.png"},
	}

	for _, p := range paths {
		result := DB.Where("name = ?", p.Name).FirstOrCreate(&p)
		if result.Error != nil {
			return result.Error
		}
	}
	log.Printf("   ✓ Seeded %d paths", len(paths))
	return nil
}

func seedCharacters(dataPath string) error {
	file, err := os.ReadFile(filepath.Join(dataPath, "characters.json"))
	if err != nil {
		return fmt.Errorf("failed to read characters.json: %w", err)
	}

	var characters []CharacterJSON
	if err := json.Unmarshal(file, &characters); err != nil {
		return fmt.Errorf("failed to parse characters.json: %w", err)
	}

	// Get element and path maps
	elementMap := make(map[string]int)
	pathMap := make(map[string]int)

	var elements []models.Element
	DB.Find(&elements)
	for _, e := range elements {
		elementMap[e.Name] = e.ID
	}

	var paths []models.Path
	DB.Find(&paths)
	for _, p := range paths {
		pathMap[p.Name] = p.ID
	}

	count := 0
	for _, c := range characters {
		elementID, ok := elementMap[c.Element]
		if !ok {
			log.Printf("   ⚠ Unknown element '%s' for character '%s'", c.Element, c.Name)
			continue
		}

		pathID, ok := pathMap[c.Path]
		if !ok {
			log.Printf("   ⚠ Unknown path '%s' for character '%s'", c.Path, c.Name)
			continue
		}

		char := models.Character{
			ID:           c.ID,
			CharID:       c.CharID,
			Name:         c.Name,
			ElementID:    elementID,
			PathID:       pathID,
			Rarity:       c.Rarity,
			BaseSpeed:    c.BaseSpeed,
			ReleaseOrder: c.ReleaseOrder,
		}

		result := DB.Where("id = ?", char.ID).Assign(char).FirstOrCreate(&char)
		if result.Error != nil {
			log.Printf("   ⚠ Failed to seed character '%s': %v", c.Name, result.Error)
			continue
		}
		count++
	}

	log.Printf("   ✓ Seeded %d characters", count)
	return nil
}

func seedSkills(dataPath string) error {
	file, err := os.ReadFile(filepath.Join(dataPath, "skills.json"))
	if err != nil {
		return fmt.Errorf("failed to read skills.json: %w", err)
	}

	var skillsMap map[string]SkillJSON
	if err := json.Unmarshal(file, &skillsMap); err != nil {
		return fmt.Errorf("failed to parse skills.json: %w", err)
	}

	count := 0
	for charID, s := range skillsMap {
		// Check if character exists
		var char models.Character
		if DB.Where("id = ?", charID).First(&char).Error != nil {
			continue // Skip if character doesn't exist
		}

		skill := models.CharacterSkill{
			CharacterID:     charID,
			BasicMultiplier: s.BasicMultiplier,
			SkillMultiplier: s.SkillMultiplier,
			UltMultiplier:   s.UltMultiplier,
			BasicEnergy:     s.BasicEnergy,
			SkillEnergy:     s.SkillEnergy,
			UltCost:         s.UltCost,
			UltType:         s.UltType,
			Passive:         s.Passive,
			BaseAtk:         s.BaseAtk,
			BaseCritRate:    s.BaseCritRate,
			BaseCritDmg:     s.BaseCritDmg,
		}

		result := DB.Where("character_id = ?", charID).Assign(skill).FirstOrCreate(&skill)
		if result.Error != nil {
			log.Printf("   ⚠ Failed to seed skill for '%s': %v", charID, result.Error)
			continue
		}
		count++
	}

	log.Printf("   ✓ Seeded %d character skills", count)
	return nil
}

func seedBuilds(dataPath string) error {
	file, err := os.ReadFile(filepath.Join(dataPath, "optimal-builds.json"))
	if err != nil {
		return fmt.Errorf("failed to read optimal-builds.json: %w", err)
	}

	var buildsMap map[string]BuildJSON
	if err := json.Unmarshal(file, &buildsMap); err != nil {
		return fmt.Errorf("failed to parse optimal-builds.json: %w", err)
	}

	count := 0
	for charID, b := range buildsMap {
		// Check if character exists
		var char models.Character
		if DB.Where("id = ?", charID).First(&char).Error != nil {
			continue
		}

		build := models.CharacterBuild{
			CharacterID: charID,
			BodyMain:    b.MainStats.Body,
			FeetMain:    b.MainStats.Feet,
			OrbMain:     b.MainStats.Orb,
			RopeMain:    b.MainStats.Rope,
		}

		result := DB.Where("character_id = ?", charID).Assign(build).FirstOrCreate(&build)
		if result.Error != nil {
			log.Printf("   ⚠ Failed to seed build for '%s': %v", charID, result.Error)
			continue
		}

		// Seed substats
		for stat, weight := range b.Substats {
			substat := models.CharacterBuildSubstat{
				BuildID:  build.ID,
				StatName: stat,
				Weight:   weight,
			}
			DB.Where("build_id = ? AND stat_name = ?", build.ID, stat).Assign(substat).FirstOrCreate(&substat)
		}

		// Seed recommended sets
		for i, setName := range b.Sets {
			var set models.RelicSet
			DB.Where("name = ?", setName).FirstOrCreate(&set, models.RelicSet{Name: setName})

			buildSet := models.CharacterBuildSet{
				BuildID:    build.ID,
				RelicSetID: set.ID,
				Priority:   i + 1,
			}
			DB.Where("build_id = ? AND relic_set_id = ?", build.ID, set.ID).Assign(buildSet).FirstOrCreate(&buildSet)
		}

		count++
	}

	log.Printf("   ✓ Seeded %d character builds", count)
	return nil
}
