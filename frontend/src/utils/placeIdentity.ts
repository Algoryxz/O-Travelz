import type { PlaceDetail } from '../api/contracts';

const HUB_ALIASES: Record<string, string[]> = {
  bhubaneswar: ['lingaraj temple', 'master canteen', 'bhubaneswar', 'bbsr'],
  puri: ['puri golden beach', 'jagannath temple', 'puri'],
  konark: ['konark sun temple', 'chandrabhaga beach', 'konark'],
  chilika: ['chilika lake', 'satapada', 'chilika'],
  cuttack: ['barabati fort', 'cuttack'],
  sambalpur: ['samaleswari temple', 'hirakud dam', 'sambalpur'],
  rourkela: ['hanuman vatika', 'rourkela'],
  koraput: ['gupteswar cave', 'deomali', 'koraput'],
  gopalpur: ['gopalpur-on-sea beach', 'gopalpur', 'berhampur'],
  ganjam: ['tara tarini', 'tampara lake', 'gopalpur'],
};

/**
 * Centrally resolves a place from the canonical list using an exact ID,
 * research_id, exact name, or recognized regional alias.
 */
export function resolveCanonicalPlace(
  places: PlaceDetail[],
  rawIdentifier: string | null | undefined
): PlaceDetail | null {
  if (!rawIdentifier || !Array.isArray(places) || places.length === 0) {
    return null;
  }

  const query = rawIdentifier.trim();
  if (!query) return null;

  // 1. Exact ID match (database_id / uuid)
  const byId = places.find((p) => p.id === query);
  if (byId) return byId;

  // 2. Exact research_id match
  const byResearchId = places.find((p) => (p as any).research_id === query);
  if (byResearchId) return byResearchId;

  // 3. Exact case-insensitive name match
  const lowerQuery = query.toLowerCase();
  const byExactName = places.find((p) => p.name.trim().toLowerCase() === lowerQuery);
  if (byExactName) return byExactName;

  // 4. Hub / Regional Alias resolution
  for (const [hubKey, targetKeywords] of Object.entries(HUB_ALIASES)) {
    if (lowerQuery === hubKey || targetKeywords.some((k) => lowerQuery.includes(k))) {
      for (const targetKw of targetKeywords) {
        const aliasMatch = places.find((p) => p.name.toLowerCase().includes(targetKw));
        if (aliasMatch) return aliasMatch;
      }
    }
  }

  // 5. Unique substring matching (longer matches first)
  const substringMatches = places.filter((p) => {
    const pName = p.name.toLowerCase();
    return pName.includes(lowerQuery) || lowerQuery.includes(pName);
  });

  if (substringMatches.length === 1) {
    return substringMatches[0];
  }

  if (substringMatches.length > 1) {
    // Prefer match that starts with the query, or has valid coordinates
    const prefixMatch = substringMatches.find((p) =>
      p.name.toLowerCase().startsWith(lowerQuery)
    );
    if (prefixMatch) return prefixMatch;

    return substringMatches[0];
  }

  return null;
}

/**
 * Returns canonical identifier for a place.
 */
export function getCanonicalPlaceId(place: PlaceDetail | null | undefined): string | null {
  if (!place) return null;
  return place.id || (place as any).research_id || null;
}

/**
 * Compares two places for canonical equality across IDs, research_ids, and exact names.
 */
export function isSamePlace(
  placeA: PlaceDetail | null | undefined,
  placeB: PlaceDetail | null | undefined
): boolean {
  if (!placeA || !placeB) return false;
  if (placeA.id && placeB.id && placeA.id === placeB.id) return true;
  if (
    (placeA as any).research_id &&
    (placeB as any).research_id &&
    (placeA as any).research_id === (placeB as any).research_id
  ) {
    return true;
  }
  return placeA.name.trim().toLowerCase() === placeB.name.trim().toLowerCase();
}
