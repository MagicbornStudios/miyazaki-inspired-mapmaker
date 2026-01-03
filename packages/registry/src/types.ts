export type RegistryDomain =
  | 'Card'
  | 'Asset'
  | 'VFX'
  | 'Status'
  | 'Car'
  | 'Deck'
  | 'Track'
  | 'Net';

export type RegistryEntry<TDomain extends RegistryDomain = RegistryDomain> = {
  id: number;
  key: string;
  status: 'active' | 'retired';
  notes?: string;
};

export type DomainRegistry<TDomain extends RegistryDomain = RegistryDomain> = {
  domain: TDomain;
  range: { start: number; end: number };
  entries: RegistryEntry<TDomain>[];
};

export type RegistryLookupEntry = RegistryEntry & { domain: RegistryDomain };

export type RegistryLookupTables = {
  byId: Record<number, RegistryLookupEntry>;
  byKey: Record<RegistryDomain, Record<string, number>>;
};
