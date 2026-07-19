# Card Specification

## Purpose
Player-facing data only. This CSV is generated from the Game Data CSV and is the only CSV imported into Figma.

## Card CSV Schema

```text
id
name
iso2
iso3
flag_url
location
description
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
```

## Rules
- Only contains data visible on the card.
- Description is about the flag only.
- Asset URLs are always populated.
- Missing optional assets use blank.png.
- Only approved colours, symbols and patterns may be used.
- Points are numeric.
