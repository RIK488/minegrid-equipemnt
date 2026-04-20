/**
 * Split d'un gros module utilitaire en sous-modules par domaine fonctionnel,
 * avec conservation d'un "barrel" a l'emplacement d'origine pour preserver la
 * compatibilite ascendante des imports.
 *
 * Algorithme :
 *   1. Charge le fichier source via ts-morph.
 *   2. Pour chaque domaine (cle du mapping), identifie les fonctions/consts
 *      exportees listees et calcule pour chaque symbole :
 *        - ses imports externes necessaires (modules tiers et voisins)
 *        - ses references cross-domain (autres symboles exportes du meme
 *          fichier, appartenant a un autre domaine)
 *   3. Pour chaque domaine, ecrit un fichier :
 *        src/utils/<source>/<domain>.ts
 *      contenant : imports externes calcules + imports cross-domain + les
 *      declarations du domaine (copiees depuis le source).
 *   4. Remplace le contenu du fichier source par un "barrel" :
 *        export * from './<source>/types';  // si present
 *        export * from './<source>/<domain1>';
 *        export * from './<source>/<domain2>';
 *        ...
 *
 * Usage :
 *   npx tsx scripts/refactor/split-by-domain.ts --source=proApi [--dry]
 *
 * Limitations :
 *   - Seuls les symboles exportes au top-level sont consideres (fonctions et
 *     variables). Les interfaces/types sont supposees deja extraites vers
 *     types.ts (voir existing proApi/types.ts, api/types.ts,
 *     enterpriseApi/types.ts).
 */

import { Project, SyntaxKind, Node, VariableStatement, FunctionDeclaration } from 'ts-morph';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..', '..');

interface SplitConfig {
  /** nom court (= nom du dossier cree + nom du fichier source sans .ts) */
  name: string;
  /** chemin absolu du fichier source */
  sourcePath: string;
  /** mapping domaine -> symboles exportes a y mettre */
  mapping: Record<string, string[]>;
  /** si le fichier a deja un types.ts dedie, on le re-exporte depuis le barrel */
  hasTypes: boolean;
}

const CONFIGS: Record<string, SplitConfig> = {
  proApi: {
    name: 'proApi',
    sourcePath: path.join(REPO_ROOT, 'src', 'utils', 'proApi.ts'),
    hasTypes: true,
    mapping: {
      profile: ['getProClientProfile', 'upsertProClientProfile'],
      equipment: [
        'getClientEquipment',
        'addClientEquipment',
        'updateClientEquipment',
        'getEquipmentBySerialOrQR',
      ],
      orders: ['getClientOrders', 'createClientOrder'],
      documents: ['getTechnicalDocuments', 'uploadTechnicalDocument'],
      maintenance: [
        'getMaintenanceInterventions',
        'createMaintenanceIntervention',
        'getEquipmentDiagnostics',
        'addEquipmentDiagnostic',
      ],
      notifications: [
        'getClientNotifications',
        'markNotificationAsRead',
        'createClientNotification',
        'createMaintenanceNotification',
        'createOrderNotification',
        'createDiagnosticAlertNotification',
        'createWarrantyExpiryNotification',
        'deleteClientNotification',
        'deleteReadNotifications',
      ],
      users: [
        'getClientUsers',
        'inviteClientUser',
        'getUserInvitations',
        'cancelUserInvitation',
      ],
      machines: ['getUserMachines', 'getAllMachinesWithDetails'],
      settings: [
        'getUserSettings',
        'updateUserSettings',
        'exportUserData',
        'deleteUserAccount',
      ],
      misc: ['generateQRCode', 'hasActiveProSubscription', 'getPortalStats'],
    },
  },
  api: {
    name: 'api',
    sourcePath: path.join(REPO_ROOT, 'src', 'utils', 'api.ts'),
    hasTypes: true,
    mapping: {
      auth: ['registerUser', 'loginUser', 'logoutUser', 'getCurrentUser'],
      machines: ['publishMachine', 'getSellerMachines', 'recordMachineView'],
      dashboard: ['getDashboardStats', 'getWeeklyActivityData', 'getSalesPerformanceData'],
      messages: ['getMessages', 'sendMessage', 'markMessageAsRead'],
      offers: ['getOffers', 'createOffer', 'updateOfferStatus'],
      profile: [
        'getUserProfile',
        'updateUserProfile',
        'uploadProfilePicture',
        'changePassword',
        'deleteUserAccount',
      ],
      preferences: [
        'getUserPreferences',
        'updateUserPreferences',
        'updateNotificationSettings',
      ],
      notifications: [
        'getNotifications',
        'markNotificationAsRead',
        'markAllNotificationsAsRead',
        'createNotification',
      ],
      premium: ['getPremiumService', 'requestPremiumService', 'cancelPremiumService'],
      'service-history': ['getServiceHistory', 'logServiceAction'],
      sessions: ['getActiveSessions', 'revokeSession'],
    },
  },
  enterpriseApi: {
    name: 'enterpriseApi',
    sourcePath: path.join(REPO_ROOT, 'src', 'utils', 'enterpriseApi.ts'),
    hasTypes: true,
    mapping: {
      interventions: [
        'getDailyInterventions',
        'getInterventionsByStatus',
        'createIntervention',
        'getUrgentInterventions',
        'getPreventiveMaintenance',
        'createMaintenanceIntervention',
        'updateInterventionStatus',
        'updateMaintenanceIntervention',
        'deleteMaintenanceIntervention',
      ],
      repairs: ['getRepairsStatus', 'updateRepairStatus', 'assignTechnicianToRepair'],
      inventory: [
        'getInventoryStatus',
        'updateInventoryStock',
        'createStockOrder',
        'getStockAlerts',
      ],
      technicians: [
        'getTechniciansWorkload',
        'getTechnicianTasks',
        'updateTaskStatus',
        'getTechnicians',
      ],
      equipment: ['getEquipmentList', 'getEquipmentAvailability'],
      rentals: [
        'getRentalRevenue',
        'getUpcomingRentals',
        'createRental',
        'updateRentalStatus',
        'updateRental',
      ],
      stats: ['getMechanicStats'],
    },
  },
};

