import { JobOffer, ScanFilter } from "../types";
import { matchesFilter } from "./filterUtils";

/**
 * Ashby Tool
 *
 * Queries the Ashby job board API for open positions.
 *
 * Docs: https://developers.ashbyhq.com/reference/jobboardpostinglist
 */
export class AshbyTool {
  private readonly apiKey: string;

  constructor(apiKey: string = process.env.ASHBY_API_KEY ?? "") {
    this.apiKey = apiKey;
  }

  /**
   * Fetch open positions for a given Ashby organization.
   *
   * @param organizationHostedJobsPageName  The org slug used in the Ashby job board URL
   * @param filter                          Optional keyword / location filter
   */
  async fetchJobs(
    organizationHostedJobsPageName: string,
    filter?: ScanFilter
  ): Promise<JobOffer[]> {
    const response = await fetch("https://api.ashbyhq.com/posting-api/job-board", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(this.apiKey ? { Authorization: `Basic ${btoa(this.apiKey + ":")}` } : {}),
      },
      body: JSON.stringify({ organizationHostedJobsPageName }),
    });

    if (!response.ok) {
      throw new Error(
        `Ashby API error for org "${organizationHostedJobsPageName}": ${response.status} ${response.statusText}`
      );
    }

    const data = (await response.json()) as {
      results?: Array<Record<string, unknown>>;
    };

    return (data.results ?? [])
      .map((job): JobOffer => ({
        id: `ashby-${job["id"]}`,
        title: String(job["title"] ?? ""),
        company: organizationHostedJobsPageName,
        portal: "ashby",
        url: String(job["jobUrl"] ?? ""),
        postedAt: job["publishedDate"] ? String(job["publishedDate"]) : undefined,
        description: String(job["descriptionHtml"] ?? job["descriptionPlain"] ?? ""),
        location: String(job["locationName"] ?? ""),
        remote: Boolean(job["isRemote"]),
      }))
      .filter((offer) => matchesFilter(offer, filter));
  }
}


