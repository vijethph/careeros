import { JobOffer, ScanFilter } from "../types";
import { GreenhouseTool } from "../tools/GreenhouseTool";
import { AshbyTool } from "../tools/AshbyTool";
import { LeverTool } from "../tools/LeverTool";
import { DeduplicateTool } from "../tools/DeduplicateTool";

/**
 * Portal companies pre-configured across Greenhouse, Ashby, and Lever.
 * Extend this list to match your own target companies.
 */
const GREENHOUSE_BOARDS: string[] = [
  "stripe",
  "vercel",
  "linear",
  "figma",
  "notion",
  "retool",
  "planetscale",
  "clerk",
];

const ASHBY_ORGS: string[] = [
  "loom",
  "coda",
  "mercury",
  "brex",
  "rippling",
];

const LEVER_SITES: string[] = [
  "netflix",
  "reddit",
  "coinbase",
  "plaid",
  "segment",
];

// ---------------------------------------------------------------------------
// ScanAgent config
// ---------------------------------------------------------------------------

export interface ScanAgentConfig {
  /** Keyword / location filter applied to all portals */
  filter?: ScanFilter;
  /** IDs already seen in previous runs — used for deduplication */
  previouslySeenIds?: string[];
  /** Override the default company lists */
  greenhouseBoards?: string[];
  ashbyOrgs?: string[];
  leverSites?: string[];
}

export interface ScanResult {
  newOffers: JobOffer[];
  /** Updated seen-ID list to persist for the next run */
  seenIds: string[];
  scannedAt: string;
}

// ---------------------------------------------------------------------------
// ScanAgent
// ---------------------------------------------------------------------------

/**
 * ScanAgent
 *
 * Queries Greenhouse, Ashby, and Lever for open positions that match the
 * configured filter, deduplicates against previous runs, and returns only
 * fresh offers ready for evaluation.
 *
 * Schedule example (Lua AI cron):
 * ```typescript
 * export const scanAgent = new LuaAgent({
 *   name: "portal-scanner",
 *   schedule: "0 9 *\/3 * *", // 9 am every 3 days
 *   handler: () => new ScanAgent().run(),
 * });
 * ```
 */
export class ScanAgent {
  private readonly config: Required<ScanAgentConfig>;
  private readonly greenhouse: GreenhouseTool;
  private readonly ashby: AshbyTool;
  private readonly lever: LeverTool;
  private readonly deduplicate: DeduplicateTool;

  constructor(config: ScanAgentConfig = {}) {
    this.config = {
      filter: config.filter ?? { keywords: [], excludeKeywords: [], locations: [], remoteOnly: false },
      previouslySeenIds: config.previouslySeenIds ?? [],
      greenhouseBoards: config.greenhouseBoards ?? GREENHOUSE_BOARDS,
      ashbyOrgs: config.ashbyOrgs ?? ASHBY_ORGS,
      leverSites: config.leverSites ?? LEVER_SITES,
    };

    this.greenhouse = new GreenhouseTool();
    this.ashby = new AshbyTool();
    this.lever = new LeverTool();
    this.deduplicate = new DeduplicateTool(this.config.previouslySeenIds);
  }

  /**
   * Run a full scan across all configured portals and return fresh offers.
   */
  async run(): Promise<ScanResult> {
    const allOffers: JobOffer[] = [];

    // --- Greenhouse ---
    const greenhouseResults = await Promise.allSettled(
      this.config.greenhouseBoards.map((board) =>
        this.greenhouse.fetchJobs(board, this.config.filter)
      )
    );
    for (const result of greenhouseResults) {
      if (result.status === "fulfilled") {
        allOffers.push(...result.value);
      } else {
        console.warn("[ScanAgent] Greenhouse error:", result.reason);
      }
    }

    // --- Ashby ---
    const ashbyResults = await Promise.allSettled(
      this.config.ashbyOrgs.map((org) =>
        this.ashby.fetchJobs(org, this.config.filter)
      )
    );
    for (const result of ashbyResults) {
      if (result.status === "fulfilled") {
        allOffers.push(...result.value);
      } else {
        console.warn("[ScanAgent] Ashby error:", result.reason);
      }
    }

    // --- Lever ---
    const leverResults = await Promise.allSettled(
      this.config.leverSites.map((site) =>
        this.lever.fetchJobs(site, this.config.filter)
      )
    );
    for (const result of leverResults) {
      if (result.status === "fulfilled") {
        allOffers.push(...result.value);
      } else {
        console.warn("[ScanAgent] Lever error:", result.reason);
      }
    }

    const newOffers = this.deduplicate.deduplicate(allOffers);

    console.log(
      `[ScanAgent] Scanned ${allOffers.length} total offers, ${newOffers.length} are new.`
    );

    return {
      newOffers,
      seenIds: this.deduplicate.getSeenIds(),
      scannedAt: new Date().toISOString(),
    };
  }
}
