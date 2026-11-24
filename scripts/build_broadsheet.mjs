// Generates a self-contained 1024x1024 editorial world news broadsheet HTML for Tue 24 Nov 2026 (V5).
// Built on V2's 23-dispatch 7-region Natural Earth vector broadsheet architecture with live Tue 24 Nov updates.
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const topojson = require('topojson-client');
const worldAtlasPath = require.resolve('world-atlas/countries-110m.json');
const worldData = JSON.parse(readFileSync(worldAtlasPath, 'utf8'));
const countries = topojson.feature(worldData, worldData.objects.countries);

// Natural Earth 110m vector projection inside the bottom-left atlas panel (466 x 244)
const MAP_W = 466;
const MAP_H = 244;
const LON_MIN = -170;
const LON_MAX = 180;
const LAT_MIN = -54;
const LAT_MAX = 78;

function project(lon, lat) {
  const clampedLat = Math.max(LAT_MIN, Math.min(LAT_MAX, lat));
  const clampedLon = Math.max(LON_MIN, Math.min(LON_MAX, lon));
  const x = ((clampedLon - LON_MIN) / (LON_MAX - LON_MIN)) * MAP_W;
  const y = ((LAT_MAX - clampedLat) / (LAT_MAX - LAT_MIN)) * MAP_H;
  return [x, y];
}

