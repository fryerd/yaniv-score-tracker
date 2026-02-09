// Characters that avoid confusable pairs (0/O, 1/l/I)
export const SHARE_CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz';

export function generateShareToken(): string {
  let token = '';
  for (let i = 0; i < 8; i++) {
    token += SHARE_CHARS[Math.floor(Math.random() * SHARE_CHARS.length)];
  }
  return token;
}
