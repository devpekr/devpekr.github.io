'use strict';

const APP_LAYOUTS = new Set([
  'apitester',
  'asciiart',
  'barcode',
  'calendar',
  'charmap',
  'favicon',
  'gif',
  'htmlconverter',
  'lotto',
  'pdftools',
  'videosubtitle',
  'zipcode'
]);

function getSeoConfig(config) {
  const cfg = config || {};
  const userSeo = (cfg.seo && typeof cfg.seo === 'object') ? cfg.seo : {};
  const siteUrl = String(userSeo.site_url || cfg.url || 'https://devpekr.github.io').replace(/\/+$/, '');
  return {
    enable: userSeo.enable !== false,
    site_name: userSeo.site_name || cfg.title || 'dev.pe.kr',
    default_description: userSeo.default_description || cfg.description || '',
    site_url: siteUrl,
    default_image: userSeo.default_image || '/images/ai-developer.png',
    logo: userSeo.logo || '/images/logo.png',
    author: userSeo.author || cfg.author || 'dev.pe.kr',
    language: userSeo.language || cfg.language || 'ko',
    locale: userSeo.locale || 'ko_KR',
    twitter_card: userSeo.twitter_card || 'summary_large_image',
    json_ld: userSeo.json_ld !== false,
    sitemap: Object.assign({
      enable: true,
      exclude_noindex: true,
      include_tags: false,
      include_categories: true
    }, userSeo.sitemap || {}),
    llms_txt: Object.assign({
      enable: true,
      max_posts: 30
    }, userSeo.llms_txt || {}),
    robots: Object.assign({
      enable: true,
      allow_search_crawlers: [
        'Googlebot', 'bingbot', 'Yeti',
        'OAI-SearchBot', 'ChatGPT-User',
        'Claude-SearchBot', 'Claude-User', 'PerplexityBot'
      ],
      ai_training_policy: 'allow',
      ai_training_crawlers: ['GPTBot', 'ClaudeBot', 'Google-Extended', 'CCBot', 'Bytespider']
    }, userSeo.robots || {}),
    verification: Object.assign({ google: '', naver: '', bing: '' }, userSeo.verification || {}),
    indexnow: Object.assign({ enable: false, key: '', endpoint: 'https://api.indexnow.org/indexnow' }, userSeo.indexnow || {}),
    noindex: Object.assign({ tags: true, archives: true, pagination: false }, userSeo.noindex || {})
  };
}

