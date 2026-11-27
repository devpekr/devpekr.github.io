#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const ROOT = path.resolve(__dirname, '..');
const CONFIG_PATH = path.join(ROOT, '_config.yml');
const SITEMAP_PATH = path.join(ROOT, 'public', 'sitemap.xml');
const CACHE_PATH = path.join(ROOT, '.indexnow-cache.json');

function loadConfig() {
  const raw = fs.readFileSync(CONFIG_PATH, 'utf8');
  return yaml.load(raw) || {};
}

function parseSitemapUrls(xml) {
  const urls = [];
  const regex = /<url>[\s\S]*?<loc>(.*?)<\/loc>(?:[\s\S]*?<lastmod>(.*?)<\/lastmod>)?[\s\S]*?<\/url>/g;
  let m;
  while ((m = regex.exec(xml)) !== null) {
    urls.push({ loc: m[1].trim(), lastmod: (m[2] || '').trim() });
  }
  return urls;
}

function loadCache() {
  try {
    if (fs.existsSync(CACHE_PATH)) {
      return JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'));
    }
  } catch (_) {}
  return {};
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const forceAll = process.argv.includes('--all');
  const config = loadConfig();
  const seo = config.seo || {};
  const indexnow = seo.indexnow || {};
  const siteUrl = String(seo.site_url || config.url || '').replace(/\/+$/, '');

  if (!indexnow.enable) {
    console.log('[IndexNow] 비활성화 상태입니다 (_config.yml -> seo.indexnow.enable: false).');
    return;
  }
  if (!indexnow.key) {
    console.error('[IndexNow] API 키(seo.indexnow.key)가 설정되지 않았습니다.');
    process.exit(1);
  }
  if (!fs.existsSync(SITEMAP_PATH)) {
    console.error('[IndexNow] public/sitemap.xml이 없습니다. 먼저 npm run build를 실행하세요.');
    process.exit(1);
  }

  const xml = fs.readFileSync(SITEMAP_PATH, 'utf8');
  const entries = parseSitemapUrls(xml);
  const cache = loadCache();
  const changed = forceAll
    ? entries
    : entries.filter(e => cache[e.loc] !== (e.lastmod || '1'));

  if (!changed.length) {
    console.log('[IndexNow] 변경되거나 새로 추가된 URL이 없습니다.');
    return;
  }

  const host = new URL(siteUrl).host;
  const payload = {
    host,
    key: indexnow.key,
    keyLocation: `${siteUrl}/${indexnow.key}.txt`,
    urlList: changed.map(e => e.loc)
  };

  if (dryRun) {
    console.log('[IndexNow][Dry-Run] 전송 예정 URL 수:', payload.urlList.length);
    console.log(payload.urlList.slice(0, 10).join('\n'));
    return;
  }

  const endpoint = indexnow.endpoint || 'https://api.indexnow.org/indexnow';
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    console.error(`[IndexNow] 전송 실패: HTTP ${res.status} ${body}`);
    process.exit(1);
  }

  const nextCache = Object.assign({}, cache);
  changed.forEach(e => { nextCache[e.loc] = e.lastmod || '1'; });
  fs.writeFileSync(CACHE_PATH, JSON.stringify(nextCache, null, 2), 'utf8');
  console.log(`[IndexNow] ${changed.length}개 URL 전송 완료 (HTTP ${res.status}).`);
}

main().catch(err => {
  console.error('[IndexNow] 오류:', err.message);
  process.exit(1);
});
