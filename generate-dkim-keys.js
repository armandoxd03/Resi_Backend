#!/usr/bin/env node

/**
 * DKIM Key Generator for ResiLinked
 * 
 * This script generates DKIM private and public keys that can be used
 * to configure email authentication to prevent emails from going to spam.
 * 
 * Usage:
 * node generate-dkim-keys.js
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

console.log('🔑 Generating DKIM keys for email authentication...');

// Generate key pair
const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  }
});

// Format the public key for DNS
let dnsFormatted = publicKey
  .toString()
  .replace(/-----BEGIN PUBLIC KEY-----/, '')
  .replace(/-----END PUBLIC KEY-----/, '')
  .replace(/\n/g, '')
  .trim();

// Format private key for .env file
let envPrivateKey = privateKey
  .toString()
  .replace(/\n/g, '\\n');

// Create output directory if it doesn't exist
const outputDir = path.join(__dirname, 'dkim-keys');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// Save private key to file
fs.writeFileSync(path.join(outputDir, 'dkim-private.pem'), privateKey);

// Save public key to file
fs.writeFileSync(path.join(outputDir, 'dkim-public.pem'), publicKey);

// Save DNS TXT record
fs.writeFileSync(
  path.join(outputDir, 'dkim-dns-record.txt'),
  `v=DKIM1; k=rsa; p=${dnsFormatted}`
);

// Save .env snippet
fs.writeFileSync(
  path.join(outputDir, 'dkim-env-snippet.txt'),
  `# DKIM Configuration
DKIM_DOMAIN=your-domain.com
DKIM_SELECTOR=email
DKIM_PRIVATE_KEY=${envPrivateKey}`
);

console.log('✅ DKIM keys generated successfully!');
console.log(`📁 Files saved to: ${outputDir}`);
console.log('\n📝 Instructions:');
console.log('1. Add the contents of dkim-env-snippet.txt to your .env file');
console.log('2. Create a TXT record in your DNS settings:');
console.log('   - Name: email._domainkey.your-domain.com');
console.log('   - Value: Contents of dkim-dns-record.txt');
console.log('\n⚠️ Important: Replace "your-domain.com" with your actual domain name');