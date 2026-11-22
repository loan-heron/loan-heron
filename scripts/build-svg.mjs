// Génère tous les visuels animés du profil (dossier assets/).
// Usage : node scripts/build-svg.mjs
// DA « HERON·OS » (Heron = nom de famille) : terminal ambre phosphore sur graphite, serveur du homelab tracé au trait.

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'assets');

// ---------------------------------------------------------------- palette
const C = {
  bg: '#0B0D10',
  panel: '#11151B',
  line: '#232A34',
  dim: '#6B7685',
  soft: '#AEB6C2',
  text: '#E6EAF0',
  amber: '#FFB000',
  cyan: '#5EEAD4',
  green: '#3DDC84',
  red: '#FF5F57',
};
const FONT = `'JetBrains Mono','Fira Code','SF Mono','SFMono-Regular',Consolas,'Liberation Mono',Menlo,monospace`;

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const delay = (s) => ` style="animation-delay:${s.toFixed(2)}s"`;

function write(name, svg) {
  const p = join(OUT, name);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, svg.trim() + '\n', 'utf8');
  console.log('✓', name);
}

// ---------------------------------------------------------------- briques communes
const css = (extra = '') => `
<style>
  text{font-family:${FONT};white-space:pre}
  .in{animation:in .55s ease both}
  @keyframes in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
  .fade{animation:fade .8s ease both}
  @keyframes fade{from{opacity:0}to{opacity:1}}
  .cur{animation:cur 1.05s steps(1) infinite}
  @keyframes cur{50%{fill-opacity:0}}
  .led{animation:led 2.4s ease-in-out infinite}
  @keyframes led{0%,100%{opacity:1}50%{opacity:.25}}
  .draw{stroke-dasharray:1;animation:draw 1.1s cubic-bezier(.6,0,.2,1) both}
  @keyframes draw{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}
  .type{transform-box:fill-box;transform-origin:0 0;animation:type 1s steps(12,end) both}
  @keyframes type{from{transform:scaleX(0)}to{transform:scaleX(1)}}
  .ripple{transform-box:fill-box;transform-origin:center;animation:ripple 3.6s ease-out infinite}
  @keyframes ripple{0%{transform:scale(.3);opacity:.9}100%{transform:scale(2.8);opacity:0}}
  .sweep{animation:sweep 8s linear infinite}
  @keyframes sweep{from{transform:translateY(-140px)}to{transform:translateY(560px)}}
  .spin{transform-box:fill-box;transform-origin:center;animation:spin 60s linear infinite}
  @keyframes spin{to{transform:rotate(360deg)}}
  .breath{animation:breath 6s ease-in-out infinite}
  @keyframes breath{0%,100%{opacity:.13}50%{opacity:.22}}
  .bar{transform-box:fill-box;transform-origin:50% 100%;animation:bar 1.1s ease-in-out infinite alternate}
  @keyframes bar{from{transform:scaleY(.2)}to{transform:scaleY(1)}}
  ${extra}
  @media (prefers-reduced-motion:reduce){*{animation:none!important}}
</style>`;

const defs = (w, h, r = 16, inset = 0) => `
<defs>
  <pattern id="scan" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="1.4" fill="#fff" opacity=".028"/></pattern>
  <linearGradient id="sweepG" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${C.amber}" stop-opacity="0"/>
    <stop offset=".5" stop-color="${C.amber}" stop-opacity=".055"/>
    <stop offset="1" stop-color="${C.amber}" stop-opacity="0"/>
  </linearGradient>
  <radialGradient id="moon" cx=".5" cy=".5" r=".5">
    <stop offset="0" stop-color="${C.amber}" stop-opacity="1"/>
    <stop offset=".7" stop-color="${C.amber}" stop-opacity=".55"/>
    <stop offset="1" stop-color="${C.amber}" stop-opacity="0"/>
  </radialGradient>
  <filter id="glow" x="-20%" y="-60%" width="140%" height="220%"><feGaussianBlur stdDeviation="8"/></filter>
  <clipPath id="frame"><rect x="${1 + inset}" y="${1 + inset}" width="${w - 2 - 2 * inset}" height="${h - 2 - 2 * inset}" rx="${r}"/></clipPath>
</defs>`;

