import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const names = (await readdir(root)).filter((name) => name.endsWith('.html')).sort();
const documents = await Promise.all(
  names.map(async (name) => ({ name, html: await readFile(new URL(name, root), 'utf8') })),
);

/** @param {string} html */
function verbatimBlocks(html) {
  const blocks = html.matchAll(/<!-- verbatim:(\w+) -->([\s\S]*?)<!-- \/verbatim:\1 -->/g);
  return [...blocks].map(([, id, body]) => `${id}:${body.replaceAll(' aria-current="page"', '')}`);
}

test('every document carries identical verbatim blocks', () => {
  const [first, ...rest] = documents;
  assert.equal(verbatimBlocks(first.html).length, 3, `${first.name}: head, header, footer`);
  for (const { name, html } of rest) {
    assert.deepEqual(verbatimBlocks(html), verbatimBlocks(first.html), name);
  }
});

test('the CSP allows every inline script by hash', () => {
  const csp = documents[0].html.match(
    /http-equiv="Content-Security-Policy" content="([^"]+)"/,
  )?.[1];
  assert.ok(csp, 'CSP missing');
  for (const { name, html } of documents) {
    for (const [, attributes, body] of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)) {
      if (/\bsrc=|application\/ld\+json/.test(attributes)) continue;
      const hash = createHash('sha256').update(body).digest('base64');
      assert.ok(csp.includes(`'sha256-${hash}'`), `${name}: CSP lacks 'sha256-${hash}'`);
    }
  }
});

test('package.json imports mirror the import map', async () => {
  const pkg = JSON.parse(await readFile(new URL('package.json', root), 'utf8'));
  const map = JSON.parse(
    documents[0].html.match(/<script type="importmap">([\s\S]*?)<\/script>/)?.[1] ?? '{}',
  );
  const mirrored = Object.fromEntries(
    Object.entries(pkg.imports).map(([key, target]) => [
      key.replace(/\*$/, ''),
      String(target).replace(/^\./, '').replace(/\*$/, ''),
    ]),
  );
  assert.deepEqual(mirrored, map.imports);
});

test('every document declares one purpose', () => {
  for (const { name, html } of documents) {
    assert.match(html, /<title>[^<]+<\/title>/, `${name}: title`);
    assert.match(html, /<meta name="description" content="[^"]+">/, `${name}: description`);
    assert.equal(html.match(/<h1[\s>]/g)?.length, 1, `${name}: one h1`);
    assert.equal(html.match(/<main[\s>]/g)?.length, 1, `${name}: one main`);
    assert.equal(html.match(/aria-current="page"/g)?.length, 1, `${name}: one current link`);
  }
});

/**
 * @param {string} specifier
 * @param {string} from
 * @param {Record<string, string>} map
 */
function resolve(specifier, from, map) {
  const prefix = Object.keys(map)
    .filter((key) => specifier.startsWith(key))
    .sort((a, b) => b.length - a.length)[0];
  if (prefix) return map[prefix] + specifier.slice(prefix.length);
  return new URL(specifier, `https://app${from}`).pathname;
}

/**
 * @param {string} entry
 * @param {Record<string, string>} map
 * @param {Set<string>} [seen]
 */
async function staticGraph(entry, map, seen = new Set()) {
  if (seen.has(entry)) return seen;
  seen.add(entry);
  const source = await readFile(new URL(`.${entry}`, root), 'utf8');
  for (const [, specifier] of source.matchAll(/^import\s+(?:[^'"]*?from\s+)?'([^']+)'/gm)) {
    await staticGraph(resolve(specifier, entry, map), map, seen);
  }
  return seen;
}

test('every document preloads exactly the modules it will run', async () => {
  const map = JSON.parse(
    documents[0].html.match(/<script type="importmap">([\s\S]*?)<\/script>/)?.[1] ?? '{}',
  ).imports;
  const main = await readFile(new URL('js/main.js', root), 'utf8');
  const islands = [...main.matchAll(/lazyDefine\('([\w-]+)', \(\) => import\('([^']+)'\)\)/g)];
  const eager = await staticGraph('/js/main.js', map);
  eager.delete('/js/main.js');
  for (const { name, html } of documents) {
    const expected = new Set(eager);
    for (const [, tag, specifier] of islands) {
      if (!html.includes(`<${tag}`)) continue;
      for (const url of await staticGraph(resolve(specifier, '/js/main.js', map), map)) {
        expected.add(url);
      }
    }
    const listed = [...html.matchAll(/<link rel="modulepreload" href="([^"]+)">/g)].map(
      ([, href]) => href,
    );
    assert.deepEqual(listed.toSorted(), [...expected].toSorted(), name);
  }
});
