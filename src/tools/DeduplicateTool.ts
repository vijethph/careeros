import { JobOffer } from "../types";

/**
 * Deduplicate Tool
 *
 * Filters out job offers that have already been seen in a previous scan run.
 * Uses a persistent set of seen offer IDs backed by a simple JSON file so that
 * no database is required for the starter skeleton.
 *
 * In a production Lua AI deployment this can be replaced with a tool backed by
 * Redis, a managed KV store, or Lua AI's built-in state storage.
 */
export class DeduplicateTool {
  private readonly seenIds: Set<string>;

  constructor(previouslySeenIds: string[] = []) {
    this.seenIds = new Set(previouslySeenIds);
  }

  /**
   * Return only offers whose ID has not been seen before, and record the new
   * IDs so subsequent calls within the same session are also deduplicated.
   */
  deduplicate(offers: JobOffer[]): JobOffer[] {
    const fresh: JobOffer[] = [];

    for (const offer of offers) {
      if (!this.seenIds.has(offer.id)) {
        this.seenIds.add(offer.id);
        fresh.push(offer);
      }
    }

    return fresh;
  }

  /**
   * Return the full list of seen IDs — useful for persisting state between
   * agent runs.
   */
  getSeenIds(): string[] {
    return Array.from(this.seenIds);
  }
}
