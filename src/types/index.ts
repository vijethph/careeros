import { z } from "zod";

// ---------------------------------------------------------------------------
// Job offer
// ---------------------------------------------------------------------------

export const JobOfferSchema = z.object({
  id: z.string(),
  title: z.string(),
  company: z.string(),
  portal: z.enum(["greenhouse", "ashby", "lever", "other"]),
  url: z.string().url(),
  postedAt: z.string().datetime().optional(),
  description: z.string(),
  location: z.string().optional(),
  remote: z.boolean().optional(),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  currency: z.string().optional(),
});

export type JobOffer = z.infer<typeof JobOfferSchema>;

// ---------------------------------------------------------------------------
// Evaluation result (A–G scoring)
// ---------------------------------------------------------------------------

export const ScoreBlockSchema = z.object({
  score: z.number().min(0).max(5),
  summary: z.string(),
});

export const EvaluationResultSchema = z.object({
  offerId: z.string(),
  /** A — Role Fit */
  roleFit: ScoreBlockSchema,
  /** B — Company Quality */
  companyQuality: ScoreBlockSchema,
  /** C — Compensation */
  compensation: ScoreBlockSchema,
  /** D — Location & Flexibility */
  locationFlexibility: ScoreBlockSchema,
  /** E — Growth */
  growth: ScoreBlockSchema,
  /** F — Red Flags */
  redFlags: ScoreBlockSchema,
  /** G — Posting Legitimacy */
  legitimacy: ScoreBlockSchema,
  /** Weighted overall score 0–5 */
  overallScore: z.number().min(0).max(5),
  verdict: z.string(),
  reasonsToApply: z.array(z.string()),
  reasonsToSkip: z.array(z.string()),
});

export type EvaluationResult = z.infer<typeof EvaluationResultSchema>;

// ---------------------------------------------------------------------------
// CV generation
// ---------------------------------------------------------------------------

export type CVOutputFormat = "html" | "latex" | "markdown";

export const CVRequestSchema = z.object({
  offer: JobOfferSchema,
  evaluation: EvaluationResultSchema,
  masterCVPath: z.string(),
  outputFormat: z.enum(["html", "latex", "markdown"]).default("html"),
});

export type CVRequest = z.infer<typeof CVRequestSchema>;

export const CVResultSchema = z.object({
  offerId: z.string(),
  format: z.enum(["html", "latex", "markdown"]),
  content: z.string(),
});

export type CVResult = z.infer<typeof CVResultSchema>;

// ---------------------------------------------------------------------------
// Scan filter — used to narrow portal queries to target roles
// ---------------------------------------------------------------------------

export const ScanFilterSchema = z.object({
  keywords: z.array(z.string()).default([]),
  excludeKeywords: z.array(z.string()).default([]),
  locations: z.array(z.string()).default([]),
  remoteOnly: z.boolean().default(false),
});

export type ScanFilter = z.infer<typeof ScanFilterSchema>;