const frame = (w, h, title) => `
<rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="16" fill="${C.bg}" stroke="${C.line}" stroke-width="2"/>
<circle cx="26" cy="21" r="6" fill="${C.red}"/>
<circle cx="46" cy="21" r="6" fill="${C.amber}"/>
<circle cx="66" cy="21" r="6" fill="${C.green}"/>
<text x="${w / 2}" y="26" text-anchor="middle" font-size="13" fill="${C.dim}">${esc(title)}</text>
<line x1="2" y1="42" x2="${w - 2}" y2="42" stroke="${C.line}" stroke-width="1.5"/>`;

const overlay = (w, h) => `
<g clip-path="url(#frame)" pointer-events="none">
  <rect width="${w}" height="${h}" fill="url(#scan)"/>
  <rect class="sweep" x="0" y="0" width="${w}" height="140" fill="url(#sweepG)"/>
</g>`;

const svg = (w, h, label, body, extraCss = '', r = 16, inset = 0) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(label)}">
<title>${esc(label)}</title>
${css(extraCss)}
${defs(w, h, r, inset)}
${body}
</svg>`;

// Serveur du homelab au trait (baie de 4 unités), dans une boîte de 130 x 140.
// Tracé animé si draw = true, voyants qui clignotent.
function rack({ draw = true, start = 0, color = C.amber } = {}) {
  const d = (i) => (draw ? ` class="draw"${delay(start + i * 0.18)}` : '');
  const stroke = `fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" pathLength="1"`;
  const units = [0, 1, 2, 3]
    .map((i) => {
      const y = 14 + i * 27;
      const led1 = i === 2 ? C.amber : C.green;
      return `<rect x="34" y="${y}" width="62" height="21" rx="3" ${stroke}${d(i + 1)}/>
  <line x1="60" y1="${y + 7.5}" x2="88" y2="${y + 7.5}" stroke="${C.dim}" stroke-width="2" stroke-linecap="round" pathLength="1"${d(i + 2)}/>
  <line x1="60" y1="${y + 13.5}" x2="80" y2="${y + 13.5}" stroke="${C.dim}" stroke-width="2" stroke-linecap="round" pathLength="1"${d(i + 2)}/>
  <circle class="led"${delay(start + 1.2 + i * 0.35)} cx="42" cy="${y + 10.5}" r="2.8" fill="${led1}"/>
  <circle class="led"${delay(start + 1.5 + i * 0.5)} cx="50" cy="${y + 10.5}" r="2.8" fill="${C.cyan}"/>`;
    })
    .join('\n  ');
  return `
  <line x1="16" y1="130" x2="132" y2="130" stroke="${C.line}" stroke-width="1.5"/>
  <rect x="27" y="6" width="76" height="118" rx="6" ${stroke}${d(0)}/>
  <line x1="37" y1="124" x2="37" y2="130" stroke="${color}" stroke-width="3" stroke-linecap="round"/>
  <line x1="93" y1="124" x2="93" y2="130" stroke="${color}" stroke-width="3" stroke-linecap="round"/>
  ${units}`;
}

const prompt = (cmd, cursor = true) =>
  `<tspan fill="${C.cyan}">heron@homelab</tspan><tspan fill="${C.dim}">:~$ </tspan><tspan fill="${C.text}">${esc(cmd)}</tspan>${cursor ? `<tspan class="cur" fill="${C.amber}">█</tspan>` : ''}`;

