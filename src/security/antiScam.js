const SCAM_PATTERNS = [
  /discord\s*\.\s*(gift|give|nitro|steam|free)/i,
  /free\s*steam\s*gift/i,
  /steamcommunity\.com\/gift/i,
  /nitro\s*-\s*free/i,
  /you\s*won\s*a\s*prize/i,
  /click\s*here\s*for\s*free/i,
  /claim\s*your\s* nitro/i,
  /discord-nitro\.\w+/i,
  /gift\s*\.\s*nitro/i,
  /airdrop/i,
  /wallet\s*connect/i,
  /verify\s*:\s*https?:\/\//i,
  /login\s*:\s*https?:\/\//i,
];

export function checkScam(content) {
  for (const pattern of SCAM_PATTERNS) {
    if (pattern.test(content)) {
      return { blocked: true, pattern: pattern.toString() };
    }
  }
  return { blocked: false };
}
