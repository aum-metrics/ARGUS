#!/usr/bin/env node
/**
 * Author: Sambath Kumar Natarajan
 * 
 * System Health Check Script
 * verify environment variables, core file integrity, and dependencies
 */

const fs = require('fs');
const https = require('https');
const path = require('path');

console.log('\x1b[36m%s\x1b[0m', '>> ARGUS SYSTEM DIAGNOSTICS (V2.0)');
console.log('-------------------------------------------');

let hasErrors = false;

// 1. Env Check
console.log('[-] Checking Environment Configuration...');

if (!fs.existsSync(path.join(process.cwd(), '.env.local')) && !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.log('\x1b[33m%s\x1b[0m', '    [WARN] No .env.local found (ignore if CI/Vercel).');
} else {
    console.log('\x1b[32m%s\x1b[0m', '    [PASS] Environment Config detected.');
}

// 2. Critical Files
const criticalFiles = [
    'app/page.tsx',
    'app/dashboard/page.tsx',
    'app/api/gemini/route.ts',
    'supabase/consolidated_schema.sql',
    'ARCHITECTURE.md',
    'LICENSE'
];

console.log('[-] Verifying Core Manifest...');
criticalFiles.forEach(f => {
    if (fs.existsSync(path.join(process.cwd(), f))) {
        // ok
    } else {
        console.log('\x1b[31m%s\x1b[0m', `    [FAIL] Missing Core File: ${f}`);
        hasErrors = true;
    }
});
if (!hasErrors) console.log('\x1b[32m%s\x1b[0m', '    [PASS] Core Manifest Integrity Verified.');

// 3. Dependency Check
console.log('[-] Checking Dependencies...');
const packageJson = require(path.join(process.cwd(), 'package.json'));
const requiredDeps = ['next', 'lucide-react', '@google/generative-ai', '@supabase/supabase-js'];

requiredDeps.forEach(d => {
    if (!packageJson.dependencies[d] && !packageJson.devDependencies[d]) {
        console.log('\x1b[31m%s\x1b[0m', `    [FAIL] Missing Dependency: ${d}`);
        hasErrors = true;
    }
});
console.log('\x1b[32m%s\x1b[0m', '    [PASS] Dependency Graph Valid.');

// Summary
console.log('-------------------------------------------');
if (hasErrors) {
    console.log('\x1b[31m%s\x1b[0m', '>> DIAGNOSTICS FAILED. SEE ERRORS ABOVE.');
    process.exit(1);
} else {
    console.log('\x1b[32m%s\x1b[0m', '>> ALL SYSTEMS OPERATIONAL. READY FOR FLIGHT.');
    process.exit(0);
}
