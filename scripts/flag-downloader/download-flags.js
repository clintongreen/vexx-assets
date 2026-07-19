#!/usr/bin/env node
/**
 * Download 1024px PNG flag renditions from Wikimedia Commons.
 * Requires Node.js 18+ (for the built-in fetch API).
 */
import { createWriteStream, existsSync, promises as fs } from 'node:fs';
import { mkdir, readFile, rename, rm } from 'node:fs/promises';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';
import { fileURLToPath, pathToFileURL } from 'node:url';

// fileURLToPath decodes spaces and non-ASCII characters in copied folder names.
const ROOT = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(ROOT, '..', '..');
const args = new Set(process.argv.slice(2));
const mappingPath = path.join(ROOT, 'flags.json');
const codesPath = path.join(ROOT, 'country-codes.json');
const defaultCsvPath = path.join(ROOT, 'countries.csv');
const RETRIES = 8;
const MAX_RETRY_DELAY_MS = 30000;
const USER_AGENT = 'flag-card-game-downloader/1.0 (Wikimedia Commons flag asset downloader)';

export function resolveOutputDir() {
  return path.resolve(REPO_ROOT, 'flags');
}

function resolveCsvPath(input) {
  if (!input || input.startsWith('--')) return defaultCsvPath;
  return path.isAbsolute(input) ? input : path.resolve(process.cwd(), input);
}

const csvPath = resolveCsvPath(process.argv[2]);
const outputDir = resolveOutputDir();

if (args.has('--help') || args.has('-h')) {
  console.log('Usage: node download-flags.js [countries.csv] [--verify]');
  console.log('Downloads 1024px PNG flag renditions into ./flags.');
  console.log('--verify checks Commons mappings without downloading.');
  process.exit(0);
}

function parseCsv(text) {
  const rows = [];
  let row = [], value = '', quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    if (c === '"') {
      if (quoted && text[i + 1] === '"') { value += '"'; i += 1; } else quoted = !quoted;
    } else if (c === ',' && !quoted) { row.push(value); value = ''; }
    else if ((c === '\n' || c === '\r') && !quoted) {
      if (c === '\r' && text[i + 1] === '\n') i += 1;
      row.push(value); if (row.some((cell) => cell.trim())) rows.push(row); row = []; value = '';
    } else value += c;
  }
  row.push(value); if (row.some((cell) => cell.trim())) rows.push(row);
  return rows;
}

async function loadCountries(file) {
  const rows = parseCsv(await readFile(file, 'utf8'));
  if (!rows.length) throw new Error('The CSV is empty.');
  const header = rows[0].map((cell) => cell.trim().toLowerCase());
  const index = header.findIndex((cell) => ['name', 'country', 'country name'].includes(cell));
  if (index === -1) throw new Error('CSV needs a Name, Country, or Country Name header.');
  return [...new Set(rows.slice(1).map((row) => row[index]?.trim()).filter(Boolean))];
}

