package models

// Element represents a character's element type
type Element struct {
	ID      int    `gorm:"primaryKey;autoIncrement" json:"id"`
	Name    string `gorm:"uniqueIndex;not null;size:50" json:"name"`
	IconURL string `gorm:"size:255" json:"iconUrl"`

	// Relations
	Characters []Character `gorm:"foreignKey:ElementID" json:"characters,omitempty"`
}

// Path represents a character's path
type Path struct {
	ID      int    `gorm:"primaryKey;autoIncrement" json:"id"`
	Name    string `gorm:"uniqueIndex;not null;size:50" json:"name"`
	IconURL string `gorm:"size:255" json:"iconUrl"`

	// Relations
	Characters []Character `gorm:"foreignKey:PathID" json:"characters,omitempty"`
}

// Character represents a playable game character
type Character struct {
	ID           string `gorm:"primaryKey;size:50" json:"id"`
	CharID       string `gorm:"uniqueIndex;not null;size:10" json:"charId"`
	Name         string `gorm:"not null;size:100" json:"name"`
	ElementID    int    `gorm:"not null;index" json:"elementId"`
	PathID       int    `gorm:"not null;index" json:"pathId"`
	Rarity       int    `gorm:"not null;default:4" json:"rarity"`
	BaseSpeed    int    `gorm:"not null;default:100" json:"baseSpeed"`
	ReleaseOrder int    `gorm:"not null;default:0;index" json:"releaseOrder"`

	// Relations
	Element        Element         `gorm:"foreignKey:ElementID" json:"element,omitempty"`
	Path           Path            `gorm:"foreignKey:PathID" json:"path,omitempty"`
	Skills         *CharacterSkill `gorm:"foreignKey:CharacterID" json:"skills,omitempty"`
	Build          *CharacterBuild `gorm:"foreignKey:CharacterID" json:"build,omitempty"`
	UserCharacters []UserCharacter `gorm:"foreignKey:CharacterID" json:"-"`
}

// CharacterSkill contains skill multipliers and stats for a character
type CharacterSkill struct {
	ID              int     `gorm:"primaryKey;autoIncrement" json:"id"`
	CharacterID     string  `gorm:"uniqueIndex;not null;size:50" json:"characterId"`
	BasicMultiplier float64 `gorm:"type:decimal(4,2);default:1.0" json:"basicMultiplier"`
	SkillMultiplier float64 `gorm:"type:decimal(4,2);default:1.0" json:"skillMultiplier"`
	UltMultiplier   float64 `gorm:"type:decimal(4,2);default:2.0" json:"ultMultiplier"`
	BasicEnergy     int     `gorm:"default:20" json:"basicEnergy"`
	SkillEnergy     int     `gorm:"default:30" json:"skillEnergy"`
	UltCost         int     `gorm:"default:120" json:"ultCost"`
	UltType         string  `gorm:"size:20;default:'normal'" json:"ultType"`
	Passive         string  `gorm:"type:text" json:"passive"`
	BaseAtk         int     `gorm:"default:500" json:"baseAtk"`
	BaseCritRate    float64 `gorm:"type:decimal(4,2);default:0.05" json:"baseCritRate"`
	BaseCritDmg     float64 `gorm:"type:decimal(4,2);default:0.50" json:"baseCritDmg"`

	// Relations
	Character Character `gorm:"foreignKey:CharacterID" json:"-"`
}

// CharacterBuild contains recommended build for a character
type CharacterBuild struct {
	ID          int    `gorm:"primaryKey;autoIncrement" json:"id"`
	CharacterID string `gorm:"uniqueIndex;not null;size:50" json:"characterId"`
	BodyMain    string `gorm:"size:50" json:"bodyMain"`
	FeetMain    string `gorm:"size:50" json:"feetMain"`
	OrbMain     string `gorm:"size:50" json:"orbMain"`
	RopeMain    string `gorm:"size:50" json:"ropeMain"`

	// Relations
	Character Character               `gorm:"foreignKey:CharacterID" json:"-"`
	Sets      []CharacterBuildSet     `gorm:"foreignKey:BuildID" json:"sets,omitempty"`
	Substats  []CharacterBuildSubstat `gorm:"foreignKey:BuildID" json:"substats,omitempty"`
}

// RelicSet represents a relic/planar set
type RelicSet struct {
	ID   int    `gorm:"primaryKey;autoIncrement" json:"id"`
	Name string `gorm:"uniqueIndex;not null;size:100" json:"name"`
	Type string `gorm:"size:20" json:"type"` // "relic" or "planar"
}

// CharacterBuildSet links builds to recommended relic sets
type CharacterBuildSet struct {
	ID         int `gorm:"primaryKey;autoIncrement" json:"id"`
	BuildID    int `gorm:"not null;index" json:"buildId"`
	RelicSetID int `gorm:"not null;index" json:"relicSetId"`
	Priority   int `gorm:"default:1" json:"priority"`

	// Relations
	Build    CharacterBuild `gorm:"foreignKey:BuildID" json:"-"`
	RelicSet RelicSet       `gorm:"foreignKey:RelicSetID" json:"relicSet,omitempty"`
}

// CharacterBuildSubstat contains substat priorities for a build
type CharacterBuildSubstat struct {
	ID       int     `gorm:"primaryKey;autoIncrement" json:"id"`
	BuildID  int     `gorm:"not null;index" json:"buildId"`
	StatName string  `gorm:"not null;size:50" json:"statName"`
	Weight   float64 `gorm:"type:decimal(3,2);default:0.5" json:"weight"`

	// Relations
	Build CharacterBuild `gorm:"foreignKey:BuildID" json:"-"`
}
