// Generates a self-contained 1024x1024 editorial world news broadsheet HTML for Tue 24 Nov 2026.
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const topojson = require('topojson-client');
const worldAtlasPath = require.resolve('world-atlas/countries-110m.json');
const worldData = JSON.parse(readFileSync(worldAtlasPath, 'utf8'));
const countries = topojson.feature(worldData, worldData.objects.countries);

// Map viewport inside the center hero panel: 408 x 258 SVG viewBox
const MAP_W = 408;
const MAP_H = 258;
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
    if (i > 0 && Math.abs(lon - prevLon) > 180) {
      // Split dateline jumps cleanly
      const [x, y] = project(lon, lat);
      d += `M${x.toFixed(1)},${y.toFixed(1)}`;
    } else {
      const [x, y] = project(lon, lat);
      d += `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    }
    prevLon = lon;
  }
  return d + 'Z';
}

function geomToPath(geom) {
  if (!geom) return '';
  if (geom.type === 'Polygon') {
    return geom.coordinates.map(ringToPath).join(' ');
  }
  if (geom.type === 'MultiPolygon') {
    return geom.coordinates.map((poly) => poly.map(ringToPath).join(' ')).join(' ');
  }
  return '';
}

const countryPaths = countries.features
  .filter((f) => String(f.id) !== '010') // omit Antarctica for cleaner habitable map scale
  .map((f) => `<path d="${geomToPath(f.geometry)}" />`)
  .join('\n');

// Graticule lines every 30 deg lon, 20 deg lat
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

const stories = [
  {
    id: 1,
    region: 'AMERICAS · TECH',
    color: '#1D4ED8',
    lon: -121.9,
    lat: 37.4,
    headline: 'NVIDIA REHIRES HUANG',
    summary: 'CEO returns after Trump push; shares jump ~$1T. US blacklists SG firm Megaspeed.',
    icon: `<svg viewBox="0 0 48 48"><rect x="4" y="10" width="22" height="22" rx="4" fill="#DBEAFE" stroke="#1D4ED8" stroke-width="2.5"/><rect x="10" y="16" width="10" height="10" rx="1" fill="#1D4ED8"/><path d="M28 34 L34 24 L38 27 L44 12" fill="none" stroke="#059669" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/><polygon points="45,9 38,14 44,18" fill="#059669"/></svg>`,
  },
  {
    id: 2,
    region: 'EUROPE · NATO',
    color: '#6D28D9',
    lon: 12.0,
    lat: 59.0,
    headline: 'NATO SPACE ALERT',
    summary: 'Allies warn Russia may launch nuclear space weapon; EU plans Russia sports ban.',
    icon: `<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="17" fill="#EDE9FE" stroke="#6D28D9" stroke-width="2.2"/><ellipse cx="24" cy="24" rx="20" ry="7.5" transform="rotate(-25 24 24)" fill="none" stroke="#6D28D9" stroke-width="2.4"/><circle cx="35" cy="16" r="4.5" fill="#DC2626"/><path d="M19 25 L24 15 L29 25 Z" fill="#6D28D9"/></svg>`,
  },
  {
    id: 3,
    region: 'N. AFRICA · WAR',
    color: '#B91C1C',
    lon: 16.5,
    lat: 29.0,
    headline: 'LIBYA DRONE STRIKE',
    summary: 'Ukrainian naval drones hit Russian warship off Benghazi, widening conflict reach.',
    icon: `<svg viewBox="0 0 48 48"><path d="M5 34 Q14 29 24 34 T43 34" fill="none" stroke="#2563EB" stroke-width="2.8" stroke-linecap="round"/><path d="M11 28 L37 28 L33 20 L16 20 Z" fill="#374151"/><path d="M22 20 L22 12 L27 12 L27 20" fill="#111827"/><circle cx="35" cy="13" r="6.5" fill="#FEE2E2" stroke="#B91C1C" stroke-width="2.2"/><path d="M35 9 L35 17 M31 13 L39 13" stroke="#B91C1C" stroke-width="2.2"/></svg>`,
  },
  {
    id: 4,
    region: 'GLOBAL · COP31',
    color: '#B45309',
    lon: 34.0,
    lat: 39.0,
    headline: 'COP31 NO-DEAL SPLIT',
    summary: 'Longest UN climate talks end without fossil-fuel deal; Africa slams rich-nation divide.',
    icon: `<svg viewBox="0 0 48 48"><circle cx="21" cy="25" r="14" fill="#FEF3C7" stroke="#B45309" stroke-width="2.5"/><path d="M14 17 Q21 24 17 33 M27 15 Q24 24 29 34" fill="none" stroke="#B45309" stroke-width="2.2"/><path d="M32 8 L42 18 M37 13 L29 21" stroke="#DC2626" stroke-width="3.5" stroke-linecap="round"/></svg>`,
  },
  {
    id: 5,
    region: 'MIDDLE EAST',
    color: '#9A3412',
    lon: 52.5,
    lat: 31.0,
    headline: 'US SANCTIONS IRAN',
    summary: 'Targets shadow banking; Oxfam warns Gaza bombardment leaves a toxic wasteland.',
    icon: `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="15" fill="#FFEDD5" stroke="#9A3412" stroke-width="2.4"/><path d="M12 25 L28 25 L25 15 L15 15 Z" fill="#9A3412"/><line x1="9" y1="9" x2="31" y2="31" stroke="#DC2626" stroke-width="3.2"/></svg>`,
  },
  {
    id: 6,
    region: 'SOUTH ASIA',
    color: '#0F766E',
    lon: 85.3,
    lat: 27.7,
    headline: 'INDIA $1.6B NEPAL AID',
    summary: 'Modi pledges Nepal flood & rail reset; GTA VI craze packs Indian gaming cafes.',
    icon: `<svg viewBox="0 0 40 40"><rect x="4" y="9" width="32" height="22" rx="4" fill="#CCFBF1" stroke="#0F766E" stroke-width="2.4"/><text x="20" y="24" text-anchor="middle" font-size="12" font-weight="900" fill="#0F766E">$1.6B</text></svg>`,
  },
  {
    id: 7,
    region: 'SE ASIA',
    color: '#15803D',
    lon: 108.0,
    lat: -5.5,
    headline: 'INDONESIA 12M HA PLAN',
    summary: 'Eyes 12M ha biofuel & food land; Prabowo names two vice-president candidates.',
    icon: `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="15" fill="#DCFCE7" stroke="#15803D" stroke-width="2.4"/><path d="M20 30 L20 15 M20 23 C13 22 12 15 17 11 C21 15 21 20 20 23 M20 20 C27 19 28 13 23 9 C20 13 20 17 20 20" fill="#15803D"/></svg>`,
  },
  {
    id: 8,
    region: 'OCEANIA',
    color: '#0369A1',
    lon: 145.0,
    lat: -28.0,
    headline: 'ASX JUMPS · NZ PARROT',
    summary: 'Sydney stocks rally on tech; rare kākāriki karaka pair lays two clutches in NZ.',
    icon: `<svg viewBox="0 0 40 40"><rect x="4" y="6" width="32" height="28" rx="4" fill="#E0F2FE" stroke="#0369A1" stroke-width="2.4"/><polyline points="9,26 16,20 22,23 31,12" fill="none" stroke="#0369A1" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  {
    id: 9,
    region: 'AFRICA',
    color: '#7C2D12',
    lon: 29.0,
    lat: -1.5,
    headline: 'KENYA–DRC TIES RESET',
    summary: 'Neighbors restore relations; S. Africa outrage after dad learns murder via Facebook.',
    icon: `<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="15" fill="#FEF3C7" stroke="#7C2D12" stroke-width="2.4"/><path d="M11 21 L18 15 L22 19 L29 14" fill="none" stroke="#7C2D12" stroke-width="3" stroke-linecap="round"/><circle cx="13" cy="26" r="3" fill="#7C2D12"/><circle cx="27" cy="26" r="3" fill="#7C2D12"/></svg>`,
  },
  {
    id: 10,
    region: 'LATIN AMERICA',
    color: '#991B1B',
    lon: -99.1,
    lat: 19.4,
    headline: 'MEXICO KINGPIN CLASH',
    summary: 'Gunmen attack troops after drug lord arrest; drone strike hits Colombian city.',
    icon: `<svg viewBox="0 0 40 40"><polygon points="20,6 35,32 5,32" fill="#FEE2E2" stroke="#991B1B" stroke-width="2.5"/><line x1="20" y1="15" x2="20" y2="24" stroke="#991B1B" stroke-width="3" stroke-linecap="round"/><circle cx="20" cy="28" r="1.8" fill="#991B1B"/></svg>`,
  },
  {
    id: 11,
    region: 'SCIENCE · SPACE',
    color: '#3730A3',
    lon: 18.0,
    lat: 45.0,
    headline: 'LUNAR SOIL POTATOES',
    summary: 'Scientists sprout potatoes in Moon dust; spacecraft reaches Mercury after 8 years.',
    icon: `<svg viewBox="0 0 40 40"><circle cx="20" cy="23" r="11" fill="#E0E7FF" stroke="#3730A3" stroke-width="2.4"/><path d="M20 17 L20 7 M20 12 C14 9 14 6 19 6 M20 13 C26 10 26 7 21 7" fill="none" stroke="#15803D" stroke-width="2.6" stroke-linecap="round"/></svg>`,
  },
  {
    id: 12,
    region: 'WORLD SPORT',
    color: '#047857',
    lon: -7.0,
    lat: 52.0,
    headline: 'BRENTFORD · 2031 WWC',
    summary: 'Brentford beat 10-man Everton; US & UK awarded 2031 and 2035 Women’s World Cups.',
    icon: `<svg viewBox="0 0 40 40"><circle cx="15" cy="21" r="10" fill="#ECFDF5" stroke="#047857" stroke-width="2.4"/><polygon points="15,14 20,18 18,24 12,24 10,18" fill="#047857"/><rect x="26" y="8" width="10" height="15" rx="2" fill="#DC2626"/></svg>`,
  },
];

