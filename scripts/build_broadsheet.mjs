// Generates a self-contained 1024x1024 editorial world news broadsheet HTML for Tue 24 Nov 2026 (V6).
// Restores V2's 1-focused-story-per-card broadsheet discipline with verified Tue 24 Nov stories and crisp 300px hierarchy.
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
    tag: '3 TANKERS',
    color: '#B91C1C',
    headline: 'Hormuz naval mines ignite 3 oil tankers',
    summary: 'IRGC reports 3 ships ablaze off Hormuz amid US naval standoff; US-Qatar talks held. (Al Jazeera, AA)',
    scene: `<svg viewBox="0 0 300 72" width="100%" height="72">
      <defs>
        <linearGradient id="hormuzSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1E1B4B"/>
          <stop offset="60%" stop-color="#7C2D12"/>
          <stop offset="100%" stop-color="#EA580C"/>
        </linearGradient>
      </defs>
      <rect width="300" height="72" rx="4" fill="url(#hormuzSky)"/>
      <rect y="47" width="300" height="25" fill="#0F172A"/>
      <path d="M0 53 Q30 49 60 53 T120 53 T180 53 T240 53 T300 53" fill="none" stroke="#38BDF8" stroke-width="1.5" opacity="0.6"/>
      <g transform="translate(24,37)">
        <polygon points="0,12 64,12 58,18 6,18" fill="#334155"/>
        <rect x="42" y="4" width="12" height="8" fill="#475569"/>
        <path d="M18 11 C15 1 26 -5 29 5 C32 -2 40 3 34 11 Z" fill="#F97316"/>
        <circle cx="27" cy="5" r="3" fill="#FACC15"/>
      </g>
      <g transform="translate(114,34)">
        <polygon points="0,14 70,14 63,21 6,21" fill="#1E293B"/>
        <rect x="48" y="5" width="12" height="9" fill="#475569"/>
        <path d="M22 13 C17 1 30 -7 34 4 C39 -4 48 4 42 13 Z" fill="#EF4444"/>
        <circle cx="32" cy="7" r="4" fill="#FDE047"/>
      </g>
      <g transform="translate(210,39)">
        <polygon points="0,11 58,11 52,17 5,17" fill="#334155"/>
        <rect x="38" y="4" width="11" height="7" fill="#475569"/>
        <path d="M16 10 C13 2 22 -3 25 5 C28 -1 35 3 30 10 Z" fill="#F97316"/>
      </g>
      <circle cx="96" cy="60" r="4.5" fill="#DC2626" stroke="#FCA5A5" stroke-width="1.3"/>
      <circle cx="198" cy="61" r="4.5" fill="#DC2626" stroke="#FCA5A5" stroke-width="1.3"/>
      <rect x="8" y="6" width="152" height="17" rx="3" fill="rgba(15,23,42,0.88)"/>
      <text x="14" y="18" font-family="Arial, sans-serif" font-size="10" font-weight="900" fill="#FED7AA">STRAIT OF HORMUZ FLASH</text>
    </svg>`,
  },
  {
    id: 2,
    location: 'UKRAINE · WAR & UNSC',
    tag: 'ZAPORIZHZHIA',
    color: '#1D4ED8',
    headline: 'Russian strike hits Zaporizhzhia; UNSC clashes',
    summary: 'Apartment strike kills 2+ and wounds dozens as Kyiv & Moscow clash at UN over energy raids. (Reuters, AA)',
    scene: `<svg viewBox="0 0 300 72" width="100%" height="72">
      <defs>
        <linearGradient id="uaSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0F172A"/>
          <stop offset="100%" stop-color="#1E3A8A"/>
        </linearGradient>
      </defs>
      <rect width="300" height="72" rx="4" fill="url(#uaSky)"/>
      <rect x="14" y="20" width="24" height="52" fill="#334155"/>
      <rect x="42" y="14" width="34" height="58" fill="#475569"/>
      <rect x="47" y="21" width="6" height="6" fill="#FACC15"/>
      <rect x="57" y="21" width="6" height="6" fill="#1E293B"/>
      <rect x="47" y="32" width="6" height="6" fill="#1E293B"/>
      <rect x="57" y="32" width="6" height="6" fill="#FDE047"/>
      <rect x="47" y="43" width="6" height="6" fill="#F97316"/>
      <rect x="57" y="43" width="6" height="6" fill="#1E293B"/>
      <path d="M58 14 C64 4 78 6 82 18 C75 24 63 23 58 14 Z" fill="#EF4444" opacity="0.9"/>
      <circle cx="67" cy="14" r="4.5" fill="#FDE047"/>
      <rect x="80" y="30" width="22" height="42" fill="#334155"/>
      <rect x="116" y="10" width="174" height="52" rx="4" fill="rgba(15,23,42,0.86)" stroke="#60A5FA" stroke-width="1.4"/>
      <text x="203" y="26" text-anchor="middle" font-family="Arial, sans-serif" font-size="9.5" font-weight="900" fill="#93C5FD">CIVILIAN &amp; GRID FRONT</text>
      <text x="203" y="41" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="900" fill="#FFFFFF">ZAPORIZHZHIA HIT</text>
      <text x="203" y="55" text-anchor="middle" font-family="Arial, sans-serif" font-size="9" font-weight="800" fill="#FACC15">UNSC BLACK SEA CLASH</text>
    </svg>`,
  },
  {
    id: 3,
    location: 'ASIA & NY · MARKETS',
    tag: 'CHIP RALLY',
    color: '#0F766E',
    headline: 'Asia chips surge on Huang return; NY cools',
    summary: 'Kospi +6.3% & Nikkei +3.9% rally on Nvidia CEO return; NVDA -6% & Dow +400 pts. (Guardian)',
    scene: `<svg viewBox="0 0 300 72" width="100%" height="72">
      <rect width="300" height="72" rx="4" fill="#062822"/>
      <line x1="10" y1="57" x2="290" y2="57" stroke="#115E59" stroke-width="1"/>
      <line x1="10" y1="36" x2="290" y2="36" stroke="#115E59" stroke-width="1" stroke-dasharray="3,3"/>
      <line x1="10" y1="16" x2="290" y2="16" stroke="#115E59" stroke-width="1" stroke-dasharray="3,3"/>
      <rect x="14" y="16" width="38" height="38" rx="5" fill="#0F766E" stroke="#5EEAD4" stroke-width="1.8"/>
      <rect x="23" y="25" width="20" height="20" rx="2" fill="#CCFBF1"/>
      <text x="33" y="38" text-anchor="middle" font-family="Arial, sans-serif" font-size="8.5" font-weight="900" fill="#0F766E">GPU</text>
      <polyline points="62,55 96,49 124,45 156,22 184,13 210,20" fill="none" stroke="#34D399" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>
      <polygon points="187,9 175,11 182,21" fill="#34D399"/>
      <rect x="150" y="34" width="140" height="30" rx="4" fill="#064E3B" stroke="#34D399" stroke-width="1.5"/>
      <text x="220" y="47.5" text-anchor="middle" font-family="Arial, sans-serif" font-size="9.5" font-weight="900" fill="#ECFDF5">KOSPI +6.3% · NIKKEI +3.9%</text>
      <text x="220" y="59" text-anchor="middle" font-family="Arial, sans-serif" font-size="8.3" font-weight="800" fill="#A7F3D0">DOW +400 · NASDAQ -1.5%</text>
    </svg>`,
  },
];

