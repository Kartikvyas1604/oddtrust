export function truncateHash(hash: string, prefixLen = 6, suffixLen = 4): string {
  if (hash.length <= prefixLen + suffixLen) return hash;
  return `${hash.slice(0, prefixLen)}...${hash.slice(-suffixLen)}`;
}

export function formatSlot(slot: number): string {
  return `#${slot.toLocaleString()}`;
}

export function formatPercent(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

export function formatTimestamp(ts: number): string {
  const d = new Date(ts);
  return d.toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
}