// ---------------------------------------------------------------- 1. écran de démarrage
function boot() {
  const w = 900, h = 380;
  const log = [
    'Démarrage de heron-os · édition 2026',
    'Montage de /srv/projets · 10 dépôts publics',
    'Connexion au homelab Proxmox',
    'Chargement de la direction artistique',
  ];
  const lines = log
    .map((t, i) => `<text class="in"${delay(0.2 + i * 0.35)} x="36" y="${80 + i * 24}" font-size="13"><tspan fill="${C.dim}">[</tspan><tspan fill="${C.green}">  OK  </tspan><tspan fill="${C.dim}">]  </tspan><tspan fill="${C.soft}">${esc(t)}</tspan></text>`)
    .join('\n');

  const body = `
${frame(w, h, 'heron@homelab — ~/profil')}
<text class="fade"${delay(0.4)} x="${w - 36}" y="70" text-anchor="end" font-size="11" fill="${C.dim}" letter-spacing="1">48.44°N · 1.49°E</text>

<!-- halo + serveur du homelab -->
<circle class="breath" cx="766" cy="176" r="118" fill="url(#moon)"/>
<circle class="spin" cx="766" cy="176" r="140" fill="none" stroke="${C.line}" stroke-width="1.5" stroke-dasharray="2 9"/>
<g transform="translate(672 74) scale(1.45)">${rack({ start: 0.6 })}
</g>

${lines}

<clipPath id="tclip"><rect class="type"${delay(1.8)} x="28" y="168" width="520" height="84"/></clipPath>
<g clip-path="url(#tclip)">
  <text x="34" y="232" font-size="64" font-weight="800" letter-spacing="4" fill="${C.amber}" filter="url(#glow)" opacity=".55">LOAN HERON</text>
  <text x="34" y="232" font-size="64" font-weight="800" letter-spacing="4" fill="${C.amber}">LOAN HERON</text>
</g>

<text class="in"${delay(2.8)} x="36" y="270" font-size="16" fill="${C.text}">Développeur web full-stack · admin de mon propre homelab</text>
<text class="in"${delay(3.1)} x="36" y="296" font-size="13" fill="${C.dim}">Chartres · La Manu · Elvo Studio</text>
<text class="in"${delay(3.5)} x="36" y="340" font-size="15">${prompt('cat README.md')}</text>
<text class="fade"${delay(3.9)} x="${w - 36}" y="356" text-anchor="end" font-size="12" font-style="italic" fill="${C.dim}">du front au serveur · tout fait maison</text>
${overlay(w, h)}`;
  write('boot.svg', svg(w, h, 'Loan Heron — développeur web full-stack et admin de son homelab', body));
}

// ---------------------------------------------------------------- 2. fiche « neofetch »
function about() {
  const w = 900, h = 360;
  const rows = [
    ['Rôle', 'Développeur web full-stack, en formation'],
    ['École', 'La Manu · campus de Chartres'],
    ['Studio', 'Elvo Studio · site, admin & dashboard'],
    ['Homelab', 'Proxmox · conteneurs LXC · HTTPS public'],
    ['Auto-héb.', 'Supabase · drive perso · reverse proxy'],
    ['Langages', 'JavaScript · TypeScript · Python'],
    ['GitHub', 'depuis 2022 · 10 dépôts publics'],
    ['En ce moment', 'React, TypeScript & déploiement'],
  ];
  const list = rows
    .map(([k, v], i) => `<text class="in"${delay(0.5 + i * 0.12)} x="260" y="${136 + i * 23}" font-size="14"><tspan fill="${C.amber}">${esc(k.padEnd(13))}</tspan><tspan fill="${C.text}">${esc(v)}</tspan></text>`)
    .join('\n');
  const swatches = [C.bg, C.panel, C.line, C.dim, C.soft, C.text, C.amber, C.cyan, C.green, C.red]
    .map((c, i) => `<rect class="fade"${delay(1.6 + i * 0.06)} x="${260 + i * 34}" y="${h - 46}" width="28" height="16" rx="3" fill="${c}" stroke="${C.line}"/>`)
    .join('\n');

  const body = `
${frame(w, h, 'neofetch — loan@heron')}
<circle class="breath" cx="118" cy="178" r="92" fill="url(#moon)"/>
<g transform="translate(36 92) scale(1.25)">${rack({ start: 0.2 })}
</g>
<text class="fade"${delay(1.8)} x="122" y="${h - 34}" text-anchor="middle" font-size="13" font-weight="700" letter-spacing="4" fill="${C.amber}">HERON·OS</text>

<text class="in"${delay(0.2)} x="260" y="84" font-size="18" font-weight="700"><tspan fill="${C.amber}">loan</tspan><tspan fill="${C.dim}">@</tspan><tspan fill="${C.amber}">heron</tspan></text>
<line class="fade"${delay(0.35)} x1="260" y1="100" x2="420" y2="100" stroke="${C.line}" stroke-width="2"/>
${list}
${swatches}
${overlay(w, h)}`;
  write('about.svg', svg(w, h, 'Fiche : développeur web full-stack en formation à La Manu, Elvo Studio, homelab Proxmox', body));
}