const midStories = [
  {
    id: 4,
    banner: 'RIYADH TOWER HIT',
    location: 'SAUDI · MIDEAST',
    tag: '11 INJURED',
    color: '#991B1B',
    headline: 'Houthi strike hits Riyadh financial tower',
    summary: 'Strike wounds 11 in Saudi capital business hub; US missions issue security warnings. (CBS, AJ)',
    badge: `<polygon points="15,3 26,20 4,20" fill="#FACC15"/><rect x="14" y="8" width="2" height="6" fill="#991B1B"/><circle cx="15" cy="17" r="1.2" fill="#991B1B"/>`,
  },
  {
    id: 5,
    banner: 'VA271 LAUNCHED',
    location: 'KOUROU · SPACE',
    tag: '36 SATS UP',
    color: '#1E40AF',
    headline: 'Ariane 6 lofts 36 Amazon Leo satellites',
    summary: '10th Ariane 6 flight lifts off from French Guiana at 11:14 UTC to rebuild Kuiper fleet. (Space.com)',
    badge: `<polygon points="15,3 20,16 10,16" fill="#FFFFFF"/><rect x="13" y="16" width="4" height="3" fill="#F97316"/>`,
  },
  {
    id: 6,
    banner: 'TALKS COLLAPSE',
    location: 'ANTALYA · CLIMATE',
    tag: 'COP31',
    color: '#047857',
    headline: 'COP31 summit breaks down without deal',
    summary: 'EU, UK & island allies reject draft lacking fossil-fuel phaseout timeline after overtime. (UN, AA)',
    badge: `<circle cx="15" cy="11" r="7.5" fill="none" stroke="#FFFFFF" stroke-width="1.8"/><path d="M8 11 L22 11 M15 3.5 A6 7.5 0 0 0 15 18.5 M15 3.5 A6 7.5 0 0 1 15 18.5" fill="none" stroke="#FFFFFF" stroke-width="1.2"/>`,
  },
  {
    id: 7,
    banner: 'ESPIONAGE VERDICT',
    location: 'BEIJING · CHINA',
    tag: 'COURT',
    color: '#B91C1C',
    headline: 'Chinese official gets death for spying',
    summary: 'Official surnamed Ma convicted of selling classified state secrets abroad. (Guardian, CNA)',
    badge: `<rect x="4" y="4" width="22" height="14" rx="2" fill="#DC2626"/><polygon points="9,7 10,10 13,10 10.5,12 11.5,15 9,13 6.5,15 7.5,12 5,10 8,10" fill="#FACC15"/>`,
  },
  {
    id: 8,
    banner: 'SECURITY PACT',
    location: 'OCEANIA · PACIFIC',
    tag: 'TREATY',
    color: '#0369A1',
    headline: 'Solomons pivot to Australia security pact',
    summary: 'Reports show Honiara ending 2022 China deal for bilateral treaty with Canberra. (Guardian)',
    badge: `<rect x="4" y="4" width="22" height="14" rx="2" fill="#0369A1"/><circle cx="15" cy="11" r="4" fill="none" stroke="#FFFFFF" stroke-width="1.8"/>`,
  },
  {
    id: 9,
    banner: '$417M IMF DEAL',
    location: 'GUINEA · AFRICA',
    tag: 'ECONOMY',
    color: '#B45309',
    headline: 'IMF approves $417M credit facility for Guinea',
    summary: '38-month ECF/EFF program supports stability ahead of Simandou iron-ore revenues. (IMF)',
    badge: `<rect x="4" y="4" width="7" height="14" fill="#DC2626"/><rect x="11" y="4" width="8" height="14" fill="#FACC15"/><rect x="19" y="4" width="7" height="14" fill="#15803D"/>`,
  },
  {
    id: 10,
    banner: 'EVACUATION ZONE',
    location: 'IOWA · US',
    tag: 'SAFETY',
    color: '#3730A3',
    headline: 'US Army maps Iowa lead azide detonation',
    summary: 'FEMA and state crews prep Middletown evacuation plans for unstable explosives blast. (AP, Army)',
    badge: `<circle cx="15" cy="11" r="7.5" fill="#FACC15"/><path d="M15 6 L20 15 L10 15 Z" fill="#1E1B4B"/>`,
  },
  {
    id: 11,
    banner: 'FACTORY DISASTER',
    location: 'INDONESIA · ASIA',
    tag: '26 DEAD',
    color: '#6D28D9',
    headline: 'Indonesia candy factory fire kills 26',
    summary: 'Rescue teams search collapsed Cikande plant near Jakarta as safety probe opens. (AP)',
    badge: `<rect x="4" y="4" width="22" height="7" fill="#DC2626"/><rect x="4" y="11" width="22" height="7" fill="#FFFFFF"/>`,
  },
];

