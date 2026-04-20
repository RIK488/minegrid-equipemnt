/**
 * Analyse des dépendances top-level de src/pages/EnterpriseDashboard.tsx.
 *
 * Pour chaque `VariableDeclaration` et `FunctionDeclaration` au niveau du
 * fichier (composants React, helpers, constantes), on extrait :
 *   - nom
 *   - type (composant React, hook, helper, constante, type/interface)
 *   - numéro de ligne
 *   - taille (nb de lignes)
 *   - set des identifiants top-level qu'il référence (dépendances internes)
 *
 * Sortie : deux fichiers JSON dans scripts/refactor/output/
 *   - enterprise-dashboard-nodes.json   : catalogue des symboles
 *   - enterprise-dashboard-deps.json    : graphe (adjacency list)
 *
 * Plus un rapport Markdown scripts/refactor/output/analysis.md.
 *
 * Usage :
 *   npx tsx scripts/refactor/analyze-deps.ts
 */

import {
  Project,
  SyntaxKind,
  Node,
  SourceFile,
  VariableDeclaration,
  FunctionDeclaration,
} from 'ts-morph';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO_ROOT = path.resolve(__dirname, '..', '..');

const SOURCES: Record<string, string> = {
  enterprise: path.join(REPO_ROOT, 'src', 'pages', 'EnterpriseDashboard.tsx'),
  pro: path.join(REPO_ROOT, 'src', 'pages', 'ProDashboard.tsx'),
  vitrine: path.join(REPO_ROOT, 'src', 'pages', 'VitrinePersonnalisee.tsx'),
  publication: path.join(REPO_ROOT, 'src', 'pages', 'PublicationRapide.tsx'),
};

const sourceArg = process.argv.slice(2).find((a) => a.startsWith('--source='));
const sourceKey = sourceArg?.split('=')[1] ?? 'enterprise';
if (!SOURCES[sourceKey]) {
  console.error(`Source inconnue: ${sourceKey}. Possibles: ${Object.keys(SOURCES).join(', ')}`);
  process.exit(1);
}
const SOURCE_FILE = SOURCES[sourceKey];
const OUT_DIR = path.join(__dirname, 'output');

interface TopLevelSymbol {
  name: string;
  kind: 'component' | 'hook' | 'helper' | 'constant' | 'type';
  line: number;
  endLine: number;
  lineCount: number;
  /** identifiants top-level de CE fichier référencés dans le corps */
  internalRefs: string[];
  /** identifiants importés depuis d'autres fichiers (pour header futur) */
  importedRefs: string[];
}