function safeFilename(country) {
  return country.normalize('NFC').replace(/[<>:"/\\|?*\u0000-\u001f]/g, '-').replace(/\s+/g, ' ').trim();
}

function delay(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }

export function shouldRetryStatus(status) {
  return [408, 429, 500, 502, 503, 504].includes(status);
}

export function getRetryDelayMs(response, attempt) {
  const retryAfterHeader = response?.headers?.get?.('retry-after');
  if (retryAfterHeader) {
    const retryAfterSeconds = Number(retryAfterHeader);
    if (!Number.isNaN(retryAfterSeconds) && retryAfterSeconds > 0) {
      return Math.max(1000, retryAfterSeconds * 1000 + Math.round(Math.random() * 500));
    }
    const retryAfterDate = Date.parse(retryAfterHeader);
    if (!Number.isNaN(retryAfterDate)) {
      return Math.max(1000, retryAfterDate - Date.now() + Math.round(Math.random() * 500));
    }
  }
  return Math.min(MAX_RETRY_DELAY_MS, 1000 * 2 ** attempt + Math.round(Math.random() * 500));
}

export async function fetchWithRetry(url, label, responseType = 'json') {
  let lastError;
  for (let attempt = 0; attempt < RETRIES; attempt += 1) {
    try {
      const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
      if (response.ok) return responseType === 'json' ? response.json() : response;
      if (!shouldRetryStatus(response.status)) {
        throw new Error(`${label}: HTTP ${response.status}`);
      }
      lastError = new Error(`${label}: HTTP ${response.status}`);
      if (attempt < RETRIES - 1) {
        const retryDelayMs = getRetryDelayMs(response, attempt);
        console.warn(`${label}: retry ${attempt + 1}/${RETRIES} after ${response.status} in ${Math.ceil(retryDelayMs / 1000)}s`);
        await delay(retryDelayMs);
      }
    } catch (error) {
      lastError = error;
      // A 4xx other than 408/429 is a permanent mapping error.
      if (/HTTP 4(?!08|29)/.test(error.message)) throw error;
      if (attempt < RETRIES - 1 && shouldRetryStatus(Number.parseInt(error.message.match(/HTTP (\d+)/)?.[1] ?? '0', 10))) {
        const retryDelayMs = 1000 * 2 ** attempt + Math.round(Math.random() * 500);
        console.warn(`${label}: retry ${attempt + 1}/${RETRIES} after transient error in ${Math.ceil(retryDelayMs / 1000)}s`);
        await delay(retryDelayMs);
      }
    }
  }
  throw lastError;
}

async function resolvePngUrl(filename) {
  const title = `File:${filename}`;
  const api = new URL('https://commons.wikimedia.org/w/api.php');
  api.searchParams.set('action', 'query');
  api.searchParams.set('format', 'json');
  api.searchParams.set('formatversion', '2');
  api.searchParams.set('prop', 'imageinfo');
  api.searchParams.set('iiprop', 'url');
  api.searchParams.set('iiurlwidth', '1024');
  api.searchParams.set('titles', title);
  const body = await fetchWithRetry(api, title);
  const page = body.query?.pages?.[0];
  const pngUrl = page?.imageinfo?.[0]?.thumburl;
  if (!pngUrl) throw new Error(`${title}: not found on Wikimedia Commons`);
  return pngUrl;
}

async function download(country, filename, code) {
  const destination = path.join(outputDir, `${safeFilename(code)}.png`);
  if (existsSync(destination)) return 'skipped';
  const temporary = `${destination}.part`;
  try {
    const pngUrl = await resolvePngUrl(filename);
    const response = await fetchWithRetry(pngUrl, country, 'stream');
    if (!response.body) throw new Error(`${country}: empty download response`);
    await pipeline(Readable.fromWeb(response.body), createWriteStream(temporary));
    await rename(temporary, destination);
    return 'downloaded';
  } catch (error) {
    await rm(temporary, { force: true });
    throw error;
  }
}

async function main() {
  const mapping = JSON.parse(await readFile(mappingPath, 'utf8'));
  const countryCodes = JSON.parse(await readFile(codesPath, 'utf8'));
  const countries = await loadCountries(csvPath);
  await mkdir(outputDir, { recursive: true });

  if (args.has('--verify')) {
    let failures = 0;
    for (const country of countries) {
      try {
        if (!mapping[country] || !countryCodes[country]) throw new Error('no mapping or country code');
        await resolvePngUrl(mapping[country]);
        console.log(`✓ ${country}`);
      } catch (error) { failures += 1; console.error(`✗ ${country}: ${error.message}`); }
    }
    process.exitCode = failures ? 1 : 0;
  } else {
    const unknown = countries.filter((country) => !mapping[country] || !countryCodes[country]);
    if (unknown.length) {
      console.error(`No Commons mapping for: ${unknown.join(', ')}`);
      console.error('Add those names and file titles to flags.json, then run again.');
      process.exitCode = 1;
    } else {
      let downloaded = 0, skipped = 0, failed = 0;
      for (const country of countries) {
        try {
          const result = await download(country, mapping[country], countryCodes[country]);
          result === 'downloaded' ? downloaded += 1 : skipped += 1;
          console.log(`${result === 'downloaded' ? '✓' : '–'} ${country} (${result})`);
        } catch (error) { failed += 1; console.error(`✗ ${country}: ${error.message}`); }
      }
      console.log(`\nDone: ${downloaded} downloaded, ${skipped} skipped, ${failed} failed.`);
      process.exitCode = failed ? 1 : 0;
    }
  }
}

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isDirectRun) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
