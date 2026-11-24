// Generates a self-contained 1024x1024 editorial world news broadsheet HTML for Tue 24 Nov 2026 (V3).
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const topojson = require('topojson-client');
const worldAtlasPath = require.resolve('world-atlas/countries-110m.json');
const worldData = JSON.parse(readFileSync(worldAtlasPath, 'utf8'));
const countries = topojson.feature(worldData, worldData.objects.countries);

// Natural Earth 110m vector projection inside the bottom-left atlas panel (468 x 268)
const MAP_W = 468;
const MAP_H = 268;
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
    location: 'MIDEAST · HORMUZ',
    tag: 'MINES & TALKS',
    color: '#B91C1C',
    lon: 56.3,
    lat: 26.6,
    art: './assets/hero1_hormuz.jpg',
    headline: 'Hormuz naval mines hit tankers; Iran sets talk terms',
    summary: 'IRGC says tankers ablaze off Hormuz amid US blockade; Qalibaf refuses talks until sanctions lift. (Al Jazeera, WaPo)',
  },
  {
    id: 2,
    location: 'EUROPE · UKRAINE',
    tag: 'ZAPORIZHZHIA',
    color: '#1D4ED8',
    lon: 35.1,
    lat: 47.8,
    art: './assets/hero2_ukraine.jpg',
    headline: 'Zelensky urges 4-way talks as Zaporizhzhia struck',
    summary: 'Overnight Russian barrage kills 2 & wounds 40+; Kyiv rejects Libya warning over Merkury corvette hit. (WaPo, France24)',
  },
  {
    id: 3,
    location: 'US & TECH · MARKETS',
    tag: 'NVDA +31.5%',
    color: '#0F766E',
    lon: -122.0,
    lat: 37.4,
    art: './assets/hero3_nvidia.jpg',
    headline: 'Huang returns as Nvidia adds $952B; Megaspeed hit',
    summary: 'Nvidia surges 31.5% on CEO reinstatement after Trump nod; US blacklists Singapore’s Megaspeed. (Guardian, AJ)',
  },
];

const midStories = [
  {
    id: 4,
    banner: 'GDP UPGRADED ~6%',
    location: 'SINGAPORE · ASIA',
    tag: '6.1% Q3',
    color: '#047857',
    lon: 101.5,
    lat: 3.2,
    headline: 'Singapore lifts 2026 GDP to ~6%; probes chips',
    summary: 'Q3 grows 6.1% on AI surge; PM Wong vows zero tolerance for US chip-ban evasion. (CNA, Edge)',
    badge: `<rect x="4" y="4" width="22" height="14" rx="2" fill="#DC2626"/><rect x="4" y="11" width="22" height="7" fill="#FFFFFF"/><circle cx="10" cy="7.5" r="2.5" fill="#FFFFFF"/>`,
  },
  {
    id: 5,
    banner: 'HYBRID EV CAPS',
    location: 'BRUSSELS · EUROPE',
    tag: 'EU TRADE',
    color: '#6D28D9',
    lon: 4.35,
    lat: 50.85,
    headline: 'EU sets tariff-free quotas on hybrid EVs',
    summary: 'Dec 1 caps hit China, Japan, Korea & UK hybrids; EU-UK summit backs Kyiv. (Guardian, EU)',
    badge: `<rect x="4" y="4" width="22" height="14" rx="2" fill="#1D4ED8"/><circle cx="15" cy="11" r="4.5" fill="none" stroke="#FACC15" stroke-width="1.6" stroke-dasharray="2,1.6"/>`,
  },
  {
    id: 6,
    banner: 'FACTORY FIRE TOLL',
    location: 'BANTEN · INDONESIA',
    tag: '24+ DEAD',
    color: '#991B1B',
    lon: 109.5,
    lat: -8.5,
    headline: 'Indonesia factory fire kills 24+; ex-chief charged',
    summary: 'Blocked exits trap candy workers west of Jakarta; ex-police head faces treason charge. (NYT, JT)',
    badge: `<rect x="4" y="4" width="22" height="7" fill="#DC2626"/><rect x="4" y="11" width="22" height="7" fill="#FFFFFF"/>`,
  },
  {
    id: 7,
    banner: 'CANBERRA PACT',
    location: 'OCEANIA · PACIFIC',
    tag: 'SECURITY',
    color: '#0369A1',
    lon: 149.1,
    lat: -35.3,
    headline: 'Solomons pivot to Australia pact over China',
    summary: 'PM Wale visits Canberra for treaty; probe exposes Iran ChatGPT disinfo op. (AA, ABC AU)',
    badge: `<rect x="4" y="4" width="22" height="14" rx="2" fill="#0369A1"/><polygon points="15,6 16.5,10 20.5,10 17.3,12.3 18.5,16 15,13.7 11.5,16 12.7,12.3 9.5,10 13.5,10" fill="#FFFFFF"/>`,
  },
];

