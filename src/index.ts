/**
 * careeros — AI-powered job search pipeline on Lua AI
 *
 * Entry point that wires together ScanAgent → EvaluationAgent → CVAgent.
 *
 * Usage:
 *   npx ts-node src/index.ts
 *
 * In a production Lua AI deployment each agent would be registered as a
 * managed LuaAgent with a cron schedule, webhook trigger, or on-demand
 * invocation via the Lua AI dashboard.
 */

import { ScanAgent } from "./agents/scanAgent";
import { EvaluationAgent } from "./agents/evaluationAgent";
import { CVAgent } from "./agents/cvAgent";
import { JobOffer, EvaluationResult } from "./types";

// ---------------------------------------------------------------------------
// Candidate profile — edit this to match your background and preferences
// ---------------------------------------------------------------------------

const CANDIDATE_PROFILE = {
  summary: "Full-stack software engineer with 5+ years building scalable web systems.",
  targetTitles: ["software engineer", "full-stack engineer", "backend engineer"],
  seniority: ["senior", "staff", "lead"],
  salaryTargetMin: 150_000,
  salaryTargetMax: 220_000,
  preferredLocations: ["remote", "new york", "san francisco"],
};

// ---------------------------------------------------------------------------
// Pipeline
// ---------------------------------------------------------------------------

async function runPipeline(): Promise<void> {
  console.log("=== careeros pipeline starting ===\n");

  // Step 1 — Scan portals for new offers
  console.log("→ [1/3] Scanning job portals…");
  const scanAgent = new ScanAgent({
    filter: {
      keywords: CANDIDATE_PROFILE.targetTitles,
      excludeKeywords: ["intern", "contract", "part-time"],
      locations: CANDIDATE_PROFILE.preferredLocations,
      remoteOnly: false,
    },
  });

  const scanResult = await scanAgent.run();
  console.log(`   Found ${scanResult.newOffers.length} new offer(s).\n`);

  if (scanResult.newOffers.length === 0) {
    console.log("No new offers found. Pipeline complete.");
    return;
  }

  // Step 2 — Evaluate each offer
  console.log("→ [2/3] Evaluating offers…");
  const evaluationAgent = new EvaluationAgent({
    profile: CANDIDATE_PROFILE,
    aiProvider: "anthropic",
  });

  const evaluations: EvaluationResult[] = [];
  for (const offer of scanResult.newOffers) {
    const evaluation = await evaluationAgent.evaluate(offer);
    evaluations.push(evaluation);
    console.log(
      `   ${offer.title} @ ${offer.company} — score: ${evaluation.overallScore}/5`
    );
  }
  console.log();

  // Filter to only strong matches (score ≥ 3.5)
  const strongMatches = scanResult.newOffers.filter((offer) => {
    const ev = evaluations.find((e) => e.offerId === offer.id);
    return ev && ev.overallScore >= 3.5;
  });

  console.log(`   ${strongMatches.length} strong match(es) (score ≥ 3.5).\n`);

  if (strongMatches.length === 0) {
    console.log("No strong matches this scan. Pipeline complete.");
    return;
  }

  // Step 3 — Generate tailored CVs for strong matches
  console.log("→ [3/3] Generating tailored CVs…");
  const cvAgent = new CVAgent();

  for (const offer of strongMatches) {
    const evaluation = evaluations.find((e) => e.offerId === offer.id)!;

    // NOTE: Replace "master-cv.md" with the path to your actual master CV file.
    const masterCVPath = process.env.MASTER_CV_PATH ?? "master-cv.md";

    try {
      const cvResult = await cvAgent.generate({
        offer,
        evaluation,
        masterCVPath,
        outputFormat: "markdown",
      });

      console.log(
        `   CV generated for "${offer.title} @ ${offer.company}" (${cvResult.format}, ${cvResult.content.length} chars)`
      );
    } catch (err) {
      console.warn(
        `   [CVAgent] Skipped "${offer.title}" — master CV not found at "${masterCVPath}". ` +
          `Set MASTER_CV_PATH or create the file to enable CV generation.`
      );
    }
  }

  console.log("\n=== Pipeline complete ===");
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

runPipeline().catch((err) => {
  console.error("Pipeline error:", err);
  process.exit(1);
});
