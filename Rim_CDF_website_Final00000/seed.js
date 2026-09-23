/**
 * Enterprise OpenFOAM CFD Platform - Seed Accounts & TOTP Configuration
 * 
 * DEVELOPED by Akhil.A gmail :- akkedu01@gmail.com
 * 
 * Run with: node seed.js
 */

import crypto from 'crypto';
import bcrypt from 'bcryptjs';

// Deterministic Base32 Secret used for Admin TOTP 2FA
export const ADMIN_TOTP_SECRET = process.env.ADMIN_TOTP_SECRET || 'JBSWY3DPEHPK3PXP';

// Base32 Decoding for TOTP Computation
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function base32Decode(input) {
  const clean = input.toUpperCase().replace(/=+$/, '');
  let bits = 0;
  let value = 0;
  const bytes = [];

  for (let i = 0; i < clean.length; i++) {
    const idx = BASE32_ALPHABET.indexOf(clean[i]);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

// Compute standard RFC 6238 6-digit TOTP
export function computeTotp(secretBase32 = ADMIN_TOTP_SECRET, timeStep = Math.floor(Date.now() / 1000 / 30)) {
  const key = base32Decode(secretBase32);
  const timeBuffer = Buffer.alloc(8);
  timeBuffer.writeBigUInt64BE(BigInt(timeStep));

  const hmac = crypto.createHmac('sha1', key);
  hmac.update(timeBuffer);
  const digest = hmac.digest();

  const offset = digest[digest.length - 1] & 0x0f;
  const binary =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);

  const otp = binary % 1000000;
  return otp.toString().padStart(6, '0');
}

export const SEED_CREDENTIALS = [
  {
    role: 'Lead Administrator & Senior CFD Aerodynamicist',
    email: 'akkedu01@gmail.com',
    password: 'AdminCFD@2026#Secure',
    totpEnabled: true,
    totpSecret: ADMIN_TOTP_SECRET,
    demoBypassCode: '123456',
    notes: 'Mandatory 2FA enabled. Requires TOTP 6-digit code or demo bypass 123456.',
  },
  {
    role: 'Operator User (Aerospace Analyst)',
    email: 'operator@cfd.local',
    aliases: ['operator@cfo.local'],
    password: 'UserCFD@2026#Secure',
    totpEnabled: false,
    totpSecret: null,
    notes: 'No 2FA required. Instant 1-click authentication.',
  },
];

export async function getHashedSeedUsers() {
  const adminHash = await bcrypt.hash('AdminCFD@2026#Secure', 12);
  const userHash = await bcrypt.hash('UserCFD@2026#Secure', 12);

  return [
    {
      id: 'usr_admin_001',
      email: 'akkedu01@gmail.com',
      name: 'Akhil.A (Lead Engineer)',
      role: 'admin',
      passwordHash: adminHash,
      isEmailVerified: true,
      failedAttempts: 0,
      lockedUntil: null,
      totpEnabled: true,
      totpSecret: ADMIN_TOTP_SECRET,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'usr_operator_002',
      email: 'operator@cfd.local',
      name: 'Aerospace Analyst',
      role: 'user',
      passwordHash: userHash,
      isEmailVerified: true,
      failedAttempts: 0,
      lockedUntil: null,
      totpEnabled: false,
      totpSecret: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'usr_operator_003',
      email: 'operator@cfo.local',
      name: 'Aerospace Analyst (CFO Alias)',
      role: 'user',
      passwordHash: userHash,
      isEmailVerified: true,
      failedAttempts: 0,
      lockedUntil: null,
      totpEnabled: false,
      totpSecret: null,
      createdAt: new Date().toISOString(),
    },
  ];
}

// If run directly: `node seed.js`
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  const currentTotp = computeTotp(ADMIN_TOTP_SECRET);
  const remainingSecs = 30 - (Math.floor(Date.now() / 1000) % 30);

  console.log('================================================================================');
  console.log('  OpenFOAM Enterprise Platform - Preconfigured Seed Accounts & Credentials');
  console.log('  DEVELOPED by Akhil.A gmail :- akkedu01@gmail.com');
  console.log('================================================================================\n');

  console.log('1. LEAD ADMIN ACCOUNT (2FA REQUIRED):');
  console.log('   Email:             akkedu01@gmail.com');
  console.log('   Password:          AdminCFD@2026#Secure');
  console.log(`   Base32 Secret:     ${ADMIN_TOTP_SECRET}`);
  console.log(`   Current Live TOTP: ${currentTotp} (valid for ${remainingSecs}s)`);
  console.log('   Dev/Demo Bypass:   123456');
  console.log('   Authenticator URI: otpauth://totp/OpenFOAM-CFD:akkedu01@gmail.com?secret=JBSWY3DPEHPK3PXP&issuer=OpenFOAM-CFD\n');

  console.log('2. OPERATOR USER ACCOUNT (NO 2FA REQUIRED):');
  console.log('   Email:             operator@cfd.local (or operator@cfo.local)');
  console.log('   Password:          UserCFD@2026#Secure');
  console.log('   2FA Status:        Disabled (instant login, no authenticator code needed)\n');

  console.log('================================================================================');
}