function ringToPath(ring) {
  if (!ring || ring.length < 3) return '';
  let d = '';
  let prevLon = ring[0][0];
  for (let i = 0; i < ring.length; i++) {
    const [lon, lat] = ring[i];
    const [x, y] = project(lon, lat);
    if (i > 0 && Math.abs(lon - prevLon) > 180) {
      d += `M${x.toFixed(1)},${y.toFixed(1)}`;
    } else {
      d += `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    }
    prevLon = lon;
  }
  return d + 'Z';
}

function geomToPath(geom) {
  if (!geom) return '';
  if (geom.type === 'Polygon') return geom.coordinates.map(ringToPath).join(' ');
  if (geom.type === 'MultiPolygon') return geom.coordinates.map((p) => p.map(ringToPath).join(' ')).join(' ');
  return '';
}

const countryPaths = countries.features
  .filter((f) => String(f.id) !== '010')
  .map((f) => `<path d="${geomToPath(f.geometry)}" />`)
  .join('\n');

let graticules = '';
for (let lon = -150; lon <= 150; lon += 30) {
  const [x1, y1] = project(lon, LAT_MAX);
  const [x2, y2] = project(lon, LAT_MIN);
  graticules += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" />\n`;
}
for (let lat = -40; lat <= 60; lat += 20) {
  const [x1, y1] = project(LON_MIN, lat);
  const [x2, y2] = project(LON_MAX, lat);
  graticules += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" />\n`;
}

const heroStories = [
  {
    id: 1,
    location: 'HORMUZ · MARITIME',
    tag: 'MINES & SHIPS',
    color: '#B91C1C',
    lon: 57.5,
    lat: 26.2,
    headline: 'Hormuz naval mines ignite oil tankers',
    summary: 'IRGC reports tankers ablaze off Hormuz amid US blockade; Iran vows full defense. (Al Jazeera, AA)',
    scene: `<svg viewBox="0 0 300 72" width="100%" height="72">
      <defs>
        <linearGradient id="hormuzSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1E1B4B"/>
          <stop offset="62%" stop-color="#7C2D12"/>
          <stop offset="100%" stop-color="#EA580C"/>
        </linearGradient>
      </defs>
      <rect width="300" height="72" rx="4" fill="url(#hormuzSky)"/>
      <rect y="48" width="300" height="24" fill="#0F172A"/>
      <path d="M0 54 Q30 50 60 54 T120 54 T180 54 T240 54 T300 54" fill="none" stroke="#38BDF8" stroke-width="1.5" opacity="0.6"/>
      <g transform="translate(26,38)">
        <polygon points="0,12 64,12 58,18 6,18" fill="#334155"/>
        <rect x="42" y="4" width="12" height="8" fill="#475569"/>
        <path d="M18 11 C15 2 25 -4 28 5 C31 -2 39 3 34 11 Z" fill="#F97316"/>
        <circle cx="26" cy="5" r="3" fill="#FACC15"/>
      </g>
      <g transform="translate(116,35)">
        <polygon points="0,14 70,14 63,21 6,21" fill="#1E293B"/>
        <rect x="48" y="5" width="12" height="9" fill="#475569"/>
        <path d="M22 13 C17 1 30 -7 34 4 C39 -4 48 4 42 13 Z" fill="#EF4444"/>
        <circle cx="32" cy="7" r="4" fill="#FDE047"/>
      </g>
      <g transform="translate(212,40)">
        <polygon points="0,11 58,11 52,17 5,17" fill="#334155"/>
        <rect x="38" y="4" width="11" height="7" fill="#475569"/>
        <path d="M16 10 C13 2 22 -3 25 5 C28 -1 35 3 30 10 Z" fill="#F97316"/>
      </g>
      <circle cx="96" cy="60" r="4.5" fill="#DC2626" stroke="#FCA5A5" stroke-width="1.3"/>
      <circle cx="198" cy="61" r="4.5" fill="#DC2626" stroke="#FCA5A5" stroke-width="1.3"/>
      <rect x="8" y="6" width="132" height="16" rx="3" fill="rgba(15,23,42,0.86)"/>
      <text x="14" y="17.5" font-family="Arial, sans-serif" font-size="9.5" font-weight="900" fill="#FED7AA">STRAIT OF HORMUZ FLASH</text>
    </svg>`,
  },
  {
    id: 2,
    location: 'UKRAINE · WAR & TALKS',
    tag: '4-WAY PUSH',
    color: '#1D4ED8',
    lon: 34.0,
    lat: 48.0,
    headline: 'Zelensky urges 4-way talks; Merkury hit',
    summary: 'Zaporizhzhia strike wounds 40+; Kyiv hits Russian corvette off Libya. (Reuters, WaPo)',
    scene: `<svg viewBox="0 0 300 72" width="100%" height="72">
      <rect width="300" height="72" rx="4" fill="#0F172A"/>
      <path d="M0 16 L300 16" stroke="#1E293B" stroke-width="1"/>
      <path d="M0 36 L300 36" stroke="#1E293B" stroke-width="1"/>
      <path d="M0 56 L300 56" stroke="#1E293B" stroke-width="1"/>
      <circle cx="48" cy="36" r="21" fill="#1E3A8A" stroke="#60A5FA" stroke-width="2"/>
      <text x="48" y="34" text-anchor="middle" font-family="Arial, sans-serif" font-size="10.5" font-weight="900" fill="#FACC15">UA</text>
      <text x="48" y="45" text-anchor="middle" font-family="Arial, sans-serif" font-size="8" font-weight="800" fill="#DBEAFE">KYIV</text>
      <line x1="71" y1="36" x2="100" y2="36" stroke="#38BDF8" stroke-width="2.2" stroke-dasharray="3,2"/>
      <rect x="100" y="13" width="90" height="46" rx="5" fill="#172554" stroke="#93C5FD" stroke-width="1.6"/>
      <text x="145" y="29" text-anchor="middle" font-family="Arial, sans-serif" font-size="8.8" font-weight="900" fill="#93C5FD">4-PARTY SUMMIT</text>
      <text x="145" y="45" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="900" fill="#FFFFFF">UA·US·EU·RU</text>
      <rect x="200" y="13" width="92" height="46" rx="5" fill="#450A0A" stroke="#F87171" stroke-width="1.5"/>
      <text x="246" y="27" text-anchor="middle" font-family="Arial, sans-serif" font-size="8.2" font-weight="900" fill="#FCA5A5">FRONTLINE HITS</text>
      <text x="246" y="41" text-anchor="middle" font-family="Arial, sans-serif" font-size="9.4" font-weight="900" fill="#FFFFFF">ZAPORIZHZHIA</text>
      <text x="246" y="53" text-anchor="middle" font-family="Arial, sans-serif" font-size="8" font-weight="800" fill="#FECACA">&amp; MERKURY SHIP</text>
    </svg>`,
  },
  {
    id: 3,
    location: 'TAIPEI & SEOUL · TECH',
    tag: 'TAIEX +9% · BIS',
    color: '#0F766E',
    lon: 121.5,
    lat: 25.0,
    headline: 'Asia chips soar on Huang return; Megaspeed hit',
    summary: 'Taiex +9% & Kospi +7% as Nvidia reinstates CEO; US blacklists Singapore firm. (CNBC, AJ)',
    scene: `<svg viewBox="0 0 300 72" width="100%" height="72">
      <rect width="300" height="72" rx="4" fill="#062822"/>
      <line x1="10" y1="56" x2="290" y2="56" stroke="#115E59" stroke-width="1"/>
      <line x1="10" y1="36" x2="290" y2="36" stroke="#115E59" stroke-width="1" stroke-dasharray="3,3"/>
      <line x1="10" y1="16" x2="290" y2="16" stroke="#115E59" stroke-width="1" stroke-dasharray="3,3"/>
      <rect x="14" y="16" width="38" height="38" rx="5" fill="#0F766E" stroke="#5EEAD4" stroke-width="1.8"/>
      <rect x="23" y="25" width="20" height="20" rx="2" fill="#CCFBF1"/>
      <text x="33" y="38" text-anchor="middle" font-family="Arial, sans-serif" font-size="8.5" font-weight="900" fill="#0F766E">GPU</text>
      <polyline points="64,54 102,48 132,50 170,25 204,29 248,11" fill="none" stroke="#34D399" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>
      <polygon points="252,9 240,10 247,20" fill="#34D399"/>
      <rect x="156" y="38" width="134" height="24" rx="4" fill="#064E3B" stroke="#34D399" stroke-width="1.5"/>
      <text x="223" y="53.5" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="900" fill="#ECFDF5">TAIEX +9% · KOSPI +7%</text>
    </svg>`,
  },
];

const midStories = [
  {
    id: 4,
    banner: 'GDP UPGRADED ~6%',
    location: 'SINGAPORE · ECON',
    tag: '6.1% Q3',
    color: '#047857',
    lon: 103.8,
    lat: 1.35,
    headline: 'Singapore lifts 2026 GDP view to ~6%',
    summary: 'Q3 grew 6.1% YoY; PM Wong vows zero tolerance for US chip evasion. (CNA)',
    badge: `<rect x="4" y="4" width="22" height="14" rx="2" fill="#DC2626"/><rect x="4" y="11" width="22" height="7" fill="#FFFFFF"/><circle cx="10" cy="7.5" r="2.5" fill="#FFFFFF"/>`,
  },
  {
    id: 5,
    banner: 'ESPIONAGE VERDICT',
    location: 'BEIJING · CHINA',
    tag: 'COURT',
    color: '#991B1B',
    lon: 116.4,
    lat: 40.5,
    headline: 'Chinese official gets death for spying',
    summary: 'Official surnamed Ma convicted of leaking secrets; $150B clean tech grows. (CNA)',
    badge: `<rect x="4" y="4" width="22" height="14" rx="2" fill="#DC2626"/><polygon points="9,7 10,10 13,10 10.5,12 11.5,15 9,13 6.5,15 7.5,12 5,10 8,10" fill="#FACC15"/>`,
  },
  {
    id: 6,
    banner: 'FAA DRONE & CFTC',
    location: 'MICHIGAN · US',
    tag: 'TECH/FIN',
    color: '#3730A3',
    lon: -84.5,
    lat: 42.7,
    headline: 'FAA probes Amazon drone power hit',
    summary: 'Struck fiber & garage; CFTC allows crypto reserves as BTC hits $60K. (CNBC)',
    badge: `<circle cx="15" cy="11" r="8" fill="#E0E7FF"/><path d="M9 11 L21 11 M15 5 L15 17" stroke="#3730A3" stroke-width="2.2"/><circle cx="15" cy="11" r="2.5" fill="#DC2626"/>`,
  },
  {
    id: 7,
    banner: 'HYBRID EV QUOTAS',
    location: 'BRUSSELS · EU/UK',
    tag: 'DEC 1 CAPS',
    color: '#6D28D9',
    lon: 2.5,
    lat: 50.5,
    headline: 'EU sets Dec 1 tariff-free hybrid quotas',
    summary: 'Caps hit Asian & UK hybrids; UK court airs $1.4M Andrew claim. (Guardian)',
    badge: `<rect x="4" y="4" width="22" height="14" rx="2" fill="#1D4ED8"/><circle cx="15" cy="11" r="4.5" fill="none" stroke="#FACC15" stroke-width="1.6" stroke-dasharray="2,1.6"/>`,
  },
  {
    id: 8,
    banner: 'CURFEW & RECOVERY',
    location: 'NIGERIA · AFRICA',
    tag: 'SECURITY',
    color: '#B45309',
    lon: 8.5,
    lat: 8.5,
    headline: 'Delta curfew on attack; Borno rebounds',
    summary: 'Ughelli shooting forces curfew; Dangote IPO clears; school enrolment doubles. (AJ)',
    badge: `<rect x="4" y="4" width="7" height="14" fill="#15803D"/><rect x="11" y="4" width="8" height="14" fill="#FFFFFF"/><rect x="19" y="4" width="7" height="14" fill="#15803D"/>`,
  },
  {
    id: 9,
    banner: 'CANBERRA PACT',
    location: 'OCEANIA · PACIFIC',
    tag: 'SECURITY',
    color: '#0369A1',
    lon: 149.1,
    lat: -35.3,
    headline: 'Solomons pivot to Australia, drop China',
    summary: 'PM Wale backs Canberra pact; probe exposes Iran ChatGPT disinfo op. (ABC AU)',
    badge: `<rect x="4" y="4" width="22" height="14" rx="2" fill="#0369A1"/><circle cx="15" cy="11" r="4" fill="none" stroke="#FFFFFF" stroke-width="1.8"/>`,
  },
  {
    id: 10,
    banner: 'VA271 LAUNCHED',
    location: 'KOUROU · SPACE',
    tag: '36 SATS UP',
    color: '#1E40AF',
    lon: -52.7,
    lat: 5.2,
    headline: 'Ariane 6 lofts 36 Amazon Leo sats',
    summary: 'VA271 lifts off at 11:14 UTC; Progress 97 docks 3 tons at ISS. (SFN, NASA)',
    badge: `<polygon points="15,3 20,16 10,16" fill="#FFFFFF"/><rect x="13" y="16" width="4" height="3" fill="#F97316"/>`,
  },
  {
    id: 11,
    banner: 'OUTER SOLAR SYSTEM',
    location: 'SCIENCE · SPACE',
    tag: 'PLANET 9',
    color: '#4338CA',
    lon: 151.2,
    lat: -33.8,
    headline: 'New model backs hidden Ninth Planet',
    summary: 'Fresh orbital simulations published Tuesday point to unseen giant. (ABC AU)',
    badge: `<circle cx="15" cy="11" r="6" fill="#312E81" stroke="#A5B4FC" stroke-width="1.8"/><ellipse cx="15" cy="11" rx="11" ry="3.5" transform="rotate(-20 15 11)" fill="none" stroke="#E0E7FF" stroke-width="1.2"/>`,
  },
];

const briefs = [
  { id: 12, label: 'Japan & Indonesia', text: 'Japan Nov PMI expands & Tokyo tech gains; Indonesia candy fire toll hits 26.', src: 'CNA, WaPo', color: '#0F766E' },
  { id: 13, label: 'Saudi / Mideast', text: 'Houthi strike hits Riyadh financial tower, hurting 11; Qatari PM meets US officials.', src: 'Al Jazeera', color: '#B91C1C' },
  { id: 14, label: 'New Zealand / Dairy', text: 'Fonterra seeks permit to dump 22M L raw milk; Māori seat vote debate.', src: 'RNZ', color: '#0369A1' },
  { id: 15, label: 'Guam / Pacific', text: 'Territory secures $10.3M US grants for power grids, clinics & resilience.', src: 'RNZ', color: '#0369A1' },
  { id: 16, label: 'US / Law & Labor', text: 'Appeals court opens Trump hush-money path; DOL finalizes contractor rule.', src: 'Hindu, OnLabor', color: '#3730A3' },
  { id: 17, label: 'US / Americas', text: 'US-Venezuela ink military & oil accord; Princeton neuroscientist held by ICE.', src: 'AP, Hindu', color: '#3730A3' },
  { id: 18, label: 'South Africa / AI', text: 'Government launches 90-day national AI plan; outcry over Facebook murder video.', src: 'iAfrica, BBC', color: '#B45309' },
  { id: 19, label: 'Gaza & UN WFP', text: 'Israeli strikes hit Gaza UNRWA post; WFP warns blockades risk food aid for 7.3M.', src: 'AJ, WAM', color: '#B91C1C' },
  { id: 20, label: 'South Asia / COP31', text: 'Ex-PM Hasina vows Dec 16 Dhaka return despite arrest threat; COP31 talks stall.', src: 'AJ, Reuters', color: '#0F766E' },
  { id: 21, label: 'Europe / Policy', text: 'EU-UK summit pledges Kyiv backing; UK benefits review & snow/ice alerts issued.', src: 'BBC, EU', color: '#6D28D9' },
  { id: 22, label: 'US Sport / NFL & MLB', text: 'Packers clear Parsons for Wed debut; Mets sign Skubal; 49ers cut Aiyuk.', src: 'ESPN', color: '#3730A3' },
  { id: 23, label: 'World Sport / FIFA', text: 'US 2031 & UK 2035 Women’s World Cups set; NZ lose Tickner for 2nd Test.', src: 'ESPN, CNA', color: '#1D4ED8' },
];

const mapPinList = [
  { id: 1, lon: 57.5, lat: 26.2, color: '#B91C1C' },
  { id: 2, lon: 34.0, lat: 48.0, color: '#1D4ED8' },
  { id: 3, lon: 121.5, lat: 25.0, color: '#0F766E' },
  { id: 4, lon: 103.8, lat: 1.35, color: '#047857' },
  { id: 5, lon: 116.4, lat: 40.5, color: '#991B1B' },
  { id: 6, lon: -84.5, lat: 42.7, color: '#3730A3' },
  { id: 7, lon: 2.5, lat: 50.5, color: '#6D28D9' },
  { id: 8, lon: 8.5, lat: 8.5, color: '#B45309' },
  { id: 9, lon: 149.1, lat: -35.3, color: '#0369A1' },
  { id: 10, lon: -52.7, lat: 5.2, color: '#1E40AF' },
  { id: 12, lon: 139.7, lat: 35.7, color: '#0F766E' },
  { id: 13, lon: 42.5, lat: 23.5, color: '#B91C1C' },
  { id: 14, lon: 169.5, lat: -39.5, color: '#0369A1' },
  { id: 15, lon: 144.8, lat: 13.4, color: '#0369A1' },
  { id: 16, lon: -102.0, lat: 37.5, color: '#3730A3' },
  { id: 17, lon: -68.0, lat: 10.5, color: '#3730A3' },
  { id: 18, lon: 26.0, lat: -27.5, color: '#B45309' },
  { id: 20, lon: 90.4, lat: 23.8, color: '#0F766E' },
];

const pinsSvg = mapPinList
  .map((p) => {
    const [x, y] = project(p.lon, p.lat);
    return `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)})">
      <circle r="8.6" fill="${p.color}" stroke="#FFFFFF" stroke-width="1.8"/>
      <text y="3.2" text-anchor="middle" font-family="Arial, sans-serif" font-size="9.5" font-weight="900" fill="#FFFFFF">${p.id}</text>
    </g>`;
  })
  .join('\n');

function renderHeroCard(s) {
  return `<div class="hero-card">
    <div class="hero-top">
      <span class="badge" style="background:${s.color};">${s.id}</span>
      <span class="loc">${s.location}</span>
      <span class="pill" style="background:${s.color};">${s.tag}</span>
    </div>
    <div class="hero-scene">${s.scene}</div>
    <div class="hero-hed">${s.headline}</div>
    <div class="hero-sum">${s.summary}</div>
  </div>`;
}

function renderMidCard(s) {
  return `<div class="mid-card">
    <div class="mid-banner" style="background:${s.color};">
      <svg viewBox="0 0 30 22" width="28" height="20">${s.badge}</svg>
      <span>${s.banner}</span>
    </div>
    <div class="mid-body">
      <div class="mid-meta">
        <span class="badge-sm" style="background:${s.color};">${s.id}</span>
        <span class="mid-loc">${s.location}</span>
        <span class="mid-tag" style="color:${s.color};">${s.tag}</span>
      </div>
      <div class="mid-hed">${s.headline}</div>
      <div class="mid-sum">${s.summary}</div>
    </div>
  </div>`;
}

function renderBrief(b) {
  return `<div class="brief-item">
    <span class="brief-num" style="color:${b.color};">${b.id}</span>
    <span class="brief-txt"><strong>${b.label}:</strong> ${b.text} <em>(${b.src})</em></span>
  </div>`;
}

const leftBriefs = briefs.slice(0, 6).map(renderBrief).join('\n');
const rightBriefs = briefs.slice(6, 12).map(renderBrief).join('\n');

const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body {
    width: 1024px;
    height: 1024px;
    overflow: hidden;
    background: #F6F1E5;
    color: #0F172A;
    font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
  }
  .page {
    width: 1024px;
    height: 1024px;
    padding: 10px 14px 8px 14px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .masthead {
    border-top: 4px solid #0F172A;
    border-bottom: 2px solid #0F172A;
    padding-top: 3px;
    padding-bottom: 4px;
  }
  .top-strip {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    font-weight: 900;
    letter-spacing: 0.06em;
    color: #0F172A;
    text-transform: uppercase;
  }
  .top-strip .red { color: #991B1B; }
  .title-line {
    text-align: center;
    font-family: Georgia, "Times New Roman", serif;
    font-size: 38px;
    font-weight: 900;
    letter-spacing: 0.02em;
    line-height: 1.03;
    color: #0B1220;
    margin: 1px 0 2px 0;
  }
  .sub-deck {
    text-align: center;
    font-size: 12.2px;
    font-weight: 900;
    letter-spacing: 0.03em;
    color: #7F1D1D;
    text-transform: uppercase;
    margin-bottom: 4px;
  }
  .region-bar {
    display: grid;
    grid-template-columns: 3fr 4fr 5fr 4fr 2fr 3fr 2fr;
    height: 15px;
    border-radius: 2px;
    overflow: hidden;
    margin-bottom: 4px;
  }
  .rb-seg {
    font-size: 9.5px;
    font-weight: 900;
    color: #FFFFFF;
    display: flex;
    align-items: center;
    justify-content: center;
    letter-spacing: 0.04em;
  }
  .timeline {
    background: #111827;
    color: #F8FAFC;
    font-size: 10.6px;
    font-weight: 700;
    padding: 3px 8px;
    border-radius: 3px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    white-space: nowrap;
  }
  .timeline .tl-k { color: #FACC15; font-weight: 900; }
  .timeline .tl-t { color: #93C5FD; font-weight: 900; }

  .hero-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    height: 204px;
  }
  .hero-card {
    background: #FFFDF8;
    border: 1.5px solid #94A3B8;
    border-radius: 5px;
    padding: 7px 9px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .hero-top {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .badge {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    color: #FFFFFF;
    font-size: 11.5px;
    font-weight: 900;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .loc {
    font-size: 11px;
    font-weight: 900;
    color: #1E293B;
    letter-spacing: 0.03em;
    flex-grow: 1;
  }
  .pill {
    color: #FFFFFF;
    font-size: 9.8px;
    font-weight: 900;
    padding: 2px 6px;
    border-radius: 3px;
    letter-spacing: 0.03em;
  }
  .hero-scene {
    border-radius: 4px;
    overflow: hidden;
    height: 72px;
  }
  .hero-hed {
    font-family: Georgia, "Times New Roman", serif;
    font-size: 17.6px;
    font-weight: 900;
    line-height: 1.1;
    color: #0F172A;
  }
  .hero-sum {
    font-size: 12.2px;
    font-weight: 600;
    line-height: 1.24;
    color: #1F2937;
  }

  .mid-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    height: 146px;
  }
  .mid-card {
    background: #FFFDF8;
    border: 1.5px solid #94A3B8;
    border-radius: 5px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .mid-banner {
    height: 25px;
    padding: 0 7px;
    display: flex;
    align-items: center;
    gap: 6px;
    color: #FFFFFF;
    font-size: 10.5px;
    font-weight: 900;
    letter-spacing: 0.05em;
  }
  .mid-body {
    padding: 6px 8px;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .mid-meta {
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .badge-sm {
    width: 17px;
    height: 17px;
    border-radius: 50%;
    color: #FFFFFF;
    font-size: 10px;
    font-weight: 900;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .mid-loc {
    font-size: 9.8px;
    font-weight: 900;
    color: #334155;
    flex-grow: 1;
    white-space: nowrap;
  }
  .mid-tag {
    font-size: 9.5px;
    font-weight: 900;
    white-space: nowrap;
  }
  .mid-hed {
    font-family: Georgia, "Times New Roman", serif;
    font-size: 14.8px;
    font-weight: 900;
    line-height: 1.12;
    color: #0F172A;
  }
  .mid-sum {
    font-size: 11.6px;
    font-weight: 600;
    line-height: 1.22;
    color: #1F2937;
  }

  .bottom-row {
    display: grid;
    grid-template-columns: 482px 1fr;
    gap: 8px;
    height: 300px;
  }
  .atlas-panel, .briefs-panel {
    background: #FFFDF8;
    border: 1.5px solid #94A3B8;
    border-radius: 5px;
    padding: 6px 8px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .panel-head {
    display: flex;
    justify-content: space-between;
    font-size: 10.5px;
    font-weight: 900;
    letter-spacing: 0.05em;
    color: #0F172A;
    border-bottom: 1.5px solid #CBD5E1;
    padding-bottom: 3px;
    margin-bottom: 4px;
  }
  .panel-head .accent { color: #991B1B; }
  .map-wrap {
    border: 1px solid #94A3B8;
    border-radius: 4px;
    overflow: hidden;
    height: 244px;
    background: #D6E6F2;
  }
  .legend {
    display: flex;
    justify-content: space-between;
    font-size: 9.5px;
    font-weight: 800;
    color: #334155;
    padding-top: 3px;
  }
  .dot {
    display: inline-block;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    margin-right: 3px;
    vertical-align: middle;
  }

  .briefs-cols {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    height: 266px;
  }
  .brief-col {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .brief-item {
    display: flex;
    align-items: flex-start;
    gap: 5px;
    font-size: 11.3px;
    line-height: 1.22;
    border-bottom: 1px dotted #E2E8F0;
    padding-bottom: 3px;
  }
  .brief-item:last-child { border-bottom: none; padding-bottom: 0; }
  .brief-num {
    font-size: 11.5px;
    font-weight: 900;
    flex-shrink: 0;
    min-width: 15px;
  }
  .brief-txt strong { color: #0F172A; }
  .brief-txt em { color: #475569; font-style: italic; font-size: 10.3px; }

  .footer {
    background: #0F172A;
    color: #F8FAFC;
    font-size: 10.6px;
    font-weight: 800;
    padding: 5px 10px;
    border-radius: 4px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
</style>
</head>
<body>
  <div class="page">
    <header class="masthead">
      <div class="top-strip">
        <span>THE WORLD IN ONE DAY</span>
        <span class="red">23 VERIFIED DISPATCHES · 7 REGIONS · STRICTLY TUESDAY 24 NOVEMBER 2026</span>
      </div>
      <div class="title-line">TUESDAY · 24 NOVEMBER 2026</div>
      <div class="sub-deck">HORMUZ TANKER MINES · ZELENSKY 4-WAY TALKS · TAIEX +9% &amp; MEGASPEED BAN · RIYADH &amp; VA271</div>
      <div class="region-bar">
        <div class="rb-seg" style="background:#9A3412;">MIDEAST 3</div>
        <div class="rb-seg" style="background:#1D4ED8;">EUROPE 4</div>
        <div class="rb-seg" style="background:#0F766E;">ASIA 5</div>
        <div class="rb-seg" style="background:#3730A3;">N.AM 4</div>
        <div class="rb-seg" style="background:#B45309;">AFRICA 2</div>
        <div class="rb-seg" style="background:#0369A1;">OCEANIA 3</div>
        <div class="rb-seg" style="background:#4338CA;">LATAM/SCI 2</div>
      </div>
      <div class="timeline">
        <span><span class="tl-k">UTC TIMELINE:</span> <span class="tl-t">00:00</span> Hormuz mines &amp; SG 6% GDP</span>
        <span><span class="tl-t">00:30</span> Zelensky 4-way talks</span>
        <span><span class="tl-t">01:00</span> Taiex +9% &amp; Megaspeed ban</span>
        <span><span class="tl-t">06:00</span> Riyadh hit &amp; EU EV quotas</span>
        <span><span class="tl-t">11:14</span> Ariane 6 VA271 &amp; WFP</span>
      </div>
    </header>

    <section class="hero-row">
      ${heroStories.map(renderHeroCard).join('\n')}
    </section>

    <section class="mid-row">
      ${midStories.slice(0, 4).map(renderMidCard).join('\n')}
    </section>

    <section class="mid-row">
      ${midStories.slice(4, 8).map(renderMidCard).join('\n')}
    </section>

    <section class="bottom-row">
      <div class="atlas-panel">
        <div class="panel-head">
          <span>GLOBAL DISPATCH ATLAS · TUESDAY 24 NOV 2026</span>
          <span class="accent">PINS 1–10 · 12–18 · 20</span>
        </div>
        <div class="map-wrap">
          <svg viewBox="0 0 ${MAP_W} ${MAP_H}" width="${MAP_W}" height="${MAP_H}">
            <rect width="${MAP_W}" height="${MAP_H}" fill="#D6E6F2"/>
            <g stroke="#B8CDE0" stroke-width="0.6" stroke-dasharray="2,2">${graticules}</g>
            <g fill="#E5DFCE" stroke="#8A8270" stroke-width="0.65">${countryPaths}</g>
            ${pinsSvg}
          </svg>
        </div>
        <div class="legend">
          <span><i class="dot" style="background:#B91C1C;"></i>Mideast</span>
          <span><i class="dot" style="background:#1D4ED8;"></i>Europe</span>
          <span><i class="dot" style="background:#0F766E;"></i>Asia</span>
          <span><i class="dot" style="background:#3730A3;"></i>N.Am</span>
          <span><i class="dot" style="background:#B45309;"></i>Africa</span>
          <span><i class="dot" style="background:#0369A1;"></i>Oceania</span>
          <span><i class="dot" style="background:#1E40AF;"></i>LatAm/Space</span>
        </div>
      </div>

      <div class="briefs-panel">
        <div class="panel-head">
          <span>ALSO ON TUE 24 NOV · 12 MORE BRIEFS</span>
          <span class="accent">ALL 7 REGIONS</span>
        </div>
        <div class="briefs-cols">
          <div class="brief-col">${leftBriefs}</div>
          <div class="brief-col">${rightBriefs}</div>
        </div>
      </div>
    </section>

    <footer class="footer">
      <span>24 NOV EDITION · Strictly Tuesday 24 November 2026 events · Al Jazeera, Reuters, BBC, CNBC, CNA, WaPo, Guardian, RNZ, ABC, ESPN</span>
      <span>23 DISPATCHES · 7 REGIONS · NATURAL EARTH</span>
    </footer>
  </div>
</body>
</html>`;

writeFileSync(new URL('../broadsheet.html', import.meta.url), html, 'utf8');
console.log('Wrote V5 broadsheet.html (23 dispatches, 7 regions, Natural Earth vector)');
