import { JobOffer, EvaluationResult, ScoreBlockSchema } from "../types";

// ---------------------------------------------------------------------------
// Scoring weights (must sum to 1.0)
// ---------------------------------------------------------------------------

const WEIGHTS = {
  roleFit: 0.25,
  companyQuality: 0.15,
  compensation: 0.20,
  locationFlexibility: 0.10,
  growth: 0.10,
  redFlags: 0.10,
  legitimacy: 0.10,
} as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CandidateProfile {
  /** Plain-text summary of the candidate's experience */
  summary: string;
  /** Target job titles */
  targetTitles: string[];
  /** Target seniority levels */
  seniority: string[];
  /** Desired salary range (annual, gross) */
  salaryTargetMin?: number;
  salaryTargetMax?: number;
  /** Preferred locations or "remote" */
  preferredLocations?: string[];
}

export interface EvaluationAgentConfig {
  profile: CandidateProfile;
  /**
   * AI provider to use for evaluation.
   * In a full Lua AI deployment this maps to a registered provider.
   * For the starter skeleton this field is informational.
   */
  aiProvider?: "anthropic" | "openai" | "gemini";
}

// ---------------------------------------------------------------------------
// EvaluationAgent
// ---------------------------------------------------------------------------

/**
 * EvaluationAgent
 *
 * Scores a job offer across six blocks (A–G) and produces a structured
 * verdict ready for downstream decision-making or notification.
 *
 * The starter implementation uses heuristic rules.  In production, replace the
 * `_scoreBlock` stubs with calls to your preferred LLM via the Lua AI SDK.
 */
export class EvaluationAgent {
  private readonly config: EvaluationAgentConfig;

  constructor(config: EvaluationAgentConfig) {
    this.config = config;
  }

  /**
   * Evaluate a single job offer and return a structured result.
   */
  async evaluate(offer: JobOffer): Promise<EvaluationResult> {
    const [
      roleFit,
      companyQuality,
      compensation,
      locationFlexibility,
      growth,
      redFlags,
      legitimacy,
    ] = await Promise.all([
      this._scoreRoleFit(offer),
      this._scoreCompanyQuality(offer),
      this._scoreCompensation(offer),
      this._scoreLocationFlexibility(offer),
      this._scoreGrowth(offer),
      this._scoreRedFlags(offer),
      this._scoreLegitimacy(offer),
    ]);

    const overallScore =
      roleFit.score * WEIGHTS.roleFit +
      companyQuality.score * WEIGHTS.companyQuality +
      compensation.score * WEIGHTS.compensation +
      locationFlexibility.score * WEIGHTS.locationFlexibility +
      growth.score * WEIGHTS.growth +
      // Red flags invert: a high red-flag score lowers the overall
      (5 - redFlags.score) * WEIGHTS.redFlags +
      legitimacy.score * WEIGHTS.legitimacy;

    const rounded = Math.round(overallScore * 10) / 10;

    const verdict = this._buildVerdict(rounded, offer);
    const reasonsToApply = this._buildReasonsToApply(
      roleFit,
      companyQuality,
      compensation,
      growth,
      legitimacy
    );
    const reasonsToSkip = this._buildReasonsToSkip(
      redFlags,
      compensation,
      locationFlexibility
    );

    return {
      offerId: offer.id,
      roleFit,
      companyQuality,
      compensation,
      locationFlexibility,
      growth,
      redFlags,
      legitimacy,
      overallScore: rounded,
      verdict,
      reasonsToApply,
      reasonsToSkip,
    };
  }

  // --------------------------------------------------------------------------
  // Scoring blocks (heuristic stubs — replace with LLM calls in production)
  // --------------------------------------------------------------------------

  private async _scoreRoleFit(offer: JobOffer) {
    const { targetTitles, seniority } = this.config.profile;
    const titleLower = offer.title.toLowerCase();
    const descLower = offer.description.toLowerCase();

    let score = 2.5;
    if (targetTitles.some((t) => titleLower.includes(t.toLowerCase()))) score += 1.5;
    const seniorityMatch = seniority.some(
      (s) =>
        titleLower.includes(s.toLowerCase()) ||
        descLower.includes(s.toLowerCase())
    );
    if (seniorityMatch) score += 0.5;
    score = Math.min(5, score);

    return ScoreBlockSchema.parse({
      score,
      summary: `Title "${offer.title}" ${
        score >= 4 ? "closely" : "partially"
      } matches your target roles.`,
    });
  }

  private async _scoreCompanyQuality(offer: JobOffer) {
    // Starter heuristic: medium score; upgrade with company data enrichment
    return ScoreBlockSchema.parse({
      score: 3,
      summary: `Company "${offer.company}" quality assessment requires further research.`,
    });
  }

