// Supabase logins need an email address, but the studio uses usernames. Each
// username maps to an address on the reserved .invalid TLD (RFC 2606), which
// can never receive mail, so no real address is stored and no reset email can
// ever reach a stranger.
export const USERNAME_DOMAIN = "throwdownpottery.invalid";

const USERNAME = /^[a-z0-9][a-z0-9._-]{1,29}$/;

export const USERNAME_RULES =
  "2–30 characters: lowercase letters, numbers, dots, dashes or underscores.";

export function normalizeUsername(input: string) {
  return input.trim().toLowerCase();
}

export function isValidUsername(username: string) {
  return USERNAME.test(username);
}

export function usernameToEmail(username: string) {
  return `${username}@${USERNAME_DOMAIN}`;
}

// Accepts a username or, for accounts created before usernames, a full email.
export function loginEmail(input: string) {
  const value = input.trim();
  return value.includes("@") ? value : usernameToEmail(value.toLowerCase());
}

export function loginName(email: string) {
  const suffix = `@${USERNAME_DOMAIN}`;
  return email.toLowerCase().endsWith(suffix) ? email.slice(0, -suffix.length) : email;
}
