const ID_ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";

function makeId(prefix: string, length: number): string {
  let result = prefix;

  for (let index = 0; index < length; index += 1) {
    const randomIndex = Math.floor(Math.random() * ID_ALPHABET.length);
    result += ID_ALPHABET[randomIndex];
  }

  return result;
}

export function generateSessionId(): string {
  return makeId("cs_", 12);
}

export function generateAttemptId(): string {
  return makeId("pa_", 12);
}