// ---------------------------------------------------------------- 3. stack « systemctl »
function stack() {
  const w = 900, h = 360;
  const units = [
    ['front.service', 'HTML · CSS · JavaScript · TypeScript · React · Vite · GSAP'],
    ['back.service', 'Node.js · Express · Zod · JWT · bcrypt · Nodemailer'],
    ['data.service', 'MySQL · PostgreSQL · Supabase'],
    ['infra.service', 'Proxmox · LXC · Nginx Proxy Manager · Linux · Vercel'],
    ['ia.service', 'SDK Claude · prototypage assisté par IA'],
    ['outils.service', 'Git · GitHub · npm · Postman'],
  ];
  const rows = units
    .map(([u, m], i) => {
      const y = 128 + i * 34;
      return `<g class="in"${delay(0.3 + i * 0.15)}>
  <circle class="led"${delay(i * 0.4)} cx="40" cy="${y - 5}" r="4.5" fill="${C.green}"/>
  <text x="56" y="${y}" font-size="14" fill="${C.amber}">${esc(u)}</text>
  <text x="232" y="${y}" font-size="14" fill="${C.green}">actif</text>
  <text x="310" y="${y}" font-size="13.5" fill="${C.text}">${esc(m)}</text>
</g>`;
    })
    .join('\n');

  const body = `
${frame(w, h, 'heron@homelab — systemctl list-units --type=competence')}
<text x="56" y="76" font-size="11" letter-spacing="2" fill="${C.dim}">UNITÉ</text>
<text x="232" y="76" font-size="11" letter-spacing="2" fill="${C.dim}">ÉTAT</text>
<text x="310" y="76" font-size="11" letter-spacing="2" fill="${C.dim}">MODULES</text>
<line x1="36" y1="90" x2="${w - 36}" y2="90" stroke="${C.line}" stroke-width="1.5"/>
${rows}
<line x1="36" y1="${h - 52}" x2="${w - 36}" y2="${h - 52}" stroke="${C.line}" stroke-width="1.5"/>
<text class="fade"${delay(1.4)} x="36" y="${h - 26}" font-size="12" fill="${C.dim}">6 unités chargées · <tspan fill="${C.green}">0 en échec</tspan> · toujours en apprentissage</text>
${overlay(w, h)}`;
  write('stack.svg', svg(w, h, 'Stack : front, back, données, infra, IA et outils', body));
}

// ---------------------------------------------------------------- 4. cartes projets (unités de baie)
function wrap(text, max) {
  const out = [''];
  for (const word of text.split(' ')) {
    const cur = out[out.length - 1];
    if ((cur + ' ' + word).trim().length > max) out.push(word);
    else out[out.length - 1] = (cur + ' ' + word).trim();
  }
  return out;
}

const STATUS = {
  PUBLIC: C.green,
  PRIVÉ: C.amber,
  ÉCOLE: C.cyan,
};

