import type { StatusState } from './types.js';

export function tickStatuses(statuses: StatusState[]): StatusState[] {
  return statuses
    .map((status) => ({ ...status, duration: status.duration - 1 }))
    .filter((status) => status.duration > 0);
}

export function hasStatusWithTag(statuses: StatusState[], tag: string): boolean {
  return statuses.some((status) => status.tags?.includes(tag));
}

export function applyStatus(statuses: StatusState[], status: StatusState): StatusState[] {
  return [...statuses, { ...status }];
}

export function cleanseByTag(statuses: StatusState[], tag: string, limit = Infinity): StatusState[] {
  let remaining = limit;
  return statuses.filter((status) => {
    if (!status.tags?.includes(tag)) {
      return true;
    }
    if (remaining > 0) {
      remaining -= 1;
      return false;
    }
    return true;
  });
}
