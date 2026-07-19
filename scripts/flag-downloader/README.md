# Flag PNG downloader

Downloads 1024-pixel-wide PNG renditions of country flags from Wikimedia Commons into `flags/`.

The included `countries.csv` contains 198 cards: the 193 UN member states, Palestine, Holy See (Vatican City), Kosovo, Scotland, and Wales. `flags.json` is the complete mapping from those card names to the Wikimedia Commons SVG filename used to obtain the PNG rendition.

## Run it

This requires Node.js 18 or newer and an internet connection. The included `package.json` marks the downloader as an ES module; no packages need to be installed.

```sh
node download-flags.js
```

Use `node download-flags.js --help` to see the command form.

Files are placed in `flags/`, using lowercase country codes (for example, Denmark is `flags/dk.png` and Bangladesh is `flags/bd.png`). Existing PNGs are left alone, so the command is safe to rerun. Network and temporary server failures are retried four times with exponential backoff; a failed partial download is removed.

`country-codes.json` contains ISO 3166-1 alpha-2 codes for sovereign states. The game additions use the conventional codes `xk` (Kosovo), `sct` (Scotland), and `wls` (Wales).

## Use your own card list

Pass another CSV path as the first argument:

```sh
node download-flags.js path/to/my-cards.csv
```

Its header must be `Name`, `Country`, or `Country Name`; one card name goes on each following row. Country names must match a key in `flags.json` exactly. To add another card, add its display name and the corresponding Commons SVG title (without `File:`) to `flags.json`.

## Check mappings without downloading

```sh
node download-flags.js --verify
node download-flags.js path/to/my-cards.csv --verify
```

This asks the Wikimedia Commons API to resolve every mapped file and reports any missing or renamed title. The downloader uses the API-provided thumbnail URL rather than assuming Wikimedia's thumbnail-path format.

## Attribution

The source artwork is hosted on Wikimedia Commons. Flag files may have different licences and attribution requirements; follow each file's Commons page when distributing the game or its assets.