const pinOverrides = {};

const pinsSvg = stories
  .map((s) => {
    const [lon, lat] = pinOverrides[s.id] ?? [s.lon, s.lat];
    const [x, y] = project(lon, lat);
    return `
      <g transform="translate(${x.toFixed(1)},${y.toFixed(1)})">
        <circle r="10.5" fill="${s.color}" stroke="#FFFFFF" stroke-width="2" />
        <text y="3.8" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="900" fill="#FFFFFF">${s.id}</text>
      </g>`;
  })
  .join('\n');

function renderSideCard(s) {
  return `
  <div class="side-card" style="border-top: 4px solid ${s.color};">
    <div class="card-top">
      <span class="badge" style="background:${s.color};">${s.id}</span>
      <span class="region" style="color:${s.color};">${s.region}</span>
      <div class="mini-icon">${s.icon}</div>
    </div>
    <div class="card-hed">${s.headline}</div>
    <div class="card-sum">${s.summary}</div>
  </div>`;
}

function renderBottomCard(s) {
  return `
  <div class="grid-card" style="border-top: 4px solid ${s.color};">
    <div class="card-top">
      <span class="badge" style="background:${s.color};">${s.id}</span>
      <span class="region" style="color:${s.color};">${s.region}</span>
      <div class="mini-icon-sm">${s.icon}</div>
    </div>
    <div class="card-hed-sm">${s.headline}</div>
    <div class="card-sum-sm">${s.summary}</div>
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
    background: #F6F1E6;
    color: #111827;
    font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
  }
  .page {
    width: 1024px;
    height: 1024px;
    padding: 12px 16px 10px 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .masthead {
    border-top: 4px solid #111827;
    border-bottom: 3px double #111827;
    padding: 4px 0 6px 0;
  }
  .edition-strip {
    display: flex;
    justify-content: space-between;
    font-size: 12.5px;
    font-weight: 800;
    letter-spacing: 0.08em;
    color: #7F1D1D;
    text-transform: uppercase;
    margin-bottom: 2px;
  }
  .title-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
  }
  .main-title {
    font-family: Georgia, "Times New Roman", serif;
    font-size: 40px;
    font-weight: 900;
    letter-spacing: -0.02em;
    color: #0F172A;
    line-height: 1.02;
  }
  .date-pill {
    background: #991B1B;
    color: #FFFFFF;
    font-size: 17px;
    font-weight: 900;
    padding: 5px 12px;
    border-radius: 4px;
    letter-spacing: 0.04em;
  }
  .sub-deck {
    font-size: 14px;
    font-weight: 800;
    color: #1F2937;
    margin-top: 3px;
    letter-spacing: 0.01em;
  }

  .hero-row {
    display: grid;
    grid-template-columns: 274px 424px 274px;
    gap: 10px;
    height: 392px;
  }
  .side-col {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .side-card {
    background: #FFFDF8;
    border: 1.5px solid #CBD5E1;
    border-radius: 6px;
    padding: 9px 11px;
    height: 191px;
    display: flex;
    flex-direction: column;
  }
  .map-panel {
    background: #FFFDF8;
    border: 1.5px solid #94A3B8;
    border-radius: 6px;
    padding: 8px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 392px;
  }
  .map-title {
    font-size: 12.5px;
    font-weight: 900;
    letter-spacing: 0.06em;
    color: #0F172A;
    text-transform: uppercase;
    display: flex;
    justify-content: space-between;
    margin-bottom: 4px;
  }
  .map-box {
    background: #DCE8F2;
    border: 1px solid #94A3B8;
    border-radius: 4px;
    overflow: hidden;
    height: 250px;
  }
  .stat-strip {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
    margin-top: 6px;
  }
  .stat-box {
    background: #F1EDE2;
    border-left: 4px solid #1E293B;
    padding: 5px 8px;
    border-radius: 3px;
  }
  .stat-k {
    font-size: 11px;
    font-weight: 900;
    color: #7F1D1D;
    letter-spacing: 0.04em;
  }
  .stat-v {
    font-size: 13.5px;
    font-weight: 800;
    color: #0F172A;
    line-height: 1.15;
  }

  .bottom-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
    height: 432px;
  }
  .grid-card {
    background: #FFFDF8;
    border: 1.5px solid #CBD5E1;
    border-radius: 6px;
    padding: 9px 10px;
    display: flex;
    flex-direction: column;
    height: 211px;
  }
  .card-top {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 5px;
  }
  .badge {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    color: #FFFFFF;
    font-size: 13px;
    font-weight: 900;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .region {
    font-size: 11.5px;
    font-weight: 900;
    letter-spacing: 0.04em;
    flex-grow: 1;
    white-space: nowrap;
  }
  .mini-icon {
    width: 44px;
    height: 44px;
    flex-shrink: 0;
  }
  .mini-icon-sm {
    width: 38px;
    height: 38px;
    flex-shrink: 0;
  }
  .card-hed {
    font-family: Georgia, "Times New Roman", serif;
    font-size: 20.5px;
    font-weight: 900;
    line-height: 1.1;
    color: #0F172A;
    margin-bottom: 6px;
  }
  .card-sum {
    font-size: 16px;
    font-weight: 600;
    line-height: 1.24;
    color: #1F2937;
  }
  .card-hed-sm {
    font-family: Georgia, "Times New Roman", serif;
    font-size: 18.5px;
    font-weight: 900;
    line-height: 1.1;
    color: #0F172A;
    margin-bottom: 6px;
  }
  .card-sum-sm {
    font-size: 15.5px;
    font-weight: 600;
    line-height: 1.24;
    color: #1F2937;
  }

  .footer {
    background: #111827;
    color: #F8FAFC;
    font-size: 12.5px;
    font-weight: 800;
    letter-spacing: 0.04em;
    padding: 7px 12px;
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
      <div class="edition-strip">
        <span>GLOBAL DAILY DISPATCH · NO. 1124</span>
        <span>ALL 7 REGIONS · 12 VERIFIED STORIES</span>
        <span>00:05 UTC / APAC MORNING</span>
      </div>
      <div class="title-row">
        <div class="main-title">WORLD NEWS IN ONE PAGE</div>
        <div class="date-pill">TUE 24 NOV 2026</div>
      </div>
      <div class="sub-deck">NVIDIA REHIRES HUANG (+~$1T) · NATO SPACE-NUCLEAR WARNING · LIBYA NAVAL DRONE STRIKE · COP31 NO-DEAL</div>
    </header>

    <section class="hero-row">
      <div class="side-col">
        ${renderSideCard(stories[0])}
        ${renderSideCard(stories[1])}
      </div>

      <div class="map-panel">
        <div class="map-title">
          <span>GLOBAL ATLAS · 24 NOV 2026</span>
          <span style="color:#7F1D1D;">1–12 DISPATCHES</span>
        </div>
        <div class="map-box" style="height:258px;">
          <svg viewBox="0 0 ${MAP_W} ${MAP_H}" width="${MAP_W}" height="${MAP_H}">
            <rect width="${MAP_W}" height="${MAP_H}" fill="#D6E6F2" />
            <g stroke="#B8CDE0" stroke-width="0.6" stroke-dasharray="2,2">
              ${graticules}
            </g>
            <g fill="#EBE3CF" stroke="#78716C" stroke-width="0.6">
              ${countryPaths}
            </g>
            ${pinsSvg}
          </svg>
        </div>
        <div class="stat-strip">
          <div class="stat-box" style="border-color:#1D4ED8;">
            <div class="stat-k">MARKETS & TECH</div>
            <div class="stat-v">Nvidia +~$1T; ASX rallies</div>
          </div>
          <div class="stat-box" style="border-color:#6D28D9;">
            <div class="stat-k">SECURITY & WAR</div>
            <div class="stat-v">Space-nuke alert; Libya hit</div>
          </div>
          <div class="stat-box" style="border-color:#B45309;">
            <div class="stat-k">CLIMATE & AID</div>
            <div class="stat-v">COP31 stalls; India $1.6B</div>
          </div>
          <div class="stat-box" style="border-color:#3730A3;">
            <div class="stat-k">SCIENCE & SPORT</div>
            <div class="stat-v">Moon potatoes; 2031 WWC</div>
          </div>
        </div>
      </div>

      <div class="side-col">
        ${renderSideCard(stories[2])}
        ${renderSideCard(stories[3])}
      </div>
    </section>

    <section class="bottom-grid">
      ${stories.slice(4).map(renderBottomCard).join('\n')}
    </section>

    <footer class="footer">
      <span>TUESDAY 24 NOVEMBER 2026 · FIRST UTC EDITION</span>
      <span>SOURCES: BBC · AL JAZEERA · NYT · FRANCE24 · CNA · SMH · RNZ · SPACE.COM</span>
    </footer>
  </div>
</body>
</html>`;

writeFileSync(new URL('../broadsheet.html', import.meta.url), html, 'utf8');
console.log('Wrote broadsheet.html successfully');