function card(p, i) {
  const w = 452, h = 210;
  const color = STATUS[p.status];
  const lines = wrap(p.desc, 46);
  if (lines.length > 2) throw new Error(`Description trop longue : ${p.slug}`);
  let x = 24;
  const chips = p.stack
    .map((s) => {
      const cw = Math.round(s.length * 7 + 20);
      const g = `<rect x="${x}" y="160" width="${cw}" height="24" rx="12" fill="${C.bg}" stroke="${C.line}" stroke-width="1.5"/><text x="${x + cw / 2}" y="176.5" text-anchor="middle" font-size="11" fill="${C.soft}">${esc(s)}</text>`;
      x += cw + 6;
      return g;
    })
    .join('\n');
  if (x > 384) throw new Error(`Trop de technos : ${p.slug}`);
  const tag = `● ${p.status}`;
  const tw = Math.round(tag.length * 7.2 + 18);
  const bars = [0, 1, 2, 3, 4]
    .map((k) => `<rect class="bar" style="animation-delay:${(k * 0.17 + i * 0.11).toFixed(2)}s;animation-duration:${(0.8 + ((k * 7 + i * 3) % 5) * 0.15).toFixed(2)}s" x="${392 + k * 8}" y="166" width="4" height="18" rx="1" fill="${C.cyan}" opacity=".75"/>`)
    .join('\n');
  const n = String(i + 1).padStart(2, '0');

  const body = `
<rect x="6" y="6" width="${w - 12}" height="${h - 12}" rx="12" fill="${C.panel}" stroke="${C.line}" stroke-width="2"/>
${[[18, 18], [w - 18, 18], [18, h - 18], [w - 18, h - 18]].map(([cx, cy]) => `<circle cx="${cx}" cy="${cy}" r="2.5" fill="${C.line}"/>`).join('')}
<circle class="led"${delay(i * 0.3)} cx="34" cy="36" r="9" fill="${color}" opacity=".22"/>
<circle class="led"${delay(i * 0.3)} cx="34" cy="36" r="4.5" fill="${color}"/>
<text x="50" y="40" font-size="12" fill="${C.dim}">U${n} · /srv/projets/${esc(p.slug)}</text>
<rect x="${w - 22 - tw}" y="24" width="${tw}" height="22" rx="11" fill="none" stroke="${color}" stroke-opacity=".5" stroke-width="1.5"/>
<text x="${w - 22 - tw / 2}" y="39" text-anchor="middle" font-size="11" letter-spacing="1" fill="${color}">${esc(tag)}</text>
<line x1="20" y1="56" x2="${w - 20}" y2="56" stroke="${C.line}" stroke-width="1.5" stroke-dasharray="3 5"/>
<text x="24" y="92" font-size="24" font-weight="700"><tspan fill="${C.amber}">› </tspan><tspan fill="${C.text}">${esc(p.title)}</tspan></text>
${lines.map((l, k) => `<text x="24" y="${120 + k * 20}" font-size="13" fill="${C.soft}">${esc(l)}</text>`).join('\n')}
${chips}
${bars}
${overlay(w, h)}`;
  write(`projects/${p.slug}.svg`, svg(w, h, `${p.title} — ${p.desc}`, body, '', 12, 5));
}

export const PROJECTS = [
  { slug: 'elvo-studio', title: 'Elvo Studio', status: 'PRIVÉ', desc: "Site vitrine, espace admin et dashboard interne d'une agence web.", stack: ['React', 'Vite', 'Express', 'Zod', 'SDK Claude'] },
  { slug: 'le-napoleon', title: 'Le Napoléon', status: 'PUBLIC', desc: 'Site de restaurant : menu interactif, réservation et commande. API des menus.', stack: ['HTML', 'CSS', 'JS', 'Express', 'PostgreSQL'] },
  { slug: 'budjet-api', title: 'Budjet · API REST', status: 'PUBLIC', desc: 'Authentification, produits et commandes. Mots de passe bcrypt, sessions JWT.', stack: ['Node.js', 'Express 5', 'MySQL', 'JWT'] },
  { slug: 'watchlist', title: 'WatchList', status: 'PUBLIC', desc: 'Liste de films : filtres, recherche et tri. API Express branchée sur Supabase.', stack: ['JavaScript', 'Express', 'Supabase'] },
  { slug: 'frigoflash', title: 'FrigoFlash', status: 'PUBLIC', desc: "Prends ton frigo en photo, reçois 3 recettes anti-gaspi. Conçue avec l'IA.", stack: ['HTML', 'CSS', 'JavaScript', 'IA'] },
  { slug: 'arena-zero', title: 'Arena Zéro', status: 'PUBLIC', desc: "Connexion / inscription d'une communauté e-sport fictive. API Node + MySQL.", stack: ['JavaScript', 'Express', 'MySQL', 'JWT'] },
  { slug: 'donjon-gobelins', title: 'Le Donjon des Gobelins', status: 'ÉCOLE', desc: 'RPG textuel en console : 3 salles, 3 monstres, potions et XP. En équipe.', stack: ['Python'] },
  { slug: 'memory', title: 'Memory', status: 'PUBLIC', desc: 'Le jeu de paires classique, en HTML, CSS et JavaScript pur.', stack: ['HTML', 'CSS', 'JavaScript'] },
];

