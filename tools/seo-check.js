#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');
const CONFIG_PATH = path.join(ROOT, '_config.yml');

const config = yaml.load(fs.readFileSync(CONFIG_PATH, 'utf8')) || {};
const seo = config.seo || {};
const siteUrl = String(seo.site_url || config.url || 'https://devpekr.github.io').replace(/\/+$/, '');

const errors = [];
const warnings = [];

function addError(file, msg) { errors.push(`[ERROR] ${file}: ${msg}`); }
function addWarn(file, msg) { warnings.push(`[WARN]  ${file}: ${msg}`); }

function walkHtml(dir, list = []) {
  if (!fs.existsSync(dir)) return list;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkHtml(full, list);
    else if (entry.isFile() && entry.name.endsWith('.html')) list.push(full);
  }
  return list;
}

function isVerificationFile(rel) {
  return /^(google[a-z0-9]+\.html|naver[a-z0-9]+\.html)$/i.test(rel);
}

function isInternalTargetValid(href) {
  const clean = href.split('#')[0].split('?')[0];
  if (!clean || clean === '/') return fs.existsSync(path.join(PUBLIC_DIR, 'index.html'));
  const rel = decodeURIComponent(clean.replace(/^\/+/, ''));
  const direct = path.join(PUBLIC_DIR, rel);
  const asIndex = path.join(PUBLIC_DIR, rel, 'index.html');
  return fs.existsSync(direct) || fs.existsSync(asIndex);
}

