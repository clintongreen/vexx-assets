# Country Card Game -- Project Specification (Working Draft)

## Project Principles

-   This is a **board game**, not a country database.
-   The **flag is the hero** of every card.
-   The schema is considered **frozen** unless Clint explicitly approves
    a change.
-   Production mode is the default: generate consistent data, don't
    redesign the game.
-   Never invent asset names or schema changes. If an asset doesn't exist in the repository, use the appropriate blank.png or ask before changing the specification.

------------------------------------------------------------------------

# Asset Structure

    vexx-assets/
    ├── flags/
    ├── colours/
    ├── symbols/
    ├── patterns/
    └── categories/

Current workflow uses **PNG** assets for Figma.

All assets use PNG files hosted from:

https://clintongreen.github.io/vexx-assets/

Flags
flags/{iso2-lowercase}.png

Categories
categories/{filename}.png

Colours
colours/{filename}.png

Patterns
patterns/{filename}.png

Symbols
symbols/{filename}.png

Optional assets use blank.png within their respective folders.

------------------------------------------------------------------------


Asset Rules

Every asset URL must always contain a valid image path.
Optional assets must never have an empty URL.
If an optional asset is not used, reference the appropriate blank.png asset.

Examples:

colours/blank.png
symbols/blank.png
patterns/blank.png
categories/blank.png (if ever applicable)

------------------------------------------------------------------------

# Locked Card Categories

-   Geography
-   Terrain
-   Population
-   Size
-   Language
-   Government
-   Age

**Not card categories**

-   Economy
-   Symbol

Economy may exist only as source data for selecting interesting card
facts.

------------------------------------------------------------------------

# Category Colours

  Category     Hex
  ------------ ---------
  Geography    #B7D4EA
  Terrain      #C7DDB5
  Population   #EFC8D7
  Size         #E8D7B8
  Language     #D8CFE8
  Government   #F4D2B8
  Age          #C8E7DF

------------------------------------------------------------------------

# Locked Flag Colours

-   black
-   navy
-   green
-   blue
-   orange
-   red
-   white
-   yellow

Asset names use **kebab-case**.

------------------------------------------------------------------------

# Locked Symbols

-   castle
-   coat-of-arms
-   crescent
-   cross
-   crown
-   eagle
-   star
-   sun
-   union-jack

------------------------------------------------------------------------

# Locked Patterns

-   canton
-   chevron
-   cross
-   diagonal
-   horizontal-triband
-   saltire
-   vertical-triband

------------------------------------------------------------------------

Symbol Rules

Symbols should only be assigned when they are clearly visible as major elements of the national flag.

Examples:

Brazil → star
Japan → sun
Morocco → star
Switzerland → cross
Norway → cross
Australia → star, union-jack
United Kingdom → union-jack

Do not substitute one symbol for another because it is visually similar.

For example:

Brazil is not a star.
Japan is not a star.

Never infer symbols.

A symbol should only be assigned if it is one of the approved symbols and is clearly visible as a prominent element of the flag. Decorative details or interpretations should not be converted into symbols.

------------------------------------------------------------------------

Pattern Rules

Only the following pattern values are permitted:

canton
chevron
cross
diagonal
horizontal-triband
saltire
vertical-triband

Do not introduce additional patterns such as:

solid
bicolour
circle
emblem
diamond

unless they have first been added to this specification.

------------------------------------------------------------------------

# Description Rules

Descriptions are about **the flag**, not the country.

Examples:

-   Explain the symbolism.
-   Explain the design.
-   Explain the history of the flag.

Do not describe geography, population or general country facts.

Good examples:

symbolism
history of the flag
meaning of colours
meaning of symbols
origin of the design

Do not describe:

geography
economy
population
tourism
famous landmarks

------------------------------------------------------------------------

# Card Data Rules

-   Points remain numeric.
-   Primary/Secondary categories must come from the approved category
    list.
-   Symbols appear only in the symbol fields.
-   Pattern represents the overall flag pattern.
-   Colours represent the visible flag colours.

------------------------------------------------------------------------

# Language Rules

Use a primary or well-known official language.

Do not use:

- Number of official languages
- "Multiple"
- "Various"
- "Several"

Instead use examples such as:

French
English
Spanish
Portuguese
Arabic
Russian
German
Hindi
Japanese
Swahili

South Africa → English
DR Congo → French
Morocco → Arabic
Brazil → Portuguese
Suriname → Dutch
Belize → English

Poor
Language
12 Official Languages

Better
Language
French

Now you can create quests like:

Collect 3 French-speaking countries.
Collect a French-speaking country from Africa.
Collect countries where French is an official language.

The same applies to other categories.

------------------------------------------------------------------------

# Geography Rules

Avoid vague descriptions lie:
Geography
Coastal

