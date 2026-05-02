import { JobOffer, ScanFilter } from "../types";
import { matchesFilter } from "./filterUtils";

/**
 * Greenhouse Tool
 *
 * Queries the Greenhouse job board API for open positions at pre-configured
 * companies and returns raw job offer objects.
 *
 * Docs: https://developers.greenhouse.io/job-board.html
 */
export class GreenhouseTool {
  private readonly apiKey: string;

  constructor(apiKey: string = process.env.GREENHOUSE_API_KEY ?? "") {
    this.apiKey = apiKey;
  }

  /**
   * Fetch open positions for a given company board token.
   *
   * @param boardToken  Greenhouse board token (e.g. "stripe", "vercel")
   * @param filter      Optional keyword / location filter
   */
  async fetchJobs(
    boardToken: string,
    filter?: ScanFilter
  ): Promise<JobOffer[]> {
    const url = `https://boards-api.greenhouse.io/v1/boards/${boardToken}/jobs?content=true`;

    const response = await fetch(url, {
      headers: this.apiKey ? { Authorization: `Basic ${btoa(this.apiKey + ":")}` } : {},
    });

    if (!response.ok) {
      throw new Error(
        `Greenhouse API error for board "${boardToken}": ${response.status} ${response.statusText}`
      );
    }

    const data = (await response.json()) as { jobs: Array<Record<string, unknown>> };

    return data.jobs
      .map((job): JobOffer => ({
        id: `greenhouse-${job["id"]}`,
        title: String(job["title"] ?? ""),
        company: boardToken,
        portal: "greenhouse",
        url: String(job["absolute_url"] ?? ""),
        postedAt: job["updated_at"] ? String(job["updated_at"]) : undefined,
        description: String((job["content"] as string | undefined) ?? ""),
        location: (job["location"] as { name?: string } | undefined)?.name,
        remote: undefined,
      }))
      .filter((offer) => matchesFilter(offer, filter));
  }
}