function main() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const project = new Project({
    tsConfigFilePath: path.join(REPO_ROOT, 'tsconfig.json'),
    skipAddingFilesFromTsConfig: true,
  });
  const sf = project.addSourceFileAtPath(SOURCE_FILE);

  // 1. Collecte des noms top-level et des imports
  const topLevelNames = new Set<string>();
  const importedNames = new Set<string>();

  for (const imp of sf.getImportDeclarations()) {
    const def = imp.getDefaultImport();
    if (def) importedNames.add(def.getText());
    for (const ni of imp.getNamedImports()) {
      importedNames.add((ni.getAliasNode() ?? ni.getNameNode()).getText());
    }
    const ns = imp.getNamespaceImport();
    if (ns) importedNames.add(ns.getText());
  }

  const collectNameFromDecl = (
    decl: VariableDeclaration | FunctionDeclaration,
  ): string | undefined => {
    const name = decl.getName();
    return typeof name === 'string' ? name : undefined;
  };

  for (const stmt of sf.getVariableStatements()) {
    for (const decl of stmt.getDeclarations()) {
      const n = collectNameFromDecl(decl);
      if (n) topLevelNames.add(n);
    }
  }
  for (const fn of sf.getFunctions()) {
    const n = collectNameFromDecl(fn);
    if (n) topLevelNames.add(n);
  }
  for (const iface of sf.getInterfaces()) {
    topLevelNames.add(iface.getName());
  }
  for (const typeAlias of sf.getTypeAliases()) {
    topLevelNames.add(typeAlias.getName());
  }

  console.log(`Symbols top-level détectés : ${topLevelNames.size}`);
  console.log(`Imports externes : ${importedNames.size}`);

  // 2. Analyse de chaque symbole
  const symbols: TopLevelSymbol[] = [];

  const addSymbol = (
    name: string,
    body: Node | undefined,
    line: number,
    endLine: number,
    rawKind: TopLevelSymbol['kind'],
  ) => {
    const internal = new Set<string>();
    const imported = new Set<string>();

    if (body) {
      body.forEachDescendant((node) => {
        if (node.getKind() !== SyntaxKind.Identifier) return;
        const text = node.getText();
        if (text === name) return; // auto-référence

        // On ignore les identifiants qui sont des noms de propriété
        // (ex: `obj.foo` — `foo` ici n'est pas une ref top-level).
        const parent = node.getParent();
        if (
          parent &&
          parent.getKind() === SyntaxKind.PropertyAccessExpression &&
          (parent as any).getName && // Property side
          (parent as any).getName() === text &&
          (parent as any).getExpression() !== node
        ) {
          return;
        }

        if (topLevelNames.has(text)) internal.add(text);
        else if (importedNames.has(text)) imported.add(text);
      });
    }

    symbols.push({
      name,
      kind: rawKind,
      line,
      endLine,
      lineCount: endLine - line + 1,
      internalRefs: Array.from(internal).sort(),
      importedRefs: Array.from(imported).sort(),
    });
  };

  const classifyVariable = (decl: VariableDeclaration): TopLevelSymbol['kind'] => {
    const name = decl.getName();
    const init = decl.getInitializer();

    if (name.startsWith('use') && name.length > 3 && name[3] === name[3].toUpperCase()) {
      return 'hook';
    }
    // Composant React : nom en PascalCase + init est une flèche/fonction qui
    // retourne du JSX.
    if (name[0] === name[0].toUpperCase()) {
      if (
        init &&
        (init.getKind() === SyntaxKind.ArrowFunction ||
          init.getKind() === SyntaxKind.FunctionExpression)
      ) {
        return 'component';
      }
    }
    if (
      init &&
      (init.getKind() === SyntaxKind.ArrowFunction ||
        init.getKind() === SyntaxKind.FunctionExpression)
    ) {
      return 'helper';
    }
    return 'constant';
  };

  for (const stmt of sf.getVariableStatements()) {
    for (const decl of stmt.getDeclarations()) {
      const name = decl.getName();
      if (!topLevelNames.has(name)) continue;
      const init = decl.getInitializer();
      addSymbol(
        name,
        init,
        stmt.getStartLineNumber(),
        stmt.getEndLineNumber(),
        classifyVariable(decl),
      );
    }
  }

  for (const fn of sf.getFunctions()) {
    const name = fn.getName();
    if (!name) continue;
    const kind = name[0] === name[0].toUpperCase() ? 'component' : 'helper';
    addSymbol(name, fn.getBody(), fn.getStartLineNumber(), fn.getEndLineNumber(), kind);
  }

  for (const iface of sf.getInterfaces()) {
    addSymbol(
      iface.getName(),
      iface,
      iface.getStartLineNumber(),
      iface.getEndLineNumber(),
      'type',
    );
  }
  for (const typeAlias of sf.getTypeAliases()) {
    addSymbol(
      typeAlias.getName(),
      typeAlias.getTypeNode(),
      typeAlias.getStartLineNumber(),
      typeAlias.getEndLineNumber(),
      'type',
    );
  }

  // 3. Calcul des "feuilles" (aucune dépendance interne vers d'autres symboles
  // que des types)
  const typeNames = new Set(symbols.filter((s) => s.kind === 'type').map((s) => s.name));
  const leaves = symbols.filter(
    (s) =>
      s.kind !== 'type' &&
      s.internalRefs.filter((r) => !typeNames.has(r)).length === 0,
  );

  // 4. Écriture des outputs
  fs.writeFileSync(
    path.join(OUT_DIR, 'enterprise-dashboard-nodes.json'),
    JSON.stringify(symbols, null, 2),
  );

  const deps: Record<string, string[]> = {};
  for (const s of symbols) deps[s.name] = s.internalRefs;
  fs.writeFileSync(
    path.join(OUT_DIR, 'enterprise-dashboard-deps.json'),
    JSON.stringify(deps, null, 2),
  );

  // 5. Rapport markdown lisible
  const byKind = (k: TopLevelSymbol['kind']) =>
    symbols.filter((s) => s.kind === k).sort((a, b) => b.lineCount - a.lineCount);

  const fmtRow = (s: TopLevelSymbol) =>
    `| \`${s.name}\` | ${s.lineCount} | L${s.line}-${s.endLine} | ${
      s.internalRefs.length
    } | ${s.internalRefs.slice(0, 6).join(', ')}${
      s.internalRefs.length > 6 ? '…' : ''
    } |`;

  const report = [
    `# Analyse des dépendances — \`src/pages/EnterpriseDashboard.tsx\``,
    '',
    `Généré le ${new Date().toISOString()}.`,
    '',
    `**Symboles top-level** : ${symbols.length}`,
    `**Composants** : ${byKind('component').length}`,
    `**Helpers** : ${byKind('helper').length}`,
    `**Hooks** : ${byKind('hook').length}`,
    `**Constantes** : ${byKind('constant').length}`,
    `**Types/Interfaces** : ${byKind('type').length}`,
    '',
    '## Feuilles extractibles en premier',
    '',
    'Ces symboles ne dépendent **d\'aucun** autre symbole top-level du fichier',
    '(hors types/interfaces). Ce sont les plus simples à extraire.',
    '',
    '| Nom | Lignes | Plage | Deps | Références |',
    '| --- | ---: | --- | ---: | --- |',
    ...leaves
      .sort((a, b) => b.lineCount - a.lineCount)
      .map((s) => fmtRow(s)),
    '',
    '## Tous les composants (par taille)',
    '',
    '| Nom | Lignes | Plage | Deps internes | Principales refs |',
    '| --- | ---: | --- | ---: | --- |',
    ...byKind('component').map(fmtRow),
    '',
    '## Helpers top-level',
    '',
    '| Nom | Lignes | Plage | Deps | Références |',
    '| --- | ---: | --- | ---: | --- |',
    ...byKind('helper').map(fmtRow),
    '',
    '## Hooks top-level',
    '',
    '| Nom | Lignes | Plage | Deps | Références |',
    '| --- | ---: | --- | ---: | --- |',
    ...byKind('hook').map(fmtRow),
    '',
  ].join('\n');

  fs.writeFileSync(path.join(OUT_DIR, 'analysis.md'), report);

  console.log('\n=== Résumé ===');
  console.log(`Composants : ${byKind('component').length}`);
  console.log(`Helpers : ${byKind('helper').length}`);
  console.log(`Hooks : ${byKind('hook').length}`);
  console.log(`Feuilles (aucune dep interne) : ${leaves.length}`);
  console.log(`\nTop 10 feuilles par taille :`);
  for (const l of leaves.sort((a, b) => b.lineCount - a.lineCount).slice(0, 10)) {
    console.log(`  - ${l.name} (${l.kind}, ${l.lineCount} lignes, L${l.line})`);
  }
  console.log(`\nOutputs : ${OUT_DIR}`);
}

main();