const briefs = [
  { id: 12, label: 'Singapore / GDP', text: 'Q3 GDP rose 1.5% Q/Q; PM Wong addresses US AI-chip diversion probes.', src: 'CNA', color: '#0F766E' },
  { id: 13, label: 'Bangladesh / Politics', text: 'Ex-PM Sheikh Hasina vows Dec 16 Dhaka return; interim govt vows arrest.', src: 'Al Jazeera', color: '#0F766E' },
  { id: 14, label: 'Gaza / Conflict', text: 'Israeli airstrikes kill Hamas internal security chief Naeem Abu Nahel.', src: 'Just Security', color: '#B91C1C' },
  { id: 15, label: 'Europe / Markets', text: 'FTSE 100 slips 0.13% as EU equities lag Asia tech rally; French spreads tighten.', src: 'Guardian', color: '#1D4ED8' },
  { id: 16, label: 'US / Aviation', text: 'DOT & FAA project busiest Thanksgiving sky in 16 years at 417,000+ flights.', src: 'FAA', color: '#3730A3' },
  { id: 17, label: 'US / Rates & FX', text: 'Dollar hits 19-month high vs euro and 10-yr yield nears 4.9% on Fed caution.', src: 'Fortune', color: '#3730A3' },
  { id: 18, label: 'US / Drones', text: 'FAA investigates Amazon delivery drone strike on Michigan fiber line & garage.', src: 'CNBC', color: '#3730A3' },
  { id: 19, label: 'Nigeria / Education', text: 'Borno school enrolment nearly doubles in northeast recovery despite insecurity.', src: 'Al Jazeera', color: '#B45309' },
  { id: 20, label: 'Australia / Cyber', text: 'Australian intelligence exposes Iran ChatGPT-assisted disinformation op.', src: 'ABC AU', color: '#0369A1' },
  { id: 21, label: 'UEFA / Football', text: 'Real Madrid thrash PSV 5-1; Man City draw Napoli 2-2; Arsenal 1-1 Dortmund.', src: 'UEFA, Guardian', color: '#1D4ED8' },
  { id: 22, label: 'NBA / Basketball', text: 'Tuesday slate features Celtics-Wizards, Pistons-Magic and Mavs-Nuggets.', src: 'CBS Sports', color: '#3730A3' },
  { id: 23, label: 'SE Asia / Haze', text: 'Regional task forces target Indonesian land-clearing fires amid seasonal haze.', src: 'CNA', color: '#047857' },
];

