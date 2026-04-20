/**
 * Extrait un symbole top-level (composant, helper, hook) de
 * src/pages/EnterpriseDashboard.tsx vers src/pages/enterprise/widgets/<Name>.tsx.
 *
 * Algorithme :
 *   1. Ouvre le fichier source via ts-morph.
 *   2. Trouve la déclaration exacte à extraire.
 *   3. Analyse les identifiants référencés dans son corps et détermine les
 *      imports externes nécessaires.
 *   4. Vérifie que la déclaration n'a AUCUNE dépendance sur un autre symbole
 *      top-level du fichier (= feuille). Si non, avorte avec un message clair.
 *   5. Crée le nouveau fichier avec imports + déclaration exportée.
 *   6. Retire la déclaration du fichier source.
 *   7. Ajoute un import depuis le nouveau fichier dans le source.
 *   8. Sauvegarde les deux fichiers via ts-morph (UTF-8 sans BOM).
 *
 * Usage :
 *   npx tsx scripts/refactor/extract-widget.ts PerformanceScoreWidget
 *
 * Options :
 *   --dry         : affiche ce qui serait fait, sans écrire
 *   --allow-deps  : autorise l'extraction même si le symbole dépend d'autres
 *                   symboles top-level (dangereux)
 */

import {
  Project,
  SyntaxKind,
  Node,
  SourceFile,
  VariableStatement,
  FunctionDeclaration,
} from 'ts-morph';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const SOURCE_PATH = path.join(REPO_ROOT, 'src', 'pages', 'EnterpriseDashboard.tsx');
const TARGET_DIR = path.join(REPO_ROOT, 'src', 'pages', 'enterprise', 'widgets');

interface ImportSource {
  moduleSpecifier: string;
  defaultImport?: string;
  namedImports: Set<string>;
  namespaceImport?: string;
}

