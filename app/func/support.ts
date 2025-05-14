import { supports } from "../data/supports";

export function getSupportBySessionId(sessionId: string) {
  // Convert sessionId to lowercase
  const firstLetter = sessionId.toLowerCase().charAt(0);
  const index = (firstLetter.charCodeAt(0) - 97) % supports.length;
  return supports[index];
}
