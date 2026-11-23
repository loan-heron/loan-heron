// Génère les visuels du profil GitHub (dossier assets/), dans le style du portfolio loan-heron.fr :
// bleu nuit / papier, accent « signal », Hanken Grotesk fine, libellés en capitales, illustrations au trait.
// Chaque visuel existe en version sombre et claire (GitHub choisit selon le thème du visiteur).
// Usage : node scripts/build-svg.mjs

import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'assets');
const W = 900;

// ---------------------------------------------------------------- thèmes (repris de css/style.css du portfolio)
const THEMES = {
  dark: {
    card: '#070B14',
    cardLine: 'rgba(243,241,236,.10)',
    ink: '#F3F1EC',
    text: 'rgba(243,241,236,.72)',
    soft: 'rgba(243,241,236,.5)',
    line: 'rgba(243,241,236,.14)',
    accent: '#FF5B3A',
  },
  light: {
    card: '#F3F1EC',
    cardLine: 'rgba(14,22,38,.10)',
    ink: '#0E1626',
    text: 'rgba(14,22,38,.78)',
    soft: 'rgba(14,22,38,.55)',
    line: 'rgba(14,22,38,.16)',
    accent: '#E0472A',
  },
};

const FONT_B64 = readFileSync(join(ROOT, 'scripts/fonts/hanken-grotesk-latin.woff2')).toString('base64');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const at = (s) => ` style="animation-delay:${s.toFixed(2)}s"`;

function css(t) {
  return `<style>
  @font-face{font-family:'HG';font-weight:100 900;src:url(data:font/woff2;base64,${FONT_B64}) format('woff2')}
  text{font-family:'HG','Hanken Grotesk','Helvetica Neue',Helvetica,Arial,sans-serif;white-space:pre}
  .up{animation:up 1.1s cubic-bezier(.22,1,.36,1) both}
  @keyframes up{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
  .grow{transform-box:fill-box;transform-origin:0 50%;animation:grow 1s cubic-bezier(.22,1,.36,1) both}
  @keyframes grow{from{transform:scaleX(0)}to{transform:scaleX(1)}}
  .rise{transform-box:fill-box;transform-origin:50% 100%;animation:rise .9s cubic-bezier(.22,1,.36,1) both}
  @keyframes rise{from{transform:scaleY(0)}to{transform:scaleY(1)}}
  .draw{stroke-dasharray:1;animation:draw 1.6s cubic-bezier(.22,1,.36,1) both}
  @keyframes draw{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}
  .ill polygon,.ill line,.ill circle{fill:none;stroke:${t.ink};stroke-width:2;stroke-linejoin:round;stroke-linecap:round}
  .ill .face{stroke-opacity:.9}
  .ill .soft{stroke:${t.soft}}
  .ill .accent{stroke:${t.accent}}
  .ill text{fill:${t.soft};font-size:20px;font-weight:500;letter-spacing:.18em;text-transform:uppercase}
  @media (prefers-reduced-motion:reduce){*{animation:none!important}}
</style>`;
}

