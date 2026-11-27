'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const PROPERTY_ID = process.env.GA_PROPERTY_ID || '566039398';
const OUTPUT_PATH = path.resolve(__dirname, '..', 'source', '_data', 'visitors.json');

function base64UrlEncode(input) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(String(input), 'utf8');
  return buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function createSignedJwt(serviceAccount) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/analytics.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600
  };

  const signingInput = `${base64UrlEncode(JSON.stringify(header))}.${base64UrlEncode(JSON.stringify(payload))}`;
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(signingInput);
  signer.end();

  const signature = signer.sign(serviceAccount.private_key);
  return `${signingInput}.${base64UrlEncode(signature)}`;
}

async function fetchAccessToken(serviceAccount) {
  const assertion = createSignedJwt(serviceAccount);
  const body = new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion
  });

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  });

  if (!res.ok) {
    throw new Error(`OAuth token request failed (${res.status}): ${await res.text()}`);
  }

  const data = await res.json();
  return data.access_token;
}

async function fetchTodayVisitors(accessToken, propertyId) {
  const url = `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      dateRanges: [{ startDate: 'today', endDate: 'today' }],
      metrics: [{ name: 'activeUsers' }, { name: 'screenPageViews' }]
    })
  });

  if (!res.ok) {
    throw new Error(`GA4 Data API failed (${res.status}): ${await res.text()}`);
  }

  const report = await res.json();
  const row = Array.isArray(report.rows) && report.rows.length > 0 ? report.rows[0] : null;
  const activeUsers = row && row.metricValues && row.metricValues[0] ? Number(row.metricValues[0].value) : 0;
  const pageViews = row && row.metricValues && row.metricValues[1] ? Number(row.metricValues[1].value) : 0;

  return {
    todayVisitors: Number.isFinite(activeUsers) ? activeUsers : 0,
    todayPageviews: Number.isFinite(pageViews) ? pageViews : 0
  };
}

async function main() {
  const rawJson = (process.env.GA_SERVICE_ACCOUNT_JSON || '').trim();
  if (!rawJson) {
    console.log('GA_SERVICE_ACCOUNT_JSON is not set; skipping GA4 visitor sync.');
    return;
  }

  const serviceAccount = JSON.parse(rawJson);
  if (!serviceAccount.client_email || !serviceAccount.private_key) {
    throw new Error('GA_SERVICE_ACCOUNT_JSON must contain client_email and private_key.');
  }

  const accessToken = await fetchAccessToken(serviceAccount);
  const { todayVisitors, todayPageviews } = await fetchTodayVisitors(accessToken, PROPERTY_ID);

  const now = new Date();
  const kstDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(now);

  const payload = {
    propertyId: PROPERTY_ID,
    todayVisitors,
    todayPageviews,
    date: kstDate,
    updatedAt: now.toISOString()
  };

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(payload, null, 2) + '\n', 'utf8');
  console.log(`Updated ${OUTPUT_PATH}: todayVisitors=${todayVisitors}, todayPageviews=${todayPageviews}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
