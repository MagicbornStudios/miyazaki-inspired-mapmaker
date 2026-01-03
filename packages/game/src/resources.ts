import type { ResourcePool } from './types.js';

export function canAfford(cost: number, pool: ResourcePool): boolean {
  return pool.current >= cost;
}

export function spend(cost: number, pool: ResourcePool): ResourcePool {
  const next = Math.max(0, pool.current - cost);
  return { ...pool, current: next };
}

export function gain(amount: number, pool: ResourcePool): ResourcePool {
  const next = Math.min(pool.max, pool.current + amount);
  return { ...pool, current: next };
}