// ---------------------------------------------------------------- 5. titres de section
function section(n, title, total = 5) {
  const w = 900, h = 60;
  const titleEnd = 112 + title.length * (16 * 0.62 + 3);
  const x1 = Math.round(titleEnd + 24), x2 = w - 96;
  const dist = x2 - x1;
  const extra = `.dot{animation:travel 4.5s cubic-bezier(.5,0,.5,1) infinite}
  @keyframes travel{0%{transform:translateX(0);opacity:0}10%{opacity:1}90%{opacity:1}100%{transform:translateX(${dist}px);opacity:0}}`;
  const body = `
<rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="12" fill="${C.bg}" stroke="${C.line}" stroke-width="2"/>
<rect x="18" y="17" width="78" height="26" rx="13" fill="none" stroke="${C.amber}" stroke-opacity=".55" stroke-width="1.5"/>
<text x="57" y="34.5" text-anchor="middle" font-size="12" letter-spacing="2" fill="${C.amber}">LOG ${String(n).padStart(2, '0')}</text>
<text x="112" y="36" font-size="16" font-weight="700" letter-spacing="3" fill="${C.text}">${esc(title)}</text>
<line x1="${x1}" y1="30" x2="${x2}" y2="30" stroke="${C.line}" stroke-width="1.5"/>
<circle class="dot" cx="${x1}" cy="30" r="3.5" fill="${C.amber}"/>
<text x="${w - 22}" y="35" text-anchor="end" font-size="12" fill="${C.dim}">${String(n).padStart(2, '0')} / ${String(total).padStart(2, '0')}</text>`;
  write(`sections/${String(n).padStart(2, '0')}.svg`, svg(w, h, `${n}. ${title}`, body, extra, 12));
}

// ---------------------------------------------------------------- 6. pied de page
function footer() {
  const w = 900, h = 210;
  const body = `
${frame(w, h, 'heron@homelab — fin de session')}
<text class="in"${delay(0.2)} x="36" y="82" font-size="15">${prompt('exit', false)}</text>
<text class="in"${delay(0.7)} x="36" y="108" font-size="13" fill="${C.dim}">déconnexion de github.com/loan-heron…</text>
<text class="in"${delay(1.2)} x="36" y="150" font-size="24" font-weight="700" fill="${C.amber}">Merci d'être passé. À bientôt.<tspan class="cur" fill="${C.amber}"> █</tspan></text>
<text class="fade"${delay(1.6)} x="36" y="182" font-size="12" fill="${C.dim}">© 2026 Loan Heron · README fait main, 100 % SVG animé</text>
<circle class="breath" cx="788" cy="118" r="62" fill="url(#moon)"/>
<g transform="translate(726 54) scale(.95)">${rack({ draw: false })}
</g>
${overlay(w, h)}`;
  write('footer.svg', svg(w, h, "Fin de session — merci d'être passé", body));
}

// ---------------------------------------------------------------- build
boot();
about();
stack();
PROJECTS.forEach(card);
['QUI SUIS-JE', 'STACK', 'PROJETS', 'STATISTIQUES', 'CONTACT'].forEach((t, i) => section(i + 1, t));
footer();
