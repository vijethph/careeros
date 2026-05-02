import { LuaTool, AI } from "lua-cli";
import { z } from "zod";

/**
 * RoleFitScoringTool
 * 
 * Evaluates Block A: Role Fit
 * - Title match with target roles
 * - Skills alignment
 * - Seniority level appropriateness
 * - Scope vs. experience match
 */
export default class RoleFitScoringTool implements LuaTool {
    name = "score_role_fit";
    description = "Score how well a job matches the candidate's skills, experience, and target roles (Block A: 0-5 scale)";
    
    inputSchema = z.object({
        jobTitle: z.string().describe("Job title"),
        jobDescription: z.string().describe("Job description with requirements"),
        candidateSkills: z.array(z.string()).describe("Candidate's skills"),
        candidateExperience: z.string().describe("Candidate's experience level"),
        targetRoles: z.array(z.string()).describe("Candidate's target job titles")
    });

    async execute(input: z.infer<typeof this.inputSchema>) {
        try {
            const score = await this.scoreRoleFit(input);
            
            return {
                blockName: "A — Role Fit",
                score: score.score,
                analysis: score.analysis,
                matchedSkills: score.matchedSkills,
                missingSkills: score.missingSkills,
                seniorityMatch: score.seniorityMatch
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                blockName: "A — Role Fit",
                error: `Failed to score role fit: ${errorMessage}`
            };
        }
    }

    private async scoreRoleFit(input: z.infer<typeof this.inputSchema>) {
        const prompt = `Evaluate the role fit for this job posting (Block A scoring):

JOB TITLE: ${input.jobTitle}

JOB DESCRIPTION:
${input.jobDescription}

CANDIDATE PROFILE:
- Skills: ${input.candidateSkills.join(", ")}
- Experience: ${input.candidateExperience}
- Target Roles: ${input.targetRoles.join(", ")}

Evaluate on a 0-5 scale:
- 5.0: Perfect match - title, skills, and seniority all align excellently
- 4.0-4.9: Strong match - most requirements met, minor gaps
- 3.0-3.9: Good match - core requirements met, some skill gaps
- 2.0-2.9: Moderate match - significant gaps but achievable
- 1.0-1.9: Weak match - major misalignment
- 0.0-0.9: Poor match - not suitable

Return JSON:
{
  "score": 4.5,
  "analysis": "2-3 sentence analysis of role fit",
  "matchedSkills": ["skill1", "skill2", ...],
  "missingSkills": ["skill1", "skill2", ...],
  "seniorityMatch": "Appropriate/Too Junior/Too Senior"
}`;

        const response = await AI.generate({
            model: "anthropic/claude-opus-4-7",
            prompt: prompt,
            temperature: 0.3,
            maxOutputTokens: 1000
        });
        
        try {
            const jsonMatch = response.text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            
            return {
                score: 3.0,
                analysis: response.text.substring(0, 200),
                matchedSkills: [],
                missingSkills: [],
                seniorityMatch: "Unknown"
            };
        } catch (parseError) {
            return {
                score: 3.0,
                analysis: "Unable to parse detailed analysis",
                matchedSkills: [],
                missingSkills: [],
                seniorityMatch: "Unknown"
            };
        }
    }
}
