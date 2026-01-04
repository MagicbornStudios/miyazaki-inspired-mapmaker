# GAME SUMMARY & STYLE GUIDE

*(Authoritative reference for humans and AI agents)*

---

## 1. Game Summary

### Working Genre

**Turn-Based Competitive Drag Racing Card Game**

### Core Fantasy

Players pilot **enchanted vehicles** along a ritual track.
Progress is determined not by reflexes, but by **sequencing spells**, managing **health and mana**, and anticipating an opponent’s **four-step plan** each round.

The race is a **ceremonial contest**—a controlled release of magic across stone and root, not a chaotic battlefield.

---

## 2. Core Gameplay Loop

### Match Structure

* Multiplayer, 1v1
* Fixed-length race
* **4 rounds total**
* Each round resolves **exactly 4 beats**

### Per-Round Flow

1. Players draw/refresh resources
2. Players secretly arrange **4 cards** into a **Play Line**
3. Cards lock simultaneously
4. Resolution phase:

   * Slot 1 resolves (both players)
   * Slot 2 resolves
   * Slot 3 resolves
   * Slot 4 resolves
5. Cars advance based on cumulative effects
6. Status effects tick
7. Next round begins

### Strategic Emphasis

* Sequencing > reaction
* Resource timing > raw power
* Anticipation > surprise

---

## 3. Health & Mana Systems

### Health

* Represents:

  * Structural integrity
  * Magical cohesion
  * Control over the vehicle
* **When Health reaches 0:**

  * The vehicle **cannot gain distance**
  * It is stalled / grounded
* Some effects or statuses may **temporarily override this rule**

### Mana

* Represents stored magical energy
* Used to:

  * Power movement
  * Break restraints
  * Override physical limits
* Mana can allow action **even at 0 health**, depending on effects

### Design Rule

> Health governs *stability*. Mana governs *will*.

---

## 4. Player Perspective & Presentation

### Camera / View

* Rear-facing, forward-looking
* Track extends into the distance
* Opponent visible in parallel lane

### UX Intent

* Reinforce progress and pressure
* Always communicate:

  * “How far ahead am I?”
  * “What is resolving next?”

---

## 5. Visual Style Pillars

### This Game IS

* Dark
* Ethereal
* Woodsy
* Magical
* Stone- and crystal-based
* Ritualistic
* Calm but dangerous

### This Game IS NOT

* Gothic
* Grimdark
* Industrial
* Steampunk
* Metallic
* Violent-first
* Spiky or aggressive

### Emotional Tone

* Ancient
* Focused
* Controlled
* Reverent
* Quietly powerful

---

## 6. Material & Environmental Language

### Materials

* Weathered stone
* Moss
* Roots
* Bark
* Crystal veins
* Rune-etched slabs

### Shapes

* Circles
* Arcs
* Grooves
* Carved symmetry
* Layered planes

### Motion Language

* Flowing energy
* Pulsing light
* Slow reveals
* No explosions unless explicitly magical

---

## 7. Color Palette (Authoritative)

### Primary Neutrals (UI / Background)

* **Void Bark** — `#0E1110`
  Near-black with green undertone
* **Deep Stone** — `#1A1F1C`
  Primary background
* **Moss Shadow** — `#232B27`
  Secondary panels and frames

### Magical Accents

* **Ethereal Teal** — `#5FA8A0`
  Mana, active magic
* **Crystal Violet** — `#8B7FC7`
  Runes, rare effects
* **Fungal Amber** — `#C79A4A`
  Focus states, turn indicators

### Natural Highlights

* **Moonleaf Green** — `#7FAF8A`
  Healing, stability
* **Ashwood Brown** — `#6A5642`
  Borders, inactive UI

### Negative / Warning (Use Sparingly)

* **Withered Red** — `#8E3A3A`
  Damage, decay (muted)
* **Void Indigo** — `#3A3F5C`
  Immobilization, silence

---

## 8. Typography Guidance

### Titles / Headings

* Serif or rune-inspired
* Soft edges
* High readability

### Body / Card Text

* Clean sans-serif
* Neutral tone
* No decorative distortion

### Avoid

* Blackletter
* Sharp angular fonts
* Horror typography

---

## 9. Card Design Philosophy

### Cards Represent

* Ritual actions
* Spell steps
* Mechanical intentions

### Card Mechanics

* Cards always resolve **in order**
* Target types are explicit:

  * Self
  * Opponent
  * All
* Effects are deterministic and testable

### Card Aesthetic

* Carved frames
* Subtle glow
* No aggressive imagery

---

## 10. VFX & Animation Rules

### Preferred Effects

* Pulses
* Trails
* Glyph activations
* Light flowing along runes

### Avoid

* Screen shake abuse
* Particle spam
* Explosive shockwaves
* Flashy damage numbers

---

## 11. AI Agent Instructions (Critical)

### When Generating Content

An AI agent **must**:

* Follow the color palette
* Avoid gothic or industrial motifs
* Emphasize sequencing and ritual timing
* Treat cards as steps in a process, not attacks

### One-Sentence Rule

> “Everything exists as part of an ancient forest-bound ritual conducted at night using stone, crystal, and quiet magic.”

---

## 12. Enforcement Notes (for Devs)

* UI colors must map to semantic meaning (mana ≠ damage)
* Effects must be readable without sound
* Cards must be understandable in isolation
* Visual intensity should scale with importance, not frequency

---

## 13. File Usage Recommendation

Place this file at:

```
/STYLEGUIDE.md
```

Reference it explicitly in:

* AI prompts
* Asset generation tasks
* UI reviews
* Card design discussions
