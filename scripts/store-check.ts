import fs from 'node:fs';
import path from 'node:path';

export type CheckResult = { ok: boolean; details?: string[] };
export type StoreCheckReport = { ok: boolean; failures: string[]; warnings: string[]; checks: Record<string, CheckResult> };

const REQUIRED_SCRIPTS = ['dev', 'build', 'lint', 'typecheck', 'test'];
const REQUIRED_API_ROUTES = ['app/api/health/route.ts', 'app/api/route/route.ts', 'app/api/affiliates/route.ts'];
const SECRET_PATTERNS = [/(?:^|\\s)sk_(?:live|test)_[A-Za-z0-9]{20,}/, /sk-or-v1-[A-Za-z0-9]{20,}/, /gsk_[A-Za-z0-9]{20,}/, /AIza[A-Za-z0-9_-]{20,}/, /xox[baprs]-[A-Za-z0-9-]{20,}/, /AKIA[0-9A-Z]{16}/, /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/];

function exists(root: string, relativePath: string): boolean { return fs.existsSync(path.join(root, relativePath)); }
function read(root: string, relativePath: string): string { return fs.readFileSync(path.join(root, relativePath), 'utf8'); }

function checkManifest(root: string): CheckResult {
  const file = path.join(root, 'public/manifest.webmanifest');
  if (!fs.existsSync(file)) return { ok: false, details: ['manifest.webmanifest missing'] };
  try {
    const manifest = JSON.parse(fs.readFileSync(file, 'utf8')) as { display?: string; start_url?: string; icons?: Array<{src?: string; sizes?: string; purpose?: string}> };
    const icons = manifest.icons ?? [];
    const required = [['/icons/icon-192.png','192x192','any'],['/icons/icon-512.png','512x512','any'],['/icons/maskable-512.png','512x512','maskable']] as const;
    const missing = required.filter(([src,size,purpose]) => !icons.some(icon => icon.src === src && icon.sizes === size && icon.purpose === purpose));
    const missingFiles = required.filter(([src]) => !exists(root, 'public' + src));
    const failures = [...(manifest.display !== 'standalone' ? ['manifest display must be standalone'] : []), ...(manifest.start_url !== '/' ? ['manifest start_url must be /'] : []), ...(missing.length ? ['required manifest icon entries missing'] : []), ...(missingFiles.length ? ['required manifest icon files missing'] : [])];
    return { ok: failures.length === 0, details: failures };
  } catch { return { ok: false, details: ['manifest.webmanifest is invalid JSON'] }; }
}

function checkRequiredScripts(root: string): CheckResult {
  try { const pkg = JSON.parse(read(root,'package.json')) as {scripts?: Record<string,string>}; const missing = REQUIRED_SCRIPTS.filter(name => !pkg.scripts?.[name]); return {ok: missing.length === 0, details: missing.map(x => 'missing npm script ' + x)}; }
  catch { return {ok:false, details:['package.json missing or invalid']}; }
}

function checkSecretScan(root: string): CheckResult {
  const allowed = new Set(['.env.example','package-lock.json']); const failures:string[]=[]; const ignoredDirs=new Set(['.git','node_modules','.next','android','ios']); const textExtensions=new Set(['.ts','.tsx','.js','.jsx','.mjs','.cjs','.json','.md','.sql','.yml','.yaml','.env','.txt']);
  function walk(dir:string){ for(const entry of fs.readdirSync(dir,{withFileTypes:true})){ if(ignoredDirs.has(entry.name)) continue; const full=path.join(dir,entry.name); const rel=path.relative(root,full); if(entry.isDirectory()) walk(full); else if(!allowed.has(rel) && (textExtensions.has(path.extname(entry.name)) || entry.name.startsWith('.env'))){ const content=fs.readFileSync(full,'utf8'); if(SECRET_PATTERNS.some(pattern=>pattern.test(content))) failures.push(rel); } } }
  walk(root); return {ok:failures.length===0, details:failures.map(file=>'possible credential in '+file)};
}

function checkSupabaseRls(root:string):CheckResult {
  const file=path.join(root,'packages/db/schema.sql'); if(!fs.existsSync(file)) return {ok:false,details:['packages/db/schema.sql missing']};
  const sql=fs.readFileSync(file,'utf8'); const tables=[...sql.matchAll(/CREATE TABLE IF NOT EXISTS\s+(\w+)/gi)].map(m=>m[1]);
  const missing=tables.filter(table=>!new RegExp('ALTER TABLE\\s+'+table+'\\s+ENABLE ROW LEVEL SECURITY','i').test(sql));
  return {ok:missing.length===0,details:missing.map(table=>'Supabase RLS missing on table '+table)};
}

function checkApiRoutes(root:string):CheckResult { const missing=REQUIRED_API_ROUTES.filter(route=>!exists(root,route)); return {ok:missing.length===0,details:missing.map(route=>'missing route '+route)}; }
function checkHosting(root:string):CheckResult { const hasNetlify=exists(root,'netlify.toml'); const hasVercel=exists(root,'vercel.json')||exists(root,'.vercel/project.json'); const details:string[]=[]; if(!hasNetlify&&!hasVercel) details.push('no recognized hosting configuration'); if(hasNetlify&&hasVercel) details.push('multiple hosting configurations present; verify canonical production host'); return {ok:details.length===0,details}; }

export function runStoreCheck(root:string=process.cwd()):StoreCheckReport {
  const checks={manifest:checkManifest(root),serviceWorker:{ok:exists(root,'public/sw.js')&&exists(root,'public/offline.html'),details:[]},privacyPolicy:{ok:exists(root,'public/privacy-policy.html'),details:[]},secretScan:checkSecretScan(root),requiredScripts:checkRequiredScripts(root),supabaseRls:checkSupabaseRls(root),apiRoutes:checkApiRoutes(root),hosting:checkHosting(root)};
  const failures=Object.values(checks).flatMap(check=>check.ok?[]:(check.details??[]));
  const warnings=['Production environment variables and remote Supabase state require provider-side verification.','Remote API health is not probed by the deterministic local check.'];
  return {ok:failures.length===0,failures,warnings,checks};
}

function printReport(report:StoreCheckReport){ for(const [name,check] of Object.entries(report.checks)){ console.log((check.ok?'PASS  ':'FAIL  ')+name); for(const detail of check.details??[]) console.log('       - '+detail); } for(const warning of report.warnings) console.log('WARN  '+warning); console.log(report.ok?'STORE_CHECK=PASS':'STORE_CHECK=FAIL'); }
if(process.argv[1] && path.resolve(process.argv[1])===path.resolve(__filename)){ const report=runStoreCheck(); printReport(report); process.exitCode=report.ok?0:1; }