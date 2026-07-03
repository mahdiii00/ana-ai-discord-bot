export function messageIsCommand(content, prefix) {
  return content.startsWith(prefix);
}