function main() {
  const args = process.argv.slice(2);
  const dry = args.includes('--dry');
  const allowDeps = args.includes('--allow-deps');
  const targetName = args.find((a) => !a.startsWith('--'));

  if (!targetName) {
    console.error('Usage: extract-widget.ts <SymbolName> [--dry] [--allow-deps]');
    process.exit(1);
  }

  const project = new Project({
    tsConfigFilePath: path.join(REPO_ROOT, 'tsconfig.json'),
    skipAddingFilesFromTsConfig: true,
  });
  const sf = project.addSourceFileAtPath(SOURCE_PATH);

  // 1. Catalogue des noms top-level et des imports du fichier source
  const topLevelNames = new Set<string>();
  const importsMap = new Map<string, ImportSource>(); // key = moduleSpecifier
  const nameToImport = new Map<
    string,
    { moduleSpecifier: string; kind: 'default' | 'named' | 'namespace' }
  >();

  for (const imp of sf.getImportDeclarations()) {
    const mod = imp.getModuleSpecifierValue();
    if (!importsMap.has(mod))
      importsMap.set(mod, {
        moduleSpecifier: mod,
        namedImports: new Set<string>(),
      });
    const bucket = importsMap.get(mod)!;

    const def = imp.getDefaultImport();
    if (def) {
      bucket.defaultImport = def.getText();
      nameToImport.set(def.getText(), {
        moduleSpecifier: mod,
        kind: 'default',
      });
    }
    for (const ni of imp.getNamedImports()) {
      const alias = ni.getAliasNode();
      const displayName = (alias ?? ni.getNameNode()).getText();
      bucket.namedImports.add(
        alias ? `${ni.getNameNode().getText()} as ${alias.getText()}` : ni.getNameNode().getText(),
      );
      nameToImport.set(displayName, { moduleSpecifier: mod, kind: 'named' });
    }
    const ns = imp.getNamespaceImport();
    if (ns) {
      bucket.namespaceImport = ns.getText();
      nameToImport.set(ns.getText(), {
        moduleSpecifier: mod,
        kind: 'namespace',
      });
    }
  }

  for (const stmt of sf.getVariableStatements()) {
    for (const decl of stmt.getDeclarations()) {
      topLevelNames.add(decl.getName());
    }
  }
  for (const fn of sf.getFunctions()) {
    const n = fn.getName();
    if (n) topLevelNames.add(n);
  }
  for (const iface of sf.getInterfaces()) topLevelNames.add(iface.getName());
  for (const ta of sf.getTypeAliases()) topLevelNames.add(ta.getName());

  // 2. Trouver la déclaration cible
  const found = findDeclaration(sf, targetName);
  if (!found) {
    console.error(`Symbole top-level '${targetName}' introuvable dans ${SOURCE_PATH}`);
    process.exit(1);
  }

  const { declNode, body, getText } = found;

  // 3. Analyser les identifiants référencés
  const refNames = new Set<string>();
  body.forEachDescendant((node) => {
    if (node.getKind() !== SyntaxKind.Identifier) return;
    const txt = node.getText();
    if (txt === targetName) return;

    // Skip noms de propriété d'objet (foo dans `obj.foo`, sauf si c'est
    // l'objet lui-même)
    const parent = node.getParent();
    if (
      parent &&
      parent.getKind() === SyntaxKind.PropertyAccessExpression &&
      (parent as any).getName &&
      (parent as any).getName() === txt &&
      (parent as any).getExpression() !== node
    ) {
      return;
    }
    refNames.add(txt);
  });

  const internalRefs = Array.from(refNames).filter(
    (n) => topLevelNames.has(n) && n !== targetName,
  );
  const externalRefs = Array.from(refNames).filter((n) =>
    nameToImport.has(n),
  );

  console.log(`\n=== Analyse de ${targetName} ===`);
  console.log(`Dépendances internes (top-level) : ${internalRefs.length}`);
  if (internalRefs.length > 0) {
    for (const r of internalRefs) console.log(`  - ${r}`);
  }
  console.log(`Imports externes référencés : ${externalRefs.length}`);

  if (internalRefs.length > 0 && !allowDeps) {
    console.error(
      `\n[AVORT] '${targetName}' dépend d'autres symboles top-level. ` +
        `Extraire d'abord ces symboles ou relancer avec --allow-deps (non recommandé).`,
    );
    process.exit(2);
  }

  // 4. Construire les imports du nouveau fichier
  const requiredImports = new Map<string, ImportSource>();
  for (const refName of externalRefs) {
    const info = nameToImport.get(refName)!;
    if (!requiredImports.has(info.moduleSpecifier)) {
      requiredImports.set(info.moduleSpecifier, {
        moduleSpecifier: info.moduleSpecifier,
        namedImports: new Set<string>(),
      });
    }
    const b = requiredImports.get(info.moduleSpecifier)!;
    if (info.kind === 'default') b.defaultImport = refName;
    else if (info.kind === 'namespace') b.namespaceImport = refName;
    else {
      // Récupérer la forme (avec alias éventuel) depuis l'import original
      const original = importsMap.get(info.moduleSpecifier)!;
      const match = Array.from(original.namedImports).find(
        (n) => n === refName || n.endsWith(` as ${refName}`),
      );
      b.namedImports.add(match ?? refName);
    }
  }

  // 5. Toujours importer React si le corps utilise du JSX
  // (on vérifie la présence de `<` en tant que JSX dans les descendants)
  const usesJsx = body.getDescendantsOfKind(SyntaxKind.JsxElement).length > 0 ||
                  body.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement).length > 0 ||
                  body.getDescendantsOfKind(SyntaxKind.JsxFragment).length > 0;
  if (usesJsx && !requiredImports.has('react')) {
    requiredImports.set('react', {
      moduleSpecifier: 'react',
      namedImports: new Set<string>(),
    });
  }
  // Ajouter React par défaut si pas déjà présent et JSX utilisé
  if (usesJsx) {
    const reactBucket = requiredImports.get('react')!;
    if (!reactBucket.defaultImport) reactBucket.defaultImport = 'React';
  }

  // 6. Convertir les chemins d'import relatifs (du source vers la cible)
  const newFilePath = path.join(TARGET_DIR, `${targetName}.tsx`);
  const finalImports = Array.from(requiredImports.values())
    .map((imp) => rewriteRelativePath(imp, SOURCE_PATH, newFilePath))
    .map(renderImportStatement)
    .join('\n');

  // 7. Corps du symbole à extraire, avec `export` devant
  let declText = declNode.getText();
  // ts-morph ne rend pas les commentaires jsdoc en `.getText()` par défaut si
  // l'on travaille sur VariableStatement — on les inclut via getFullText trim
  // start whitespace only
  declText = ensureExportPrefix(declText);

  const newFileContent = `${finalImports}\n\n${declText}\n`;

  if (dry) {
    console.log(`\n[DRY-RUN] Nouveau fichier : ${newFilePath}`);
    console.log('------ Preview ------');
    console.log(newFileContent.slice(0, 600) + (newFileContent.length > 600 ? '\n[...]' : ''));
    console.log('------');
    return;
  }

  // 8. Écrire le nouveau fichier
  fs.mkdirSync(path.dirname(newFilePath), { recursive: true });
  // ts-morph écrit en UTF-8 sans BOM par défaut
  const targetSf = project.createSourceFile(newFilePath, newFileContent, {
    overwrite: true,
  });

  // 9. Retirer la déclaration du fichier source
  declNode.remove();

  // 10. Ajouter l'import depuis le nouveau fichier dans le source
  const importPath = toImportPath(SOURCE_PATH, newFilePath);
  sf.addImportDeclaration({
    moduleSpecifier: importPath,
    namedImports: [targetName],
  });

  // 11. Sauvegarder
  targetSf.saveSync();
  sf.saveSync();

  console.log(`\n[OK] ${targetName} extrait.`);
  console.log(`  Nouveau fichier : ${newFilePath}`);
  console.log(`  Imports générés : ${requiredImports.size} modules`);
  console.log(`  Import ajouté dans le source : from '${importPath}'`);
}