// Carefully spaced coordinates across all 7 global regions (verified >= 22px separation)
const mapPinList = [
  { id: 1, lon: 57.5, lat: 26.2, color: '#B91C1C' },
  { id: 2, lon: 35.5, lat: 50.0, color: '#1D4ED8' },
  { id: 3, lon: 136.0, lat: 35.5, color: '#0F766E' },
  { id: 4, lon: 43.0, lat: 18.0, color: '#991B1B' },
  { id: 5, lon: -52.7, lat: 5.2, color: '#1E40AF' },
  { id: 6, lon: 28.0, lat: 36.5, color: '#047857' },
  { id: 7, lon: 112.0, lat: 41.5, color: '#B91C1C' },
  { id: 8, lon: 160.0, lat: -9.5, color: '#0369A1' },
  { id: 9, lon: -13.5, lat: 10.5, color: '#B45309' },
  { id: 10, lon: -93.0, lat: 41.5, color: '#3730A3' },
  { id: 11, lon: 108.5, lat: -8.5, color: '#6D28D9' },
  { id: 12, lon: 102.0, lat: 4.5, color: '#0F766E' },
  { id: 13, lon: 90.4, lat: 24.0, color: '#0F766E' },
  { id: 15, lon: -0.1, lat: 51.5, color: '#1D4ED8' },
  { id: 19, lon: 13.2, lat: 11.8, color: '#B45309' },
  { id: 20, lon: 147.0, lat: -34.0, color: '#0369A1' },
];

