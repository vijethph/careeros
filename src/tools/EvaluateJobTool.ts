import { LuaTool } from "lua-cli";
import { z } from "zod";
import { EvaluationAgent, CandidateProfile } from "../agents/evaluationAgent";
import {
  EvaluationResult,
  JobOffer,
  JobOfferSchema,
  ProfileFeatures,
  Skill,
  UserProfile,
} from "../types";
import { buildProfileFeatures, getUserState } from "./profileUtils";

export class EvaluateJobTool implements LuaTool {
  name = "evaluate_job";
  description =
    "Evaluate a job offer with A–G scoring using the current profile.";

  inputSchema = z.object({
    offer: JobOfferSchema,
  });

  async execute(input: z.infer<typeof this.inputSchema>): Promise<{
    evaluation: EvaluationResult;
    features: ProfileFeatures;
    skills: Skill[];
    profile: UserProfile;
  }> {
    const { state } = await getUserState();
    const profile = (state.profile ?? {}) as UserProfile;
    const skills = (profile.skills ?? state.skills ?? []) as Skill[];
    const features = buildProfileFeatures(profile, skills);

    const candidateProfile: CandidateProfile = {
      summary: profile.parsedCv?.basics.summary ?? profile.narrative ?? "",
      targetTitles: profile.targetRoles ?? [],
      seniority: profile.targetLevels ?? [],
      salaryTargetMin: profile.salaryRange?.min,
      salaryTargetMax: profile.salaryRange?.max,
      preferredLocations: profile.targetLocations ?? [],
    };

    const evaluator = new EvaluationAgent({ profile: candidateProfile });
    const evaluation = await evaluator.evaluate(input.offer as JobOffer);

    return { evaluation, features, skills, profile };
  }
}