function findDeclaration(sf: SourceFile, name: string):
  | {
      declNode: VariableStatement | FunctionDeclaration;
      body: Node;
      getText: () => string;
    }
  | undefined {
  for (const stmt of sf.getVariableStatements()) {
    const decls = stmt.getDeclarations();
    const match = decls.find((d) => d.getName() === name);
    if (match) {
      if (decls.length > 1) {
        console.error(
          `[AVORT] VariableStatement contenant '${name}' déclare aussi ${
            decls.length - 1
          } autres symboles. Cas non géré pour éviter toute régression.`,
        );
        process.exit(3);
      }
      const init = match.getInitializer();
      if (!init) continue;
      return {
        declNode: stmt,
        body: init,
        getText: () => stmt.getText(),
      };
    }
  }
  for (const fn of sf.getFunctions()) {
    if (fn.getName() === name) {
      const body = fn.getBody();
      if (!body) continue;
      return {
        declNode: fn,
        body,
        getText: () => fn.getText(),
      };
    }
  }
  return undefined;
}

function ensureExportPrefix(text: string): string {
  if (text.startsWith('export ')) return text;
  return `export ${text}`;
}

function rewriteRelativePath(
  imp: ImportSource,
  fromFile: string,
  toFile: string,
): ImportSource {
  const mod = imp.moduleSpecifier;
  if (!mod.startsWith('.')) return imp; // package externe

  // Résoudre l'absolu depuis fromFile, puis recalculer depuis toFile
  const absolute = path.resolve(path.dirname(fromFile), mod);
  let rel = path.relative(path.dirname(toFile), absolute).split(path.sep).join('/');
  if (!rel.startsWith('.')) rel = './' + rel;
  return { ...imp, moduleSpecifier: rel };
}

function renderImportStatement(imp: ImportSource): string {
  const parts: string[] = [];
  if (imp.defaultImport) parts.push(imp.defaultImport);
  if (imp.namespaceImport) parts.push(`* as ${imp.namespaceImport}`);
  if (imp.namedImports.size > 0) {
    const sorted = Array.from(imp.namedImports).sort();
    if (sorted.length <= 3) {
      parts.push(`{ ${sorted.join(', ')} }`);
    } else {
      parts.push(`{\n  ${sorted.join(',\n  ')},\n}`);
    }
  }
  return `import ${parts.join(', ')} from '${imp.moduleSpecifier}';`;
}

function toImportPath(fromFile: string, toFile: string): string {
  const withoutExt = toFile.replace(/\.(tsx?|jsx?)$/, '');
  let rel = path.relative(path.dirname(fromFile), withoutExt).split(path.sep).join('/');
  if (!rel.startsWith('.')) rel = './' + rel;
  return rel;
}

main();
