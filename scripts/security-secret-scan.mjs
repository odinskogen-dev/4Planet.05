import fs from 'node:fs';
import path from 'node:path';

const ROOTS = ['src', 'public', 'functions', 'supabase'];
const TEXT_EXTENSIONS = new Set([
  '.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx', '.json', '.md', '.html', '.css', '.scss', '.sql', '.toml', '.yml', '.yaml', '.txt', '.env'
]);

const SECRET_RULES = [
  {
    id: 'private-key',
    pattern: /-----BEGIN (?:RSA |OPENSSH |EC )?PRIVATE KEY-----/g,
  },
  {
    id: 'stripe-live-secret',
    // A prefix literal such as expectedSecretPrefix: "sk_live_" is policy metadata,
    // not secret material. Require a plausible credential body after the prefix.
    pattern: /\bsk_live_[A-Za-z0-9]{20,}\b/g,
  },
  {
    id: 'supabase-service-role-literal',
    // Environment-variable names and env.SUPABASE_SERVICE_ROLE_KEY references are
    // safe source identifiers. Only flag an inline quoted credential-like value.
    pattern: /\bSUPABASE_SERVICE_ROLE(?:_KEY)?\b\s*[:=]\s*['"]([^'"\r\n]{20,})['"]/g,
    validate(match) {
      const value = match[1] || '';
      return !/^(?:process\.env\.|env\.|\$\{|<|YOUR_|REPLACE_|EXAMPLE_|TEST_)/i.test(value);
    },
  },
];

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, files);
      continue;
    }
    const ext = path.extname(entry.name).toLowerCase();
    if (TEXT_EXTENSIONS.has(ext) || entry.name.startsWith('.env')) files.push(full);
  }
  return files;
}

function scanText(text, file = '<memory>') {
  const findings = [];
  for (const rule of SECRET_RULES) {
    rule.pattern.lastIndex = 0;
    for (const match of text.matchAll(rule.pattern)) {
      if (rule.validate && !rule.validate(match)) continue;
      const before = text.slice(0, match.index);
      const line = before.split('\n').length;
      findings.push({ file, line, rule: rule.id });
    }
  }
  return findings;
}

function selfTest() {
  const shouldPass = [
    'expectedSecretPrefix: "sk_live_"',
    'SUPABASE_SERVICE_ROLE_KEY?: string;',
    'if (!env.SUPABASE_SERVICE_ROLE_KEY) return;',
    'authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`',
  ];
  const stripeCredentialShape = ['sk', 'live', '123456789012345678901234'].join('_');
  const shouldFail = [
    `const key = "${stripeCredentialShape}";`,
    'SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiJ9.payload.signature"',
    '-----BEGIN PRIVATE KEY-----',
  ];
  for (const sample of shouldPass) {
    if (scanText(sample).length) throw new Error(`false positive in self-test: ${sample}`);
  }
  for (const sample of shouldFail) {
    if (!scanText(sample).length) throw new Error(`missed secret pattern in self-test: ${sample}`);
  }
  console.log('SECURITY SECRET SCAN SELF-TEST PASS');
}

if (process.argv.includes('--self-test')) {
  selfTest();
  process.exit(0);
}

const files = ROOTS.flatMap((root) => walk(root));
const findings = [];
for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  findings.push(...scanText(text, file));
}

if (findings.length) {
  console.error('Potential embedded secret material found:');
  for (const finding of findings) {
    console.error(`${finding.file}:${finding.line} [${finding.rule}]`);
  }
  process.exit(1);
}

console.log(`SECURITY SECRET SCAN PASS: ${files.length} text files checked; identifiers/prefix metadata allowed, credential-shaped literals blocked.`);
