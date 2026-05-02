import { JobOffer, ScanFilter } from "../types";
import { matchesFilter } from "./filterUtils";

/**
 * Lever Tool
 *
 * Queries the Lever Posting API for open positions.
 *
 * Docs: https://hire.lever.co/developer/postings
 */
export class LeverTool {
  constructor() {}

  /**
   * Fetch open positions for a given Lever site (company slug).
   *
   * @param site    Company slug used in the Lever posting URL (e.g. "netflix")
   * @param filter  Optional keyword / location filter
   */
  async fetchJobs(site: string, filter?: ScanFilter): Promise<JobOffer[]> {
    const url = `https://api.lever.co/v0/postings/${site}?mode=json`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Lever API error for site "${site}": ${response.status} ${response.statusText}`
      );
    }

    const data = (await response.json()) as Array<Record<string, unknown>>;

    return data
      .map((job): JobOffer => {
        const categories = job["categories"] as Record<string, string> | undefined;

        return {
          id: `lever-${job["id"]}`,
          title: String(job["text"] ?? ""),
          company: site,
          portal: "lever",
          url: String(job["hostedUrl"] ?? job["applyUrl"] ?? ""),
          postedAt: job["createdAt"]
            ? new Date(Number(job["createdAt"])).toISOString()
            : undefined,
          description: String(
            (job["descriptionPlain"] as string | undefined) ??
              (job["description"] as string | undefined) ??
              ""
          ),
          location: categories?.["location"],
          remote:
            categories?.["commitment"]?.toLowerCase().includes("remote") ?? undefined,
        };
      })
      .filter((offer) => matchesFilter(offer, filter));
  }
}