const cornerStories = [
  {
    id: 8,
    location: 'AFRICA · NIGERIA & SA',
    tag: 'CURFEW & AI',
    color: '#B45309',
    lon: 6.0,
    lat: 5.5,
    headline: 'Delta sets curfew after rally attack; SA AI plan',
    summary: 'Ughelli shooting forces dusk-to-dawn curfew as Dangote IPO plan clears; Ramaphosa sets 90-day AI roadmap. (Punch, iAfrica)',
  },
  {
    id: 9,
    location: 'AMERICAS · VENEZUELA',
    tag: 'DEFENSE & FAA',
    color: '#3730A3',
    lon: -73.0,
    lat: 12.0,
    headline: 'US & Venezuela ink defense pact; Mexico talks',
    summary: 'Hegseth & Rodríguez sign military & oil accord; FAA probes Amazon drone hit; Ebrard visits Beijing. (AP, CNBC)',
  },
  {
    id: 10,
    location: 'LATAM & ORBIT · SPACE',
    tag: 'VA271 · ISS',
    color: '#1E40AF',
    lon: -50.0,
    lat: 2.0,
    headline: 'Ariane 6 sets Tue launch; Progress 97 docks',
    summary: 'Kourou flight carries 36 Amazon Leo satellites; Baikonur sends 3 tons of cargo to the ISS. (Arianespace, NASA)',
  },
  {
    id: 11,
    location: 'SCIENCE · CLIMATE',
    tag: 'MOON & COP31',
    color: '#4338CA',
    lon: 115.8,
    lat: -31.9,
    headline: 'Far-side Moon rocks rewrite impacts; COP31 stalls',
    summary: 'Curtin study overturns sudden-cataclysm model; UN climate summit ends overtime without major deal. (ScienceDaily, Reuters)',
  },
];