interface ImportInfo {
  moduleSpecifier: string;
  defaultImport?: string;
  namedImports: Set<string>;
  isTypeOnly: boolean;
  namedTypeImports: Set<string>;
}

function main() {
  const args = process.argv.slice(2);
  const dry = args.includes('--dry');
  const sourceArg = args.find((a) => a.startsWith('--source='));
  const key = sourceArg?.split('=')[1];
  if (!key || !CONFIGS[key]) {
    console.error(`Usage: split-by-domain.ts --source=${Object.keys(CONFIGS).join('|')} [--dry]`);
    process.exit(1);
  }
  const cfg = CONFIGS[key];
  const targetDir = path.join(path.dirname(cfg.sourcePath), cfg.name);

  console.log(`Source         : ${cfg.sourcePath}`);
  console.log(`Dossier cible  : ${targetDir}`);
  console.log(`Domaines       : ${Object.keys(cfg.mapping).length}`);

  const project = new Project({
    tsConfigFilePath: path.join(REPO_ROOT, 'tsconfig.json'),
    skipAddingFilesFromTsConfig: true,
  });
  const sf = project.addSourceFileAtPath(cfg.sourcePath);

  // 1. Indexer les imports du source
  const importBuckets = new Map<string, ImportInfo>();
  const nameToModule = new Map<string, { mod: string; isType: boolean }>();

  for (const imp of sf.getImportDeclarations()) {
    const mod = imp.getModuleSpecifierValue();
    const isTypeOnly = imp.isTypeOnly();
    if (!importBuckets.has(mod)) {
      importBuckets.set(mod, {
        moduleSpecifier: mod,
        namedImports: new Set(),
        namedTypeImports: new Set(),
        isTypeOnly: false,
      });
    }
    const b = importBuckets.get(mod)!;
    const def = imp.getDefaultImport();
    if (def) {
      b.defaultImport = def.getText();
      nameToModule.set(def.getText(), { mod, isType: isTypeOnly });
    }
    for (const ni of imp.getNamedImports()) {
      const nm = (ni.getAliasNode() ?? ni.getNameNode()).getText();
      if (isTypeOnly || ni.isTypeOnly()) {
        b.namedTypeImports.add(nm);
      } else {
        b.namedImports.add(nm);
      }
      nameToModule.set(nm, { mod, isType: isTypeOnly || ni.isTypeOnly() });
    }
  }

  // 2. Indexer les exports top-level : Map<name, nodeInfo>
  type ExportedNode = {
    name: string;
    node: FunctionDeclaration | VariableStatement;
    text: string;
    refs: Set<string>;
  };
  const exportedByName = new Map<string, ExportedNode>();

  for (const fn of sf.getFunctions()) {
    const nm = fn.getName();
    if (!nm || !fn.isExported()) continue;
    exportedByName.set(nm, {
      name: nm,
      node: fn,
      text: fn.getFullText().replace(/^\s+/, ''),
      refs: collectIdentifiers(fn),
    });
  }
  for (const vs of sf.getVariableStatements()) {
    if (!vs.isExported()) continue;
    for (const decl of vs.getDeclarations()) {
      const nm = decl.getName();
      exportedByName.set(nm, {
        name: nm,
        node: vs,
        text: vs.getFullText().replace(/^\s+/, ''),
        refs: collectIdentifiers(vs),
      });
    }
  }

  console.log(`Exports detectes: ${exportedByName.size}`);

  // Verifier que toutes les cles du mapping existent
  const allMappedNames = new Set<string>();
  for (const [domain, names] of Object.entries(cfg.mapping)) {
    for (const nm of names) {
      if (!exportedByName.has(nm)) {
        console.error(`  [!] '${nm}' (domaine ${domain}) introuvable dans les exports top-level`);
        process.exit(1);
      }
      if (allMappedNames.has(nm)) {
        console.error(`  [!] '${nm}' est liste dans deux domaines`);
        process.exit(1);
      }
      allMappedNames.add(nm);
    }
  }
  const unmapped = [...exportedByName.keys()].filter((n) => !allMappedNames.has(n));
  if (unmapped.length > 0) {
    console.warn(`  [!] ${unmapped.length} exports non mappes: ${unmapped.join(', ')}`);
  }

  // 3. Map nom -> domaine
  const nameToDomain = new Map<string, string>();
  for (const [domain, names] of Object.entries(cfg.mapping)) {
    for (const nm of names) nameToDomain.set(nm, domain);
  }

  // 4. Generer un fichier par domaine
  if (!dry && !fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

  for (const [domain, names] of Object.entries(cfg.mapping)) {
    const externalImports = new Map<string, ImportInfo>(); // mod (original) -> info
    const crossDomainImports = new Map<string, Set<string>>(); // domain -> names

    for (const nm of names) {
      const info = exportedByName.get(nm)!;
      for (const ref of info.refs) {
        if (ref === nm || names.includes(ref)) continue; // self-refs au domaine
        // Cross-domain ?
        const otherDomain = nameToDomain.get(ref);
        if (otherDomain && otherDomain !== domain) {
          if (!crossDomainImports.has(otherDomain))
            crossDomainImports.set(otherDomain, new Set());
          crossDomainImports.get(otherDomain)!.add(ref);
          continue;
        }
        // Import externe ?
        const ext = nameToModule.get(ref);
        if (ext) {
          if (!externalImports.has(ext.mod)) {
            externalImports.set(ext.mod, {
              moduleSpecifier: ext.mod,
              namedImports: new Set(),
              namedTypeImports: new Set(),
              isTypeOnly: false,
            });
          }
          const b = externalImports.get(ext.mod)!;
          const srcBucket = importBuckets.get(ext.mod)!;
          // Default ?
          if (srcBucket.defaultImport === ref) {
            b.defaultImport = ref;
          } else if (srcBucket.namedTypeImports.has(ref)) {
            b.namedTypeImports.add(ref);
          } else {
            b.namedImports.add(ref);
          }
          continue;
        }
      }
    }

    // 5. Ecrire le fichier domaine
    const domainPath = path.join(targetDir, `${domain}.ts`);
    const importLines: string[] = [];

    // External imports : sort + rewrite chemins relatifs
    const sortedExt = [...externalImports.entries()].sort((a, b) =>
      a[0].localeCompare(b[0]),
    );
    for (const [mod, info] of sortedExt) {
      const newMod = rewriteModulePath(mod, cfg.sourcePath, domainPath);
      const parts: string[] = [];
      if (info.defaultImport) parts.push(info.defaultImport);
      const named = [...info.namedImports].sort();
      if (named.length > 0) parts.push(`{ ${named.join(', ')} }`);
      if (parts.length > 0) {
        importLines.push(`import ${parts.join(', ')} from '${newMod}';`);
      }
      const namedTypes = [...info.namedTypeImports].sort();
      if (namedTypes.length > 0) {
        importLines.push(`import type { ${namedTypes.join(', ')} } from '${newMod}';`);
      }
    }

    // Cross-domain imports : ./otherDomain
    for (const [otherDomain, refs] of [...crossDomainImports.entries()].sort()) {
      const sorted = [...refs].sort();
      importLines.push(`import { ${sorted.join(', ')} } from './${otherDomain}';`);
    }

    // Corps
    const bodyParts = names.map((nm) => exportedByName.get(nm)!.text.trimEnd());
    const content = `${importLines.join('\n')}\n\n${bodyParts.join('\n\n')}\n`;

    if (dry) {
      console.log(`\n[dry] ${domain}.ts (${names.length} symboles, ${content.split('\n').length} lignes)`);
    } else {
      fs.writeFileSync(domainPath, content, { encoding: 'utf8' });
      console.log(`  [+] ${domain}.ts : ${names.length} symboles, ${content.split('\n').length} lignes`);
    }
  }

  // 6. Remplacer le source par un barrel
  const barrelLines: string[] = [
    `// Barrel : re-export de tous les sous-modules ${cfg.name} pour preserver la`,
    `// compatibilite ascendante. Pour les nouveaux imports, preferez cibler`,
    `// directement ./${cfg.name}/<domain>.`,
    '',
  ];
  if (cfg.hasTypes) {
    barrelLines.push(`export * from './${cfg.name}/types';`);
  }
  for (const domain of Object.keys(cfg.mapping)) {
    barrelLines.push(`export * from './${cfg.name}/${domain}';`);
  }
  const barrel = barrelLines.join('\n') + '\n';

  if (dry) {
    console.log(`\n[dry] Nouveau barrel (${barrel.split('\n').length} lignes):`);
    console.log(barrel);
  } else {
    fs.writeFileSync(cfg.sourcePath, barrel, { encoding: 'utf8' });
    console.log(`  [=] ${cfg.sourcePath} remplace par le barrel (${barrel.split('\n').length} lignes)`);
  }
}

/**
 * Reecrit un moduleSpecifier relatif pour qu'il reste correct apres que la
 * source ait ete deplacee du fichier `sourceFile` au fichier `targetFile`.
 * Les specifiers non-relatifs (ex: 'react', '@supabase/...') sont inchanges.
 */
function rewriteModulePath(
  originalSpec: string,
  sourceFile: string,
  targetFile: string,
): string {
  if (!originalSpec.startsWith('./') && !originalSpec.startsWith('../')) {
    return originalSpec;
  }
  const sourceDir = path.dirname(sourceFile);
  const absoluteTarget = path.resolve(sourceDir, originalSpec);
  const targetDir = path.dirname(targetFile);
  let newSpec = path.relative(targetDir, absoluteTarget).replace(/\\/g, '/');
  if (!newSpec.startsWith('.')) newSpec = './' + newSpec;
  return newSpec;
}

/**
 * Retourne l'ensemble des noms identifiants utilises dans un noeud, en
 * excluant les proprietes d'acces (obj.foo : 'foo' n'est pas une reference).
 */
function collectIdentifiers(node: Node): Set<string> {
  const refs = new Set<string>();
  node.forEachDescendant((n) => {
    if (n.getKind() !== SyntaxKind.Identifier) return;
    const parent = n.getParent();
    if (!parent) return;
    if (parent.getKind() === SyntaxKind.PropertyAccessExpression) {
      const pae = parent as any;
      if (pae.getNameNode && pae.getNameNode() === n) return;
    }
    // ne pas capter les noms de proprietes d'objet literal (clefs)
    if (parent.getKind() === SyntaxKind.PropertyAssignment) {
      const pa = parent as any;
      if (pa.getNameNode && pa.getNameNode() === n) return;
    }
    refs.add(n.getText());
  });
  return refs;
}

main();