  private async _scoreCompensation(offer: JobOffer) {
    const { salaryTargetMin, salaryTargetMax } = this.config.profile;

    if (offer.salaryMin === undefined && offer.salaryMax === undefined) {
      return ScoreBlockSchema.parse({
        score: 2.5,
        summary: "No salary information available in the posting.",
      });
    }

    const midOffered = ((offer.salaryMin ?? 0) + (offer.salaryMax ?? offer.salaryMin ?? 0)) / 2;
    const midTarget = ((salaryTargetMin ?? 0) + (salaryTargetMax ?? salaryTargetMin ?? 0)) / 2;

    const ratio = midTarget > 0 ? midOffered / midTarget : 1;
    const score = Math.min(5, Math.max(0, ratio * 3.5));

    return ScoreBlockSchema.parse({
      score: Math.round(score * 10) / 10,
      summary: `Offered mid-range ${midOffered} vs your target ${midTarget}.`,
    });
  }

  private async _scoreLocationFlexibility(offer: JobOffer) {
    const { preferredLocations } = this.config.profile;

    if (offer.remote === true) {
      return ScoreBlockSchema.parse({ score: 5, summary: "Role is fully remote." });
    }

    if (preferredLocations && offer.location) {
      const locationLower = offer.location.toLowerCase();
      const matches = preferredLocations.some((l) =>
        locationLower.includes(l.toLowerCase())
      );
      return ScoreBlockSchema.parse({
        score: matches ? 4 : 2,
        summary: matches
          ? `Location "${offer.location}" matches your preferences.`
          : `Location "${offer.location}" does not match your preferred locations.`,
      });
    }

    return ScoreBlockSchema.parse({
      score: 3,
      summary: "Location flexibility not specified in the posting.",
    });
  }

  private async _scoreGrowth(offer: JobOffer) {
    const growthKeywords = ["senior", "lead", "architect", "principal", "staff", "growth", "learning", "mentor"];
    const descLower = offer.description.toLowerCase();
    const matches = growthKeywords.filter((kw) => descLower.includes(kw)).length;
    const score = Math.min(5, 2.5 + matches * 0.4);

    return ScoreBlockSchema.parse({
      score: Math.round(score * 10) / 10,
      summary: `Description contains ${matches} growth-related signal(s).`,
    });
  }

  private async _scoreRedFlags(offer: JobOffer) {
    const redFlagKeywords = [
      "rockstar",
      "ninja",
      "unlimited pto",
      "fast-paced",
      "wear many hats",
      "work hard play hard",
      "unpaid",
      "equity only",
      "passion",
    ];
    const descLower = offer.description.toLowerCase();
    const matches = redFlagKeywords.filter((kw) => descLower.includes(kw)).length;
    const score = Math.min(5, matches * 1.5);

    return ScoreBlockSchema.parse({
      score: Math.round(score * 10) / 10,
      summary:
        matches === 0
          ? "No red-flag language detected."
          : `Detected ${matches} red-flag phrase(s): review carefully.`,
    });
  }

  private async _scoreLegitimacy(offer: JobOffer) {
    const hasDescription = offer.description.length > 200;
    const hasUrl = offer.url.startsWith("https://");
    const hasPostedAt = Boolean(offer.postedAt);

    const score = (hasDescription ? 2 : 0) + (hasUrl ? 1.5 : 0) + (hasPostedAt ? 1.5 : 0);

    return ScoreBlockSchema.parse({
      score: Math.min(5, score),
      summary: `Posting ${hasDescription ? "has" : "lacks"} a full description, ${
        hasUrl ? "uses HTTPS" : "non-HTTPS URL"
      }, and ${hasPostedAt ? "includes" : "is missing"} a publish date.`,
    });
  }

  // --------------------------------------------------------------------------
  // Verdict & reason builders
  // --------------------------------------------------------------------------

  private _buildVerdict(score: number, offer: JobOffer): string {
    if (score >= 4) {
      return `Strong match (${score}/5) — "${offer.title}" at ${offer.company} aligns well with your profile. Recommend applying.`;
    }
    if (score >= 3) {
      return `Moderate match (${score}/5) — "${offer.title}" at ${offer.company} has some gaps. Consider applying if pipeline is light.`;
    }
    return `Weak match (${score}/5) — "${offer.title}" at ${offer.company} does not meet most of your criteria. Likely skip.`;
  }

  private _buildReasonsToApply(
    roleFit: { score: number },
    companyQuality: { score: number },
    compensation: { score: number },
    growth: { score: number },
    legitimacy: { score: number }
  ): string[] {
    const reasons: string[] = [];
    if (roleFit.score >= 4) reasons.push("Role title and seniority match your target profile.");
    if (companyQuality.score >= 4) reasons.push("Company shows strong quality signals.");
    if (compensation.score >= 4) reasons.push("Compensation is at or above your target range.");
    if (growth.score >= 4) reasons.push("High growth and learning opportunity signals.");
    if (legitimacy.score >= 4) reasons.push("Posting appears legitimate and well-structured.");
    return reasons;
  }

  private _buildReasonsToSkip(
    redFlags: { score: number },
    compensation: { score: number },
    locationFlexibility: { score: number }
  ): string[] {
    const reasons: string[] = [];
    if (redFlags.score >= 3) reasons.push("Multiple red-flag phrases detected in description.");
    if (compensation.score < 2) reasons.push("Compensation appears to be below your target.");
    if (locationFlexibility.score < 2) reasons.push("Location does not match your preferences.");
    return reasons;
  }
}