function main() {
  if (!fs.existsSync(PUBLIC_DIR)) {
    console.error('[ERROR] public/ 디렉터리가 없습니다. 먼저 npm run build를 실행하세요.');
    process.exit(1);
  }

  // 1. robots.txt
  const robotsPath = path.join(PUBLIC_DIR, 'robots.txt');
  if (!fs.existsSync(robotsPath)) {
    addError('robots.txt', 'robots.txt 파일이 생성되지 않았습니다.');
  } else {
    const robots = fs.readFileSync(robotsPath, 'utf8');
    if (!new RegExp(`Sitemap:\\s*${siteUrl}/sitemap\\.xml`, 'i').test(robots)) {
      addError('robots.txt', `Sitemap: ${siteUrl}/sitemap.xml 선언이 누락되었습니다.`);
    }
  }

  // 2. llms.txt
  if (!seo.llms_txt || seo.llms_txt.enable !== false) {
    const llmsPath = path.join(PUBLIC_DIR, 'llms.txt');
    if (!fs.existsSync(llmsPath)) addWarn('llms.txt', 'llms.txt 파일이 생성되지 않았습니다.');
  }

  // 3. sitemap.xml
  const sitemapPath = path.join(PUBLIC_DIR, 'sitemap.xml');
  const sitemapLocs = new Set();
  if (!fs.existsSync(sitemapPath)) {
    addError('sitemap.xml', 'sitemap.xml 파일이 생성되지 않았습니다.');
  } else {
    const xml = fs.readFileSync(sitemapPath, 'utf8');
    const locMatches = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)];
    if (!locMatches.length) addError('sitemap.xml', '<loc> 항목이 비어 있습니다.');
    for (const m of locMatches) {
      const loc = m[1].trim();
      if (!loc.startsWith(siteUrl)) addError('sitemap.xml', `잘못된 도메인 URL: ${loc}`);
      if (sitemapLocs.has(loc)) addError('sitemap.xml', `중복 URL 발견: ${loc}`);
      sitemapLocs.add(loc);
      if (/404\.html$/i.test(loc)) addError('sitemap.xml', `404 페이지가 sitemap에 포함됨: ${loc}`);
    }
  }

  // 4. HTML pages
  const htmlFiles = walkHtml(PUBLIC_DIR);
  const seenTitles = new Map();
  const seenDescs = new Map();
  const seenCanonicals = new Map();
  const noindexUrls = new Set();

  for (const fullPath of htmlFiles) {
    const rel = path.relative(PUBLIC_DIR, fullPath).replace(/\\/g, '/');
    if (isVerificationFile(rel)) continue;
    const html = fs.readFileSync(fullPath, 'utf8');
    const is404 = rel === '404.html';

    // title
    const titleMatch = /<title>([\s\S]*?)<\/title>/i.exec(html);
    const title = titleMatch ? titleMatch[1].trim() : '';
    if (!title) addError(rel, '<title> 태그가 누락되었거나 비어 있습니다.');

    // description
    const descMatch = /<meta\s+name=["']description["']\s+content=["']([\s\S]*?)["']\s*\/?>/i.exec(html);
    const desc = descMatch ? descMatch[1].trim() : '';
    if (!desc) addError(rel, '<meta name="description">이 누락되었습니다.');

    // robots
    const robotsMatch = /<meta\s+name=["']robots["']\s+content=["']([^"']+)["']/i.exec(html);
    const isNoindex = robotsMatch && /noindex/i.test(robotsMatch[1]);

    // canonical
    const canMatch = /<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i.exec(html);
    const canonical = canMatch ? canMatch[1].trim() : '';
    if (!is404 && !canonical) {
      addError(rel, '<link rel="canonical">이 누락되었습니다.');
    } else if (canonical) {
      if (!/^https?:\/\//i.test(canonical) || !canonical.startsWith(siteUrl)) {
        addError(rel, `잘못된 canonical URL: ${canonical}`);
      }
      if (seenCanonicals.has(canonical)) {
        addError(rel, `중복 canonical URL (${seenCanonicals.get(canonical)}): ${canonical}`);
      } else {
        seenCanonicals.set(canonical, rel);
      }
      if (isNoindex) noindexUrls.add(canonical);
    }

    if (!isNoindex && !is404) {
      if (title) {
        if (seenTitles.has(title)) addWarn(rel, `중복 title (${seenTitles.get(title)}): ${title}`);
        else seenTitles.set(title, rel);
      }
      if (desc) {
        if (seenDescs.has(desc)) addWarn(rel, `중복 description (${seenDescs.get(desc)})`);
        else seenDescs.set(desc, rel);
      }
    }

    // H1 check
    const h1Count = (html.match(/<h1\b/gi) || []).length;
    if (h1Count === 0) addError(rel, '<h1> 태그가 누락되었습니다.');
    else if (h1Count > 1) addWarn(rel, `<h1> 태그가 ${h1Count}개 존재합니다 (1개 권장).`);

    // Open Graph check
    for (const prop of ['og:title', 'og:description', 'og:url', 'og:image']) {
      const ogRe = new RegExp(`<meta\\s+property=["']${prop}["']\\s+content=["']([^"']*)["']`, 'i');
      const m = ogRe.exec(html);
      if (!m || !m[1].trim()) {
        addError(rel, `Open Graph(${prop})가 누락되었습니다.`);
      } else if ((prop === 'og:url' || prop === 'og:image') && !/^https?:\/\//i.test(m[1].trim())) {
        addError(rel, `${prop}가 상대 URL입니다: ${m[1].trim()}`);
      }
    }

    // JSON-LD check
    const ldRegex = /<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    let ldMatch;
    while ((ldMatch = ldRegex.exec(html)) !== null) {
      try {
        JSON.parse(ldMatch[1]);
      } catch (e) {
        addError(rel, `JSON-LD 파싱 오류: ${e.message}`);
      }
    }

    // img alt check
    const imgTags = html.match(/<img\b[^>]*>/gi) || [];
    for (const tag of imgTags) {
      if (!/\balt\s*=/i.test(tag)) {
        addWarn(rel, `<img> 태그에 alt 속성이 누락되었습니다: ${tag.slice(0, 80)}`);
      }
    }

    // broken internal links check
    const hrefRegex = /href=["'](\/[^"']*)["']/gi;
    let hrefMatch;
    while ((hrefMatch = hrefRegex.exec(html)) !== null) {
      const href = hrefMatch[1];
      if (href.startsWith('//')) continue;
      if (!isInternalTargetValid(href)) {
        addWarn(rel, `내부 링크 대상 없음: ${href}`);
      }
    }
  }

  // 5. noindex vs sitemap conflict
  for (const url of noindexUrls) {
    if (sitemapLocs.has(url)) {
      addError('sitemap.xml', `noindex 페이지가 sitemap.xml에 포함됨: ${url}`);
    }
  }

  console.log(`\n=== SEO Inspection Summary (${htmlFiles.length} HTML files, ${sitemapLocs.size} sitemap URLs) ===`);
  if (warnings.length) {
    console.log(`\nWarnings (${warnings.length}):`);
    warnings.slice(0, 30).forEach(w => console.log('  ' + w));
    if (warnings.length > 30) console.log(`  ... 외 ${warnings.length - 30}건`);
  }
  if (errors.length) {
    console.log(`\nErrors (${errors.length}):`);
    errors.forEach(e => console.error('  ' + e));
    process.exit(1);
  }
  console.log('\n✅ 치명적인 SEO 오류가 없습니다.');
}

main();
