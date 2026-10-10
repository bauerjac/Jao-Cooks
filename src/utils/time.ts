export function formatTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch {
    return '--:--';
  }
}

export function formatDateTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '--/--';
  }
}

export function getElapsedMinutes(isoString: string, endIsoString?: string): number {
  try {
    const start = new Date(isoString).getTime();
    const end = endIsoString ? new Date(endIsoString).getTime() : Date.now();
    return Math.max(0, Math.floor((end - start) / 60000));
  } catch {
    return 0;
  }
}

export function formatElapsedDuration(isoString: string, endIsoString?: string): string {
  try {
    const start = new Date(isoString).getTime();
    const end = endIsoString ? new Date(endIsoString).getTime() : Date.now();
    const diffSeconds = Math.max(0, Math.floor((end - start) / 1000));

    const minutes = Math.floor(diffSeconds / 60);
    const seconds = diffSeconds % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(minutes)}:${pad(seconds)}`;
  } catch {
    return '00:00';
  }
}

export type UrgencyLevel = 'normal' | 'warning' | 'urgent';

export function getUrgencyLevel(isoString: string): UrgencyLevel {
  const mins = getElapsedMinutes(isoString);
  if (mins >= 15) return 'urgent';
  if (mins >= 8) return 'warning';
  return 'normal';
}