Nearly every country is coastal.

Prefer something distinctive.

Island
Archipelago
Landlocked
Peninsula
Transcontinental

------------------------------------------------------------------------

# Terrain Rules

Choose the defining terrain.

Rainforest
Desert
Alps
Steppe
Volcanoes
Coral Atolls
Savanna
Tundra
Glaciers

Not

Mixed terrain
Various
Mountains and plains
Government

Keep this broad.

Federal Republic
Republic
Constitutional Monarchy
Absolute Monarchy
Communist State

Avoid overly technical constitutional names.

------------------------------------------------------------------------

# Population Rules

Rather than exact numbers, use gameplay buckets.

For example

Under 1M
1–10M
10–50M
50–100M
100–500M
500M+

Players can actually remember and build quests around those categories.

------------------------------------------------------------------------

# Gameplay Value Rule

Category values must be useful for gameplay.

Do not use counts, statistics or generic descriptions when a specific,
shared value exists.

The value should allow players to discover relationships between countries
and complete quests.

Prefer values that are shared by multiple countries.

------------------------------------------------------------------------

# Questability Rule

Every primary and secondary value must satisfy this test:

Could this value reasonably appear on at least three different country cards?

If not, choose a more useful value.

------------------------------------------------------------------------

Location is display metadata, not a gameplay category.

The CSV contains:

continent
region
location

The location field is formatted as:

Continent • Region

Example:

Asia • East Asia
Europe • Northern Europe
Africa • East Africa
North America • Northern America

| Region             | Countries                                                                           |
| ------------------ | ----------------------------------------------------------------------------------- |
| **British Isles**  | United Kingdom, Ireland                                                             |
| **Scandinavia**    | Denmark, Norway, Sweden, Finland, Iceland                                           |
| **Mediterranean**  | Spain, Portugal, Italy, Malta, Cyprus, Greece                                       |
| **Central Europe** | Germany, Austria, Switzerland, Liechtenstein, Czechia, Slovakia, Hungary, Slovenia  |
| **Eastern Europe** | Poland, Romania, Bulgaria, Moldova, Belarus, Ukraine, Russia*                       |
| **Balkans**        | Croatia, Bosnia & Herzegovina, Serbia, Montenegro, Kosovo, Albania, North Macedonia |

Africa
- North Africa
- West Africa
- Central Africa
- East Africa
- Southern Africa

Asia
- Middle East
- Central Asia
- South Asia
- Southeast Asia
- East Asia

Europe
- British Isles
- Scandinavia
- Mediterranean
- Central Europe
- Eastern Europe
- Balkans

North America
- Northern America
- Central America
- Caribbean

South America
- Amazon
- Andes
- Brazil
- Southern Cone

Oceania
- Australia
- Melanesia
- Micronesia
- Polynesia

------------------------------------------------------------------------

Locked Enumerations

Values must only come from the approved lists in this specification.

Never invent new values.

If a suitable value does not exist:

use the appropriate blank value (where supported), or
request a specification update.

This applies to:

Categories
Colours
Symbols
Patterns

------------------------------------------------------------------------

Validation

Before producing any CSV, validate that:

every column in the schema exists
column order exactly matches the specification
every enum value is valid
every asset URL is populated
blank assets use blank.png
no unsupported categories, symbols, colours or patterns have been introduced

------------------------------------------------------------------------

Tags

Instead of just the two displayed categories, every country gets a list of searchable tags.

Example:

tags

island
g7
eu
nato
english
commonwealth
landlocked
scandinavia
volcano
amazon
desert
southern-hemisphere

Japan might have

island|g7|east-asia|pacific|volcano|earthquake|shinto|developed

South Africa

southern-africa|english|commonwealth|southern-hemisphere|g20|savanna

These never appear on cards.

They're purely for generating quests.

------------------------------------------------------------------------

# Current CSV Schema

``` text
id
name
iso2
iso3
flag_url
capital
population
area_km2
continent
region
location
description
government
geography
terrain
age
primary_category
primary_category_colour
primary_category_icon
primary_value
secondary_category
secondary_category_colour
secondary_category_icon
secondary_value
colour1
colour2
colour3
colour4
colour5
colour1_url
colour2_url
colour3_url
colour4_url
colour5_url
symbol1
symbol2
symbol3
symbol1_url
symbol2_url
symbol3_url
pattern1
pattern1_url
points
difficulty
quest_easy
quest_medium
quest_hard
collect_hint
tags
```

------------------------------------------------------------------------

CSV Generation Validation Rules

When generating country card data, the rules must always be followed.

------------------------------------------------------------------------

# Notes

-   Review content freely.
-   Do not change the schema without explicit approval.
-   Future CSVs should conform exactly to this specification.