const allPins = [...heroStories, ...midStories, ...cornerStories];
const pinsSvg = allPins
  .map((p) => {
    const [x, y] = project(p.lon, p.lat);
    return `<g transform="translate(${x.toFixed(1)},${y.toFixed(1)})">
      <circle r="9.4" fill="${p.color}" stroke="#FFFFFF" stroke-width="2"/>
      <text y="3.4" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="900" fill="#FFFFFF">${p.id}</text>
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
    <div class="hero-art"><img src="${s.art}" alt="${s.location}" /></div>
    <div class="hero-hed">${s.headline}</div>
    <div class="hero-sum">${s.summary}</div>
  </div>`;
}

function renderMidCard(s) {
  return `<div class="mid-card">
    <div class="mid-banner" style="background:${s.color};">
      <svg viewBox="0 0 30 22" width="26" height="19">${s.badge}</svg>
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

function renderCornerCard(s) {
  return `<div class="corner-card">
    <div class="corner-meta">
      <span class="badge-sm" style="background:${s.color};">${s.id}</span>
      <span class="corner-loc" style="color:${s.color};">${s.location}</span>
      <span class="corner-tag">${s.tag}</span>
    </div>
    <div class="corner-hed">${s.headline}</div>
    <div class="corner-sum">${s.summary}</div>
  </div>`;
}

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
    gap: 7px;
  }
  .masthead {
    border-top: 4px solid #0F172A;
    border-bottom: 2px solid #0F172A;
    padding-top: 3px;
    padding-bottom: 5px;
    flex-shrink: 0;
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
    font-size: 40px;
    font-weight: 900;
    letter-spacing: 0.02em;
    line-height: 1.04;
    color: #0B1220;
    margin: 2px 0 3px 0;
  }
  .sub-deck {
    text-align: center;
    font-size: 12px;
    font-weight: 900;
    letter-spacing: 0.03em;
    color: #7F1D1D;
    text-transform: uppercase;
    margin-bottom: 5px;
  }
  .region-bar {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    height: 16px;
    border-radius: 2px;
    overflow: hidden;
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

  .hero-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 9px;
    height: 318px;
    flex-shrink: 0;
  }
  .hero-card {
    background: #FFFDF8;
    border: 1.6px solid #94A3B8;
    border-radius: 6px;
    padding: 8px 9px;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  .hero-top {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .badge {
    width: 21px;
    height: 21px;
    border-radius: 50%;
    color: #FFFFFF;
    font-size: 12px;
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
  .hero-art {
    width: 100%;
    height: 162px;
    border-radius: 4px;
    overflow: hidden;
    border: 1px solid #CBD5E1;
    background: #0F172A;
    flex-shrink: 0;
  }
  .hero-art img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .hero-hed {
    font-family: Georgia, "Times New Roman", serif;
    font-size: 19px;
    font-weight: 900;
    line-height: 1.12;
    color: #0F172A;
  }
  .hero-sum {
    font-size: 12.6px;
    font-weight: 600;
    line-height: 1.24;
    color: #1F2937;
  }

  .mid-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 9px;
    height: 196px;
    flex-shrink: 0;
  }
  .mid-card {
    background: #FFFDF8;
    border: 1.6px solid #94A3B8;
    border-radius: 6px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .mid-banner {
    height: 27px;
    padding: 0 8px;
    display: flex;
    align-items: center;
    gap: 6px;
    color: #FFFFFF;
    font-size: 10.5px;
    font-weight: 900;
    letter-spacing: 0.05em;
    flex-shrink: 0;
  }
  .mid-body {
    padding: 7px 9px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
  }
  .mid-meta {
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .badge-sm {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    color: #FFFFFF;
    font-size: 10.5px;
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
    font-size: 9.8px;
    font-weight: 900;
    white-space: nowrap;
  }
  .mid-hed {
    font-family: Georgia, "Times New Roman", serif;
    font-size: 17px;
    font-weight: 900;
    line-height: 1.14;
    color: #0F172A;
  }
  .mid-sum {
    font-size: 12.8px;
    font-weight: 600;
    line-height: 1.26;
    color: #1F2937;
  }

  .bottom-row {
    display: grid;
    grid-template-columns: 486px 1fr;
    gap: 9px;
    flex: 1;
    min-height: 0;
  }
  .atlas-panel {
    background: #FFFDF8;
    border: 1.6px solid #94A3B8;
    border-radius: 6px;
    padding: 7px 8px;
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
    height: 268px;
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

  .corner-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: 8px;
  }
  .corner-card {
    background: #FFFDF8;
    border: 1.6px solid #94A3B8;
    border-radius: 6px;
    padding: 7px 9px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .corner-meta {
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .corner-loc {
    font-size: 10px;
    font-weight: 900;
    letter-spacing: 0.02em;
    flex-grow: 1;
    white-space: nowrap;
  }
  .corner-tag {
    font-size: 9.5px;
    font-weight: 900;
    color: #334155;
    background: #E2E8F0;
    padding: 1px 5px;
    border-radius: 3px;
    white-space: nowrap;
  }
  .corner-hed {
    font-family: Georgia, "Times New Roman", serif;
    font-size: 16.4px;
    font-weight: 900;
    line-height: 1.14;
    color: #0F172A;
  }
  .corner-sum {
    font-size: 12.4px;
    font-weight: 600;
    line-height: 1.25;
    color: #1F2937;
  }

  .footer {
    background: #0F172A;
    color: #F8FAFC;
    font-size: 10.5px;
    font-weight: 800;
    padding: 5px 10px;
    border-radius: 4px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;
  }
</style>
</head>
<body>
  <div class="page">
    <header class="masthead">
      <div class="top-strip">
        <span>THE WORLD IN ONE DAY</span>
        <span class="red">TUESDAY 24 NOVEMBER 2026 · ALL 7 REGIONS · 11 LEAD DISPATCHES</span>
      </div>
      <div class="title-line">TUESDAY · 24 NOVEMBER 2026</div>
      <div class="sub-deck">HORMUZ TANKER MINES · ZAPORIZHZHIA &amp; 4-WAY TALKS · NVIDIA +31.5% HUANG RETURN · SINGAPORE 6% GDP</div>
      <div class="region-bar">
        <div class="rb-seg" style="background:#B91C1C;">MIDEAST</div>
        <div class="rb-seg" style="background:#1D4ED8;">EUROPE</div>
        <div class="rb-seg" style="background:#0F766E;">US &amp; TECH</div>
        <div class="rb-seg" style="background:#047857;">ASIA</div>
        <div class="rb-seg" style="background:#0369A1;">OCEANIA</div>
        <div class="rb-seg" style="background:#B45309;">AFRICA</div>
        <div class="rb-seg" style="background:#4338CA;">LATAM &amp; SCI</div>
      </div>
    </header>

    <section class="hero-row">
      ${heroStories.map(renderHeroCard).join('\n')}
    </section>

    <section class="mid-row">
      ${midStories.map(renderMidCard).join('\n')}
    </section>

    <section class="bottom-row">
      <div class="atlas-panel">
        <div class="panel-head">
          <span>GLOBAL DISPATCH ATLAS · TUESDAY 24 NOV 2026</span>
          <span class="accent">PINS 1–11</span>
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
          <span><i class="dot" style="background:#0F766E;"></i>US/Tech</span>
          <span><i class="dot" style="background:#047857;"></i>Asia</span>
          <span><i class="dot" style="background:#0369A1;"></i>Oceania</span>
          <span><i class="dot" style="background:#B45309;"></i>Africa</span>
          <span><i class="dot" style="background:#4338CA;"></i>LatAm/Sci</span>
        </div>
      </div>

      <div class="corner-grid">
        ${cornerStories.map(renderCornerCard).join('\n')}
      </div>
    </section>

    <footer class="footer">
      <span>TUESDAY 24 NOVEMBER 2026 VERIFIED</span>
      <span>ALL 7 REGIONS · REUTERS / AP / BBC / WAPO / GUARDIAN / CNA / NASA · NATURAL EARTH ATLAS</span>
    </footer>
  </div>
</body>
</html>`;

writeFileSync(new URL('../broadsheet.html', import.meta.url), html, 'utf8');
console.log('Wrote V3 broadsheet.html (11 lead dispatches, 7 regions, bespoke editorial art)');
