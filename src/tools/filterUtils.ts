import { JobOffer, ScanFilter } from "../types";

/**
 * Returns `true` if the given offer satisfies the optional scan filter.
 * Shared across all portal tool implementations.
 */
export function matchesFilter(offer: JobOffer, filter?: ScanFilter): boolean {
  if (!filter) return true;

  if (filter.remoteOnly && offer.remote === false) return false;

  const titleLower = offer.title.toLowerCase();
  const descLower = offer.description.toLowerCase();

  if (filter.keywords.length > 0) {
    const hasKeyword = filter.keywords.some(
      (kw) =>
        titleLower.includes(kw.toLowerCase()) ||
        descLower.includes(kw.toLowerCase())
    );
    if (!hasKeyword) return false;
  }

  if (filter.excludeKeywords.length > 0) {
    const hasExcluded = filter.excludeKeywords.some(
      (kw) =>
        titleLower.includes(kw.toLowerCase()) ||
        descLower.includes(kw.toLowerCase())
    );
    if (hasExcluded) return false;
  }

  if (filter.locations.length > 0 && offer.location) {
    const locationLower = offer.location.toLowerCase();
    const locationMatch = filter.locations.some((loc) =>
      locationLower.includes(loc.toLowerCase())
    );
    if (!locationMatch && !filter.remoteOnly) return false;
  }

  return true;
}