function escapeHtml(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function stripHtml(html) {
  return String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function toAbsoluteUrl(siteUrl, rawPath) {
  const base = String(siteUrl || '').replace(/\/+$/, '');
  const val = String(rawPath || '').trim();
  if (!val) return base + '/';
  if (/^https?:\/\//i.test(val)) return val;
  const normalized = val.startsWith('/') ? val : '/' + val;
  return base + normalized;
}

function normalizeCanonicalPath(rawPath) {
  let p = String(rawPath || '').trim();
  p = p.replace(/^\/+/, '');
  if (!p || p === 'index.html') return '/';
  p = p.replace(/index\.html$/, '');
  return '/' + p;
}

function buildCanonicalUrl(seo, page) {
  if (page && page.canonical) {
    return toAbsoluteUrl(seo.site_url, page.canonical);
  }
  const rel = normalizeCanonicalPath(page && page.path ? page.path : '');
  return seo.site_url + rel;
}

function isPageNoindex(seo, page, ctx) {
  if (!page) return false;
  if (page.noindex === true || page.published === false) return true;
  const p = String(page.path || '');
  if (p === '404.html' || page.layout === '404') return true;
  if (ctx && typeof ctx.is_archive === 'function' && ctx.is_archive() && seo.noindex.archives) return true;
  if (ctx && typeof ctx.is_tag === 'function' && ctx.is_tag() && seo.noindex.tags) return true;
  if (seo.noindex.pagination && page.current && page.current > 1) return true;
  return false;
}

function buildTitle(seo, page, ctx) {
  const siteTitle = (ctx && ctx.config && ctx.config.title) || seo.site_name;
  const subtitle = (ctx && ctx.config && ctx.config.subtitle) || '기술블로그';
  if (ctx && ctx.is_home && ctx.is_home()) {
    const pageSuffix = page && page.current && page.current > 1 ? ` (${page.current}페이지)` : '';
    return `${siteTitle} · ${subtitle}${pageSuffix}`;
  }
  let title = page && page.title ? String(page.title) : '';
  if (ctx && ctx.is_archive && ctx.is_archive()) {
    title = '아카이브';
    if (ctx.is_month && ctx.is_month()) title += `: ${page.year}/${page.month}`;
    else if (ctx.is_year && ctx.is_year()) title += `: ${page.year}`;
  } else if (ctx && ctx.is_category && ctx.is_category()) {
    title = `${page.category} 카테고리`;
  } else if (ctx && ctx.is_tag && ctx.is_tag()) {
    title = `#${page.tag} 태그`;
  }
  if (page && page.current && page.current > 1) {
    title = `${title} (${page.current}페이지)`;
  }
  return title ? `${title} | ${siteTitle}` : siteTitle;
}

function buildDescription(seo, page, ctx) {
  const pageSuffix = page && page.current && page.current > 1 ? ` (${page.current}페이지)` : '';
  if (page && page.description) {
    return stripHtml(page.description).slice(0, 150) + pageSuffix;
  }
  if (page && (page.excerpt || page.content)) {
    const raw = stripHtml(page.excerpt || page.content);
    if (raw) return raw.slice(0, 150) + (raw.length > 150 ? '…' : '') + pageSuffix;
  }
  if (ctx && ctx.is_category && ctx.is_category() && page && page.category) {
    return `${page.category} 주제의 개발 기록과 기술 문서를 모은 카테고리 아카이브입니다.${pageSuffix}`;
  }
  if (ctx && ctx.is_tag && ctx.is_tag() && page && page.tag) {
    return `#${page.tag} 태그가 포함된 개발 기록 목록입니다.${pageSuffix}`;
  }
  if (ctx && ctx.is_archive && ctx.is_archive()) {
    return `${seo.site_name}의 전체 게시글 아카이브입니다.${pageSuffix}`;
  }
  return stripHtml(seo.default_description).slice(0, 150) + pageSuffix;
}

function buildImage(seo, page) {
  let img = (page && (page.image || page.thumbnail)) || '';
  if (!img && page && page.content) {
    const match = /<img\s[^>]*src=["']([^"']+)["']/i.exec(page.content);
    if (match && match[1]) img = match[1];
  }
  if (!img) img = seo.default_image;
  return toAbsoluteUrl(seo.site_url, img);
}

function toIsoDate(d) {
  if (!d) return '';
  if (typeof d.toISOString === 'function') return d.toISOString();
  const parsed = new Date(d);
  return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString();
}

function extractFaqItems(html) {
  if (!html) return [];
  const faqSection = /<h[23][^>]*>[^<]*(?:자주\s*묻는\s*질문|FAQ)[^<]*<\/h[23]>([\s\S]*?)(?=<h2\b|$)/i.exec(html);
  if (!faqSection) return [];
  const block = faqSection[1];
  const items = [];
  const qaRegex = /<h[34][^>]*>([\s\S]*?)<\/h[34]>\s*<p[^>]*>([\s\S]*?)<\/p>/gi;
  let m;
  while ((m = qaRegex.exec(block)) !== null && items.length < 10) {
    const q = stripHtml(m[1]);
    const a = stripHtml(m[2]);
    if (q && a) {
      items.push({
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: a }
      });
    }
  }
  return items;
}

function isAppPost(page) {
  if (!page) return false;
  if (page.schema_type === 'SoftwareApplication') return true;
  if (APP_LAYOUTS.has(page.layout)) return true;
  if (page.categories && typeof page.categories.some === 'function') {
    return page.categories.some(c => c.name === '앱');
  }
  return false;
}

function buildJsonLdBlocks(seo, page, ctx) {
  if (!seo.json_ld || !page) return [];
  const p = String(page.path || '');
  if (p === '404.html' || page.layout === '404') return [];

  const canonical = buildCanonicalUrl(seo, page);
  const title = buildTitle(seo, page, ctx);
  const description = buildDescription(seo, page, ctx);
  const image = buildImage(seo, page);
  const logoUrl = toAbsoluteUrl(seo.site_url, seo.logo);
  const publisher = {
    '@type': 'Organization',
    name: seo.site_name,
    url: seo.site_url + '/',
    logo: { '@type': 'ImageObject', url: logoUrl }
  };
  const blocks = [];

  if (ctx.is_home && ctx.is_home()) {
    blocks.push({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: seo.site_name,
      url: seo.site_url + '/',
      description: seo.default_description,
      inLanguage: 'ko-KR',
      publisher
    });
    return blocks;
  }

  if (ctx.is_post && ctx.is_post()) {
    const cats = page.categories && page.categories.toArray ? page.categories.toArray() : [];
    const tags = page.tags && page.tags.toArray ? page.tags.toArray() : [];
    const published = toIsoDate(page.date);
    const modified = toIsoDate(page.updated || page.date);
    const authorName = page.author || seo.author;

    if (isAppPost(page)) {
      blocks.push({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: page.title || title,
        description,
        url: canonical,
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Web Browser',
        inLanguage: 'ko-KR',
        image,
        author: { '@type': 'Person', name: authorName },
        publisher,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' }
      });
    } else {
      const schemaType = page.schema_type || 'BlogPosting';
      const article = {
        '@context': 'https://schema.org',
        '@type': schemaType,
        headline: page.title || title,
        description,
        url: canonical,
        mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
        datePublished: published,
        dateModified: modified,
        author: { '@type': 'Person', name: authorName },
        publisher,
        image,
        inLanguage: 'ko-KR'
      };
      if (cats.length) article.articleSection = cats[0].name;
      if (tags.length) article.keywords = tags.map(t => t.name).join(', ');
      blocks.push(article);
    }

    const breadcrumbItems = [{ '@type': 'ListItem', position: 1, name: '홈', item: seo.site_url + '/' }];
    if (cats.length) {
      breadcrumbItems.push({
        '@type': 'ListItem',
        position: 2,
        name: cats[0].name,
        item: toAbsoluteUrl(seo.site_url, '/' + cats[0].path)
      });
    }
    breadcrumbItems.push({
      '@type': 'ListItem',
      position: breadcrumbItems.length + 1,
      name: page.title || title,
      item: canonical
    });
    blocks.push({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: breadcrumbItems });

    const faqItems = extractFaqItems(page.content);
    if (faqItems.length) {
      blocks.push({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqItems });
    }
    return blocks;
  }

  if (ctx.is_category && ctx.is_category()) {
    blocks.push({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: `${page.category} 카테고리`,
      description,
      url: canonical,
      inLanguage: 'ko-KR',
      isPartOf: { '@type': 'WebSite', name: seo.site_name, url: seo.site_url + '/' }
    });
    blocks.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '홈', item: seo.site_url + '/' },
        { '@type': 'ListItem', position: 2, name: '카테고리', item: seo.site_url + '/categories/' },
        { '@type': 'ListItem', position: 3, name: page.category, item: canonical }
      ]
    });
    return blocks;
  }

  if (ctx.is_page && ctx.is_page()) {
    blocks.push({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: page.title || title,
      description,
      url: canonical,
      inLanguage: 'ko-KR',
      isPartOf: { '@type': 'WebSite', name: seo.site_name, url: seo.site_url + '/' }
    });
    blocks.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '홈', item: seo.site_url + '/' },
        { '@type': 'ListItem', position: 2, name: page.title || title, item: canonical }
      ]
    });
  }
  return blocks;
}

module.exports = {
  getSeoConfig,
  escapeHtml,
  stripHtml,
  toAbsoluteUrl,
  normalizeCanonicalPath,
  buildCanonicalUrl,
  isPageNoindex,
  buildTitle,
  buildDescription,
  buildImage,
  toIsoDate,
  buildJsonLdBlocks
};