function write(name, label, h, body) {
  for (const [mode, t] of Object.entries(THEMES)) {
    const p = join(OUT, `${name}-${mode}.svg`);
    mkdirSync(dirname(p), { recursive: true });
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${h}" viewBox="0 0 ${W} ${h}" role="img" aria-label="${esc(label)}">
<title>${esc(label)}</title>
${css(t)}
${body(t).trim()}
</svg>
`;
    writeFileSync(p, svg, 'utf8');
  }
  console.log('✓', name);
}

// Libellé façon portfolio : petit trait accent + capitales espacées.
const label = (t, x, y, txt, d = 0) => `
<line class="grow"${at(d)} x1="${x}" y1="${y - 4}" x2="${x + 26}" y2="${y - 4}" stroke="${t.accent}" stroke-width="1.5"/>
<text class="up"${at(d + 0.1)} x="${x + 40}" y="${y}" font-size="11" font-weight="500" letter-spacing="2.2" fill="${t.soft}">${esc(txt)}</text>`;

// Logo « L » du portfolio (viewBox 0 0 246 303).
const logo = (t) => `<g fill="${t.ink}"><polygon points="0,67 35,35.3 35,253.3 0,285"/><polygon points="37,33.5 74,0 74,218 37,251.5" opacity=".8"/><polygon points="89,220 245,220 199,264 43,264" opacity=".8"/><polygon points="41,266 197,266 159,302 3,302"/></g>`;

// Illustration « ordinateur + carnet » du portfolio (viewBox 0 70 640 400), tracée au chargement.
const DESK = `<polygon class="face" points="106.9,269.8 356.9,269.8 356.9,89.8 106.9,89.8"/><polygon class="soft" points="118.9,257.8 344.9,257.8 344.9,101.8 118.9,101.8"/><line class="soft" x1="134.9" y1="123.8" x2="230.9" y2="123.8"/><line class="soft" x1="150.9" y1="138.8" x2="222.9" y2="138.8"/><line class="soft" x1="166.9" y1="153.8" x2="270.9" y2="153.8"/><line class="accent" x1="166.9" y1="168.8" x2="222.9" y2="168.8"/><line class="soft" x1="150.9" y1="183.8" x2="182.9" y2="183.8"/><line class="soft" x1="134.9" y1="198.8" x2="158.9" y2="198.8"/><line class="soft" x1="134.9" y1="213.8" x2="222.9" y2="213.8"/><line class="soft" x1="150.9" y1="228.8" x2="270.9" y2="228.8"/><line class="soft" x1="134.9" y1="243.8" x2="150.9" y2="243.8"/><polygon class="face" points="40,330 290,330 356.9,269.8 106.9,269.8"/><polygon class="face" points="40,330 290,330 290,337 40,337"/><polygon class="face" points="290,330 356.9,269.8 356.9,276.8 290,337"/><polygon class="soft" points="85.6,305.1 299.6,305.1 331.7,276.2 117.7,276.2"/><line class="soft" x1="93.7" y1="297.9" x2="307.7" y2="297.9"/><line class="soft" x1="101.7" y1="290.7" x2="315.7" y2="290.7"/><line class="soft" x1="109.7" y1="283.4" x2="323.7" y2="283.4"/><polygon class="soft" points="138.2,324.4 204.2,324.4 218.5,311.5 152.5,311.5"/><polygon class="face" points="236,452 446,452 517.3,387.8 307.3,387.8"/><polygon class="face" points="236,452 446,452 446,456 236,456"/><polygon class="face" points="446,452 517.3,387.8 517.3,391.8 446,456"/><line class="soft" x1="341" y1="452" x2="412.3" y2="387.8"/><polygon points="289.5,418.3 363.5,418.3 388.4,395.8 314.4,395.8"/><line class="soft" x1="289.5" y1="418.3" x2="388.4" y2="395.8"/><line class="soft" x1="314.4" y1="395.8" x2="363.5" y2="418.3"/><line class="soft" x1="280.5" y1="426.3" x2="344.5" y2="426.3"/><line class="soft" x1="273.4" y1="432.7" x2="319.4" y2="432.7"/><polygon class="soft" points="259.1,445.6 295.1,445.6 300.5,440.8 264.5,440.8"/><circle class="soft" cx="429.7" cy="412.7" r="15"/><line class="soft" x1="391.2" y1="423.9" x2="453.2" y2="423.9"/><line class="soft" x1="385" y1="429.5" x2="431" y2="429.5"/><polygon class="face" points="364.4,445.1 455.8,433 455.4,435.6 364,447.7"/><polygon class="face" points="364.4,445.1 351.1,448.1 364,447.7"/><line class="soft" x1="364.9" y1="129.8" x2="400.9" y2="129.8"/><text x="410.9" y="135.8">Code</text><line class="soft" x1="491.7" y1="419.9" x2="521.7" y2="419.9"/><text x="531.7" y="425.9">Notes</text>`;

function desk(start) {
  let i = 0;
  return DESK.replace(/<(polygon|line|circle)([^>]*)\/>/g, (m, tag, attrs) => {
    const cls = attrs.match(/class="([^"]*)"/);
    const rest = attrs.replace(/\s*class="[^"]*"/, '');
    return `<${tag} class="draw${cls ? ' ' + cls[1] : ''}" pathLength="1"${at(start + i++ * 0.035)}${rest}/>`;
  }).replace(/<text /g, `<text class="up"${at(start + 1.4)} `);
}

// ---------------------------------------------------------------- 1. en-tête
function hero() {
  const h = 470;
  write('hero', "Loan Heron — développeur full-stack, cyber et IA. Je développe des sites et des applications web, avec la sécurité et l'IA au cœur du code.", h, (t) => `
<rect x="1" y="1" width="${W - 2}" height="${h - 2}" rx="14" fill="${t.card}" stroke="${t.cardLine}" stroke-width="2"/>
<g class="up"${at(0)}><g transform="translate(40 34) scale(.083)">${logo(t)}</g></g>
<text class="up"${at(0)} x="72" y="54" font-size="15" font-weight="500" fill="${t.ink}">Loan Heron</text>
<text class="up"${at(0.1)} x="${W - 40}" y="54" text-anchor="end" font-size="13" font-weight="400" fill="${t.soft}">loan-heron.fr  <tspan fill="${t.accent}">↗</tspan></text>

<text class="up"${at(0.25)} x="40" y="124" font-size="11" font-weight="500" letter-spacing="2.2" fill="${t.soft}">DÉVELOPPEUR FULL-STACK · CYBER &amp; IA</text>
<text class="up"${at(0.4)} x="34" y="222" font-size="112" font-weight="300" letter-spacing="-2" fill="${t.ink}">Loan</text>
<text class="up"${at(0.55)} x="34" y="328" font-size="112" font-weight="300" letter-spacing="-2" fill="${t.ink}">Heron</text>

<g class="ill" transform="translate(508 84) scale(.56) translate(0 -70)">${desk(0.6)}</g>

<text class="up"${at(0.85)} x="40" y="374" font-size="18" font-weight="400" fill="${t.ink}">Je développe des sites et des applications web,</text>
<text class="up"${at(0.95)} x="40" y="400" font-size="18" font-weight="400" fill="${t.accent}">avec la sécurité et l'IA au cœur du code.</text>

<line x1="40" y1="424" x2="${W - 40}" y2="424" stroke="${t.line}" stroke-width="1"/>
<text class="up"${at(1.1)} x="40" y="446" font-size="10" font-weight="500" letter-spacing="2" fill="${t.soft}">STUDIO</text>
<text class="up"${at(1.15)} x="110" y="446" font-size="13.5" fill="${t.ink}">Fondateur d'Elvo Studio</text>
<text class="up"${at(1.2)} x="400" y="446" font-size="10" font-weight="500" letter-spacing="2" fill="${t.soft}">ÉTUDES</text>
<text class="up"${at(1.25)} x="466" y="446" font-size="13.5" fill="${t.ink}">Bachelor Développement &amp; Design, La Manu</text>`);
}

// ---------------------------------------------------------------- 2. à propos
function about() {
  const h = 300;
  write('about', "À propos — Je construis des sites et des applications de bout en bout, de la base de données au serveur. La sécurité n'est pas une couche ajoutée à la fin : elle guide le code dès le départ.", h, (t) => `
${label(t, 0, 30, 'À PROPOS')}
<text class="up"${at(0.15)} x="0" y="90" font-size="29" font-weight="300" fill="${t.ink}">Je construis des sites et des applications de bout en bout,</text>
<text class="up"${at(0.25)} x="0" y="128" font-size="29" font-weight="300" fill="${t.ink}">de la base de données au serveur. <tspan fill="${t.soft}">La sécurité n'est pas</tspan></text>
<text class="up"${at(0.35)} x="0" y="166" font-size="29" font-weight="300" fill="${t.soft}">une couche ajoutée à la fin : elle guide le code dès le départ.</text>
<text class="up"${at(0.5)} x="0" y="226" font-size="15.5" fill="${t.text}">Étudiant en Bachelor Développement &amp; Design à La Manu, j'ai fondé Elvo Studio pour créer</text>
<text class="up"${at(0.55)} x="0" y="251" font-size="15.5" fill="${t.text}">des sites sur mesure pour les commerces et les indépendants : développement, mise en ligne</text>
<text class="up"${at(0.6)} x="0" y="276" font-size="15.5" fill="${t.text}">et suivi. En parallèle : cybersécurité, IA et mon propre serveur.</text>`);
}

// ---------------------------------------------------------------- 3. titres de section
function heading(name, lbl, title) {
  const h = title ? 104 : 50;
  write(name, title ? `${lbl} — ${title}` : lbl, h, (t) => `
${label(t, 0, 30, lbl)}
${title ? `<text class="up"${at(0.15)} x="0" y="84" font-size="30" font-weight="300" fill="${t.ink}">${esc(title)}</text>` : ''}`);
}

// ---------------------------------------------------------------- 4. projets phares (sites en ligne)
function feature(p, n) {
  const h = 212;
  write(`projects/${p.slug}`, `${p.title} — ${p.desc}`, h, (t) => `
<line x1="0" y1="1" x2="${W}" y2="1" stroke="${t.line}" stroke-width="1"/>
<text class="up"${at(0)} x="0" y="44" font-size="11" font-weight="500" letter-spacing="2.2" fill="${t.soft}">${String(n).padStart(2, '0')}   ·   ${esc(p.kind)}</text>
${p.domain ? `<text class="up"${at(0)} x="${W}" y="44" text-anchor="end" font-size="13.5" fill="${t.soft}">${esc(p.domain)}  <tspan fill="${t.accent}">↗</tspan></text>` : ''}
<text class="up"${at(0.1)} x="-2" y="100" font-size="44" font-weight="300" letter-spacing="-.5" fill="${t.ink}">${esc(p.title)}</text>
${p.lines.map((l, i) => `<text class="up"${at(0.2 + i * 0.05)} x="0" y="${138 + i * 24}" font-size="15.5" fill="${t.text}">${esc(l)}</text>`).join('\n')}
<text class="up"${at(0.35)} x="0" y="196" font-size="13" fill="${t.soft}">${esc(p.tags.join('  ·  '))}</text>`);
}

const FEATURED = [
  {
    slug: 'breche', title: 'Brèche', kind: 'PLATEFORME · CYBERSÉCURITÉ', domain: 'breche.loan-heron.fr',
    desc: "Une école pratique de cybersécurité : 24 modules, du terminal à l'Active Directory, chaque leçon finit sur une vraie cible isolée à réparer.",
    lines: ["Une école pratique de cybersécurité que j'ai créée : 24 modules, du terminal à", "l'Active Directory. Chaque leçon finit sur une vraie cible isolée, puis on répare la faille."],
    tags: ['Labs isolés', 'Pare-feu', 'VPN', 'Docker'],
  },
  {
    slug: 'halteo', title: 'Halteo', kind: 'APPLICATION WEB · FULL-STACK', domain: 'halteo.loan-heron.fr',
    desc: "Application d'entraînement complète : exercices filtrables par muscle, comptes, programmes, records et coach IA.",
    lines: ["Application d'entraînement complète : bibliothèque d'exercices filtrable par muscle,", 'comptes utilisateurs, programmes, suivi des records et coach IA.'],
    tags: ['Comptes', 'Base de données', 'Coach IA', 'Application installable'],
  },
  {
    slug: 'homelab', title: 'Homelab & Ulysse', kind: 'INFRASTRUCTURE · IA', domain: '',
    desc: "Mon serveur personnel (virtualisation, HTTPS, bases de données, sauvegardes), administré avec Ulysse, un assistant IA.",
    lines: ['Mon serveur personnel, qui héberge mes sites et mes projets : virtualisation, HTTPS,', "bases de données et sauvegardes automatiques. Ulysse, un assistant IA, m'aide à l'administrer."],
    tags: ['Proxmox', 'Linux', 'Reverse proxy', 'Agent IA'],
  },
  {
    slug: 'elvo-studio', title: 'Elvo Studio', kind: 'SITE VITRINE · STUDIO', domain: 'elvo-studio.fr',
    desc: "Le site d'Elvo Studio : offres et tarifs, réalisations, méthode de travail et demande de devis.",
    lines: ["Le site d'Elvo Studio, mon studio de création de sites web : offres et tarifs,", 'réalisations, méthode de travail et demande de devis.'],
    tags: ['Site vitrine', 'Administration', 'Formulaires', 'Hébergement'],
  },
];

// ---------------------------------------------------------------- 5. projets d'école (lignes compactes)
function row(p, n) {
  const h = 64;
  write(`projects/${p.slug}`, `${p.title} — ${p.desc} (${p.tags.join(', ')})`, h, (t) => `
<line x1="0" y1="1" x2="${W}" y2="1" stroke="${t.line}" stroke-width="1"/>
<text class="up"${at(0)} x="0" y="39" font-size="12" font-weight="500" letter-spacing="1.5" fill="${t.soft}">${String(n).padStart(2, '0')}</text>
<text class="up"${at(0.05)} x="52" y="40" font-size="21" font-weight="400" fill="${t.ink}">${esc(p.title)}</text>
<text class="up"${at(0.1)} x="318" y="39" font-size="14.5" fill="${t.text}">${esc(p.desc)}</text>
<text class="up"${at(0.15)} x="${p.link ? W - 30 : W}" y="39" text-anchor="end" font-size="12.5" fill="${t.soft}">${esc(p.tags.join(' · '))}</text>
${p.link ? `<text class="up"${at(0.2)} x="${W}" y="40" text-anchor="end" font-size="15" fill="${t.accent}">↗</text>` : ''}`);
}

export const SCHOOL = [
  { slug: 'le-napoleon', title: 'Le Napoléon', desc: "Site et API d'un restaurant", tags: ['HTML', 'Express', 'PostgreSQL'], link: true },
  { slug: 'budjet-api', title: 'Budjet', desc: 'API REST : auth JWT, produits, commandes', tags: ['Node', 'Express', 'MySQL'], link: true },
  { slug: 'watchlist', title: 'WatchList', desc: 'Liste de films, API branchée sur Supabase', tags: ['JS', 'Express', 'Supabase'], link: true },
  { slug: 'frigoflash', title: 'FrigoFlash', desc: 'Trois recettes anti-gaspi depuis une photo', tags: ['HTML', 'CSS', 'JS'], link: true },
  { slug: 'arena-zero', title: 'Arena Zéro', desc: "Accès d'une communauté e-sport fictive", tags: ['JS', 'Node', 'MySQL'], link: true },
  { slug: 'donjon-gobelins', title: 'Donjon des Gobelins', desc: 'RPG textuel en console, en équipe', tags: ['Python'], link: false },
];

// ---------------------------------------------------------------- 6. savoir-faire (niveaux repris du portfolio)
const SKILLS = [
  ['Développement', [['HTML / CSS', 4], ['JavaScript', 3], ['React', 2], ['Python', 2], ['Back-end et API', 3], ['Bases de données', 3]]],
  ['IA', [['API de modèles (LLM)', 3], ['Agents et automatisation', 3], ['Prompt engineering', 3], ['RAG et données', 2]]],
  ['Mise en ligne', [['Hébergement et domaines', 3], ['Performance', 3], ['Référencement local', 2], ['Maintenance', 3]]],
  ['Cyber', [['Linux et serveurs', 3], ['Réseaux et VPN', 3], ['Sécurité web', 2], ["CTF et tests d'intrusion", 2]]],
];

function skills() {
  const rowH = 32;
  const topRows = Math.max(SKILLS[0][1].length, SKILLS[1][1].length);
  const bottomRows = Math.max(SKILLS[2][1].length, SKILLS[3][1].length);
  const blockTop = (g) => (g < 2 ? 86 : 86 + 64 + topRows * rowH);
  const h = blockTop(2) + 64 + bottomRows * rowH + 10;
  write('skills', 'Savoir-faire — ' + SKILLS.map(([g, items]) => `${g} : ${items.map(([n, l]) => `${n} ${l}/4`).join(', ')}`).join(' ; '), h, (t) => {
    let out = label(t, 0, 30, 'SAVOIR-FAIRE');
    SKILLS.forEach(([group, items], g) => {
      const x = g % 2 === 0 ? 0 : 470;
      const y0 = blockTop(g);
      const d = 0.15 + g * 0.12;
      out += `\n<text class="up"${at(d)} x="${x}" y="${y0}" font-size="21" font-weight="400" fill="${t.ink}">${esc(group)}</text>`;
      items.forEach(([name, lvl], i) => {
        const y = y0 + 22 + i * rowH;
        const dd = d + 0.05 + i * 0.04;
        out += `\n<line x1="${x}" y1="${y}" x2="${x + 430}" y2="${y}" stroke="${t.line}" stroke-width="1"/>`;
        for (let k = 0; k < 4; k++) {
          out += `<line class="grow"${at(dd + k * 0.05)} x1="${x + k * 13}" y1="${y + 17}" x2="${x + k * 13 + 9}" y2="${y + 17}" stroke="${k < lvl ? t.ink : t.line}" stroke-width="2"/>`;
        }
        out += `<text class="up"${at(dd)} x="${x + 70}" y="${y + 22}" font-size="14.5" fill="${t.text}">${esc(name)}</text>`;
      });
    });
    return out;
  });
}

// ---------------------------------------------------------------- 7. parcours
const PATH = [
  ["AUJOURD'HUI", 'Bachelor Développement & Design', 'La Manu'],
  ["AUJOURD'HUI", 'Fondateur', 'Elvo Studio'],
  ["AUJOURD'HUI", 'Caissier, CDI étudiant', 'Carrefour'],
  ['LYCÉE', 'Baccalauréat, spécialités NSI, SI et mathématiques', 'Lycée Jehan de Beauce'],
  ['SECONDE', "Stage de développeur d'applications", 'EBP'],
  ['ENGAGEMENT', 'Cadets de la Gendarmerie', 'Après le Service national universel'],
];

function path() {
  const top = 116, rowH = 62;
  const h = top + PATH.length * rowH + 4;
  write('parcours', 'Parcours — ' + PATH.map(([w, a, b]) => `${w.toLowerCase()} : ${a}, ${b}`).join(' ; '), h, (t) => {
    let out = `${label(t, 0, 30, 'PARCOURS')}
<text class="up"${at(0.15)} x="0" y="84" font-size="30" font-weight="300" fill="${t.ink}">Formation, terrain et engagement.</text>`;
    PATH.forEach(([when, what, where], i) => {
      const y = top + i * rowH;
      const d = 0.25 + i * 0.07;
      out += `
<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="${t.line}" stroke-width="1"/>
<text class="up"${at(d)} x="0" y="${y + 36}" font-size="10.5" font-weight="500" letter-spacing="2" fill="${t.soft}">${esc(when)}</text>
<text class="up"${at(d)} x="190" y="${y + 28}" font-size="17" font-weight="400" fill="${t.ink}">${esc(what)}</text>
<text class="up"${at(d + 0.03)} x="190" y="${y + 50}" font-size="13.5" fill="${t.soft}">${esc(where)}</text>`;
    });
    return out;
  });
}

// ---------------------------------------------------------------- 8. contact
function contact() {
  const h = 150;
  write('contact', 'Contact — Un projet, un stage ou une alternance ? Écrivez-moi.', h, (t) => `
${label(t, 0, 30, 'CONTACT')}
<text class="up"${at(0.15)} x="-2" y="92" font-size="40" font-weight="300" letter-spacing="-.5" fill="${t.ink}">Un projet, un stage ou une alternance ?</text>
<text class="up"${at(0.3)} x="-2" y="140" font-size="40" font-weight="300" letter-spacing="-.5" fill="${t.accent}">Écrivez-moi.</text>`);
}

// ---------------------------------------------------------------- 9. outils (icônes Simple Icons, licence CC0)
const ICONS = Object.fromEntries(JSON.parse(readFileSync(join(ROOT, 'scripts/icons.json'), 'utf8')).icons.map((i) => [i.slug, i]));
const STACK = [
  ['Web', ['html5', 'css', 'javascript', 'typescript', 'react', 'nodedotjs']],
  ['Données et IA', ['express', 'python', 'postgresql', 'mysql', 'supabase', 'claude']],
  ['Infra et cyber', ['docker', 'linux', 'proxmox', 'nginx', 'wireguard', 'git']],
];

function stack() {
  const top = 62, rowH = 60, colW = W / 6;
  const h = top + STACK.length * rowH + 2;
  const alt = 'Outils — ' + STACK.map(([g, s]) => `${g} : ${s.map((x) => ICONS[x].name).join(', ')}`).join(' ; ');
  write('outils', alt, h, (t) => {
    let out = label(t, 0, 30, 'OUTILS');
    STACK.forEach(([, slugs], r) => {
      const y = top + r * rowH;
      out += `\n<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="${t.line}" stroke-width="1"/>`;
      slugs.forEach((s, c) => {
        const x = c * colW;
        out += `\n<g class="up"${at(0.15 + r * 0.12 + c * 0.04)}><path transform="translate(${x} ${y + 18}) scale(1)" fill="${t.ink}" d="${ICONS[s].d}"/>` +
          `<text x="${x + 36}" y="${y + 35}" font-size="14.5" fill="${t.text}">${esc(ICONS[s].name)}</text></g>`;
      });
    });
    return out;
  });
}

// ---------------------------------------------------------------- 10. activité GitHub (scripts/stats.json, mis à jour chaque jour)
const MOIS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

function stats() {
  const file = join(ROOT, 'scripts/stats.json');
  if (!existsSync(file)) return;
  const s = JSON.parse(readFileSync(file, 'utf8'));
  const weeks = s.weeks;
  const n = weeks.length;
  const max = Math.max(1, ...weeks.map((w) => w.count));
  const best = weeks.reduce((a, w, i) => (w.count > weeks[a].count ? i : a), 0);
  const cTop = 172, cH = 104, base = cTop + cH;
  const step = W / n, bw = Math.max(4, step - 6);
  const langTop = base + 78;
  const h = langTop + 26 + s.languages.length * 34;
  const alt = `Activité GitHub — ${s.total} contributions publiques sur 12 mois, ${s.repos} dépôts publics, record de ${weeks[best].count} contributions en une semaine. Langages des dépôts publics : ${s.languages.map(([l, p]) => `${l} ${p} %`).join(', ')}.`;

  write('stats', alt, h, (t) => {
    let out = label(t, 0, 30, 'ACTIVITÉ GITHUB');
    // Chiffres clés
    [[s.total, 'contributions sur 12 mois'], [s.repos, 'dépôts publics'], [weeks[best].count, 'contributions en une semaine (record)']].forEach(([v, cap], i) => {
      const x = i * 300;
      out += `\n<text class="up"${at(0.1 + i * 0.08)} x="${x - 2}" y="98" font-size="46" font-weight="300" letter-spacing="-1" fill="${t.ink}">${v}</text>` +
        `<text class="up"${at(0.15 + i * 0.08)} x="${x}" y="124" font-size="13.5" fill="${t.soft}">${esc(cap)}</text>`;
    });
    // Contributions par semaine (une seule série, une seule couleur)
    out += `\n<text class="up"${at(0.3)} x="0" y="${cTop - 14}" font-size="10.5" font-weight="500" letter-spacing="2" fill="${t.soft}">CONTRIBUTIONS PAR SEMAINE</text>`;
    weeks.forEach((w, i) => {
      const x = (i * step + (step - bw) / 2).toFixed(1);
      if (w.count === 0) {
        out += `<rect x="${x}" y="${base - 2}" width="${bw.toFixed(1)}" height="2" rx="1" fill="${t.line}"/>`;
      } else {
        const bh = Math.max(4, (w.count / max) * cH);
        out += `<rect class="rise"${at(0.35 + i * 0.012)} x="${x}" y="${(base - bh).toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}" rx="2" fill="${t.ink}"><title>Semaine du ${w.start} : ${w.count}</title></rect>`;
      }
    });
    const bx = best * step + step / 2;
    out += `\n<text class="up"${at(1.1)} x="${bx.toFixed(1)}" y="${(base - cH - 8).toFixed(1)}" text-anchor="${bx > W - 30 ? 'end' : 'middle'}" font-size="12.5" fill="${t.text}">${weeks[best].count}</text>`;
    // Mois sous l'axe
    let lastX = -99;
    weeks.forEach((w, i) => {
      const m = new Date(w.start + 'T00:00:00Z').getUTCMonth();
      const prev = i ? new Date(weeks[i - 1].start + 'T00:00:00Z').getUTCMonth() : -1;
      const x = i * step;
      if (i > 0 && m !== prev && x - lastX > 52 && x < W - 30) {
        out += `<text x="${x.toFixed(1)}" y="${base + 22}" font-size="11" fill="${t.soft}">${MOIS[m]}</text>`;
        lastX = x;
      }
    });
    // Langages des dépôts publics
    out += `\n<text class="up"${at(0.5)} x="0" y="${langTop}" font-size="10.5" font-weight="500" letter-spacing="2" fill="${t.soft}">LANGAGES DES DÉPÔTS PUBLICS</text>`;
    const barX = 150, barW = W - barX - 70;
    s.languages.forEach(([lang, pct], i) => {
      const y = langTop + 26 + i * 34;
      const d = 0.6 + i * 0.08;
      out += `\n<text class="up"${at(d)} x="0" y="${y + 5}" font-size="14.5" fill="${t.text}">${esc(lang)}</text>` +
        `<rect x="${barX}" y="${y - 2}" width="${barW}" height="6" rx="3" fill="${t.line}"/>` +
        `<rect class="grow"${at(d)} x="${barX}" y="${y - 2}" width="${((pct / 100) * barW).toFixed(1)}" height="6" rx="3" fill="${t.ink}"/>` +
        `<text class="up"${at(d + 0.1)} x="${W}" y="${y + 5}" text-anchor="end" font-size="13.5" fill="${t.soft}">${String(pct).replace('.', ',')} %</text>`;
    });
    return out;
  });
}

// ---------------------------------------------------------------- build
rmSync(OUT, { recursive: true, force: true });
hero();
about();
heading('h-projets', 'PROJETS — DEV, CYBER, IA', 'Des projets en ligne, utilisés pour de vrai.');
FEATURED.forEach((p, i) => feature(p, i + 1));
heading('h-ecole', "PROJETS D'ÉCOLE");
SCHOOL.forEach((p, i) => row(p, i + FEATURED.length + 1));
skills();
stack();
stats();
path();
contact();
