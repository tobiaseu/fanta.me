const pad = (n: number) => String(n).padStart(2, '0');

/** Countdown Sprint: "38:24:10" (ore totali, non giorni). */
export function formatCountdown(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

/** Countdown compatto per le card: "38h 24m". */
export function formatHoursLeft(ms: number) {
  const totalMin = Math.max(0, Math.floor(ms / 60_000));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return h > 0 ? `${h}h ${pad(m)}m` : `${m}m`;
}

/** Tempo relativo stile cronaca: "6 min fa". */
export function timeAgo(iso: string, now = Date.now()) {
  const min = Math.round((now - new Date(iso).getTime()) / 60_000);
  if (min < 1) return 'adesso';
  if (min < 60) return `${min} min fa`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h} h fa`;
  return `${Math.round(h / 24)} g fa`;
}
