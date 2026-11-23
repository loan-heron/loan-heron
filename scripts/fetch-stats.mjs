// Récupère les statistiques PUBLIQUES du compte GitHub et les écrit dans scripts/stats.json.
// Utilisé chaque jour par .github/workflows/stats.yml, puis build-svg.mjs dessine le visuel.
// En local : GITHUB_TOKEN=$(gh auth token) node scripts/fetch-stats.mjs
// Si l'API ne répond pas, le fichier existant est gardé tel quel.

import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const LOGIN = 'loan-heron';
const OUT = join(dirname(fileURLToPath(import.meta.url)), 'stats.json');
const token = process.env.GITHUB_TOKEN;
if (!token) {
  console.error('GITHUB_TOKEN manquant : stats non mises à jour.');
  process.exit(0);
}

const query = `query($login: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar { totalContributions weeks { firstDay contributionDays { contributionCount } } }
    }
    repositories(ownerAffiliations: OWNER, isFork: false, privacy: PUBLIC, first: 100) {
      totalCount
      nodes { languages(first: 10, orderBy: { field: SIZE, direction: DESC }) { edges { size node { name } } } }
    }
  }
}`;

try {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { Authorization: `bearer ${token}`, 'Content-Type': 'application/json', 'User-Agent': 'profil-stats' },
    body: JSON.stringify({ query, variables: { login: LOGIN } }),
  });
  const json = await res.json();
  if (!res.ok || json.errors) throw new Error(JSON.stringify(json.errors || res.status));
  const u = json.data.user;
  const cal = u.contributionsCollection.contributionCalendar;

  const bytes = {};
  for (const r of u.repositories.nodes) {
    for (const e of r.languages.edges) bytes[e.node.name] = (bytes[e.node.name] || 0) + e.size;
  }
  const sum = Object.values(bytes).reduce((a, b) => a + b, 0) || 1;
  const languages = Object.entries(bytes)
    .map(([name, b]) => [name, Math.round((b * 1000) / sum) / 10])
    .filter(([, p]) => p >= 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const stats = {
    total: cal.totalContributions,
    weeks: cal.weeks.map((w) => ({ start: w.firstDay, count: w.contributionDays.reduce((a, d) => a + d.contributionCount, 0) })),
    repos: u.repositories.totalCount,
    languages,
  };
  writeFileSync(OUT, JSON.stringify(stats, null, 1) + '\n', 'utf8');
  console.log(`✓ stats : ${stats.total} contributions, ${stats.repos} dépôts publics`);
} catch (err) {
  console.error('Stats non mises à jour :', err.message);
}
