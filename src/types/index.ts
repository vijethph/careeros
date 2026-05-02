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

export const ParsedCvBasicsSchema = z.object({
  fullName: z.string(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  headline: z.string().optional(),
  summary: z.string().optional(),
  links: z
    .array(
      z.object({
        type: z.enum(["linkedin", "github", "portfolio", "website", "other"]),
        label: z.string(),
        url: z.string().url(),
      }),
    )
    .optional(),
});

export type ParsedCvBasics = z.infer<typeof ParsedCvBasicsSchema>;

export const ParsedCvExperienceItemSchema = z.object({
  id: z.string(),
  company: z.string(),
  title: z.string(),
  location: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.union([z.string(), z.literal("Present")]).optional(),
  description: z.string().optional(),
  bulletPoints: z.array(z.string()).optional(),
  technologies: z.array(z.string()).optional(),
});

export type ParsedCvExperienceItem = z.infer<
  typeof ParsedCvExperienceItemSchema
>;

export const ParsedCvEducationItemSchema = z.object({
  id: z.string(),
  institution: z.string(),
  degree: z.string().optional(),
  fieldOfStudy: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  grade: z.string().optional(),
});

export type ParsedCvEducationItem = z.infer<typeof ParsedCvEducationItemSchema>;

export const ParsedCvProjectItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  technologies: z.array(z.string()).optional(),
  link: z.string().optional(),
});

export type ParsedCvProjectItem = z.infer<typeof ParsedCvProjectItemSchema>;

export const ParsedCvSchema = z.object({
  basics: ParsedCvBasicsSchema,
  skillsRaw: z.array(z.string()),
  experience: z.array(ParsedCvExperienceItemSchema),
  education: z.array(ParsedCvEducationItemSchema),
  projects: z.array(ParsedCvProjectItemSchema),
  certifications: z.array(z.string()).optional(),
  lastParsedAt: z.string(),
  sourcePath: z.string().optional(),
});

export type ParsedCv = z.infer<typeof ParsedCvSchema>;

export const SkillTypeSchema = z.enum([
  "language",
  "framework",
  "tool",
  "domain",
  "soft",
]);

export type SkillType = z.infer<typeof SkillTypeSchema>;

export const SkillSchema = z.object({
  id: z.string(),
  name: z.string(),
  normalizedName: z.string(),
  type: SkillTypeSchema,
  proficiency: z
    .enum(["beginner", "intermediate", "advanced", "expert"])
    .optional(),
  lastUsedYear: z.number().optional(),
  yearsOfExperience: z.number().optional(),
  source: z.enum(["cv", "manual", "inferred"]),
  tags: z.array(z.string()).optional(),
});

export type Skill = z.infer<typeof SkillSchema>;

export const ProofPointSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  metrics: z.string().optional(),
  tags: z.array(z.string()),
});

export type ProofPoint = z.infer<typeof ProofPointSchema>;

export const UserProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  location: z.string(),
  targetRoles: z.array(z.string()),
  targetLevels: z.array(z.string()),
  targetLocations: z.array(z.string()),
  salaryRange: z
    .object({
      currency: z.string(),
      min: z.number(),
      max: z.number(),
    })
    .optional(),
  keywords: z.array(z.string()),
  narrative: z.string(),
  proofPoints: z.array(ProofPointSchema),
  cvMarkdownPath: z.string(),
  parsedCv: ParsedCvSchema.optional(),
  skills: z.array(SkillSchema).optional(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

export const ProfileFeaturesSchema = z.object({
  profileId: z.string(),
  seniorityLevel: z.enum([
    "junior",
    "mid",
    "senior",
    "staff",
    "principal",
    "exec",
  ]),
  primaryRole: z.string(),
  totalYoe: z.number().optional(),
  currentLocation: z.string(),
  remotePreference: z
    .enum(["onsite", "hybrid", "remote", "flexible"])
    .optional(),
  skillNames: z.array(z.string()),
  coreStacks: z.array(z.string()),
  salaryRange: z
    .object({
      currency: z.string(),
      min: z.number(),
      max: z.number(),
    })
    .optional(),
});

export type ProfileFeatures = z.infer<typeof ProfileFeaturesSchema>;