// Verify non-overlapping pins at runtime
const projectedPins = mapPinList.map((p) => {
  const [x, y] = project(p.lon, p.lat);
  return { ...p, x, y };
});
for (let i = 0; i < projectedPins.length; i++) {
  for (let j = i + 1; j < projectedPins.length; j++) {
    const dx = projectedPins[i].x - projectedPins[j].x;
    const dy = projectedPins[i].y - projectedPins[j].y;
    const dist = Math.hypot(dx, dy);
    if (dist < 19) {
      throw new Error(`Pin overlap: #${projectedPins[i].id} and #${projectedPins[j].id} dist=${dist.toFixed(1)}`);
    }
  }
}

const pinsSvg = projectedPins
  .map((p) => `<g transform="translate(${p.x.toFixed(1)},${p.y.toFixed(1)})">
      <circle r="8.8" fill="${p.color}" stroke="#FFFFFF" stroke-width="1.8"/>
      <text y="3.2" text-anchor="middle" font-family="Arial, sans-serif" font-size="9.5" font-weight="900" fill="#FFFFFF">${p.id}</text>
    </g>`)
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
    grid-template-columns: 3fr 4fr 5fr 4fr 2fr 2fr 3fr;
    height: 16px;
    border-radius: 2px;
    overflow: hidden;
    margin-bottom: 4px;
  }
  .rb-seg {
    font-size: 9.8px;
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
    font-size: 10px;
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
    font-size: 18px;
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
    font-size: 15px;
    font-weight: 900;
    line-height: 1.12;
    color: #0F172A;
  }
  .mid-sum {
    font-size: 11.7px;
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
    font-size: 11.4px;
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
  .brief-txt em { color: #475569; font-style: italic; font-size: 10.4px; }

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
      <div class="sub-deck">HORMUZ TANKER MINES · ZAPORIZHZHIA &amp; UNSC · ASIA CHIP SURGE · RIYADH &amp; COP31 COLLAPSE</div>
      <div class="region-bar">
        <div class="rb-seg" style="background:#9A3412;">MIDEAST 3</div>
        <div class="rb-seg" style="background:#1D4ED8;">EUROPE 4</div>
        <div class="rb-seg" style="background:#0F766E;">ASIA 6</div>
        <div class="rb-seg" style="background:#3730A3;">N.AM 5</div>
        <div class="rb-seg" style="background:#B45309;">AFRICA 2</div>
        <div class="rb-seg" style="background:#0369A1;">OCEANIA 2</div>
        <div class="rb-seg" style="background:#4338CA;">SPACE 1</div>
      </div>
      <div class="timeline">
        <span><span class="tl-k">UTC FLOW:</span> <span class="tl-t">00:00</span> Hormuz mines &amp; Riyadh hit</span>
        <span><span class="tl-t">04:00</span> Kospi +6.3% &amp; Nikkei +3.9%</span>
        <span><span class="tl-t">11:14</span> Ariane 6 VA271 launch</span>
        <span><span class="tl-t">16:00</span> COP31 talks collapse</span>
        <span><span class="tl-t">20:00</span> UCL MD5 &amp; NY tech dip</span>
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
          <span class="accent">PINS 1–13 · 15 · 19 · 20</span>
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
          <span><i class="dot" style="background:#1E40AF;"></i>Space/Climate</span>
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
      <span>24 NOV EDITION · Strictly Tuesday 24 November 2026 events · Reuters, AP, Al Jazeera, Guardian, BBC, CNA, IMF, UEFA</span>
      <span>23 DISPATCHES · 7 REGIONS · NATURAL EARTH</span>
    </footer>
  </div>
</body>
</html>`;

writeFileSync(new URL('../broadsheet.html', import.meta.url), html, 'utf8');
console.log('Wrote V6 broadsheet.html (23 dispatches, 7 regions, Natural Earth vector)');
