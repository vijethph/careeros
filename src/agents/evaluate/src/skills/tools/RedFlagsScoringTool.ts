import { LuaTool, AI } from "lua-cli";
import { z } from "zod";

/**
 * RedFlagsScoringTool
 * 
 * Evaluates Block F: Red Flags (inverted scoring - 5 = no red flags)
 * - Vague job description
 * - Unrealistic requirements
 * - Signs of high turnover
 * - Poor company reviews
 * - Ghost job indicators
 */
export default class RedFlagsScoringTool implements LuaTool {
    name = "score_red_flags";
    description = "Identify red flags in job posting (Block F: 0-5 scale where 5 = no red flags)";
    
    inputSchema = z.object({
        jobTitle: z.string().describe("Job title"),
        jobDescription: z.string().describe("Job description"),
        companyName: z.string().describe("Company name"),
        postedDate: z.string().optional().describe("When posted")
    });

    async execute(input: z.infer<typeof this.inputSchema>) {
        try {
            const score = await this.scoreRedFlags(input);
            
            return {
                blockName: "F — Red Flags",
                score: score.score,
                analysis: score.analysis,
                redFlags: score.redFlags,
                severity: score.severity
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                blockName: "F — Red Flags",
                error: `Failed to score red flags: ${errorMessage}`
            };
        }
    }

    private async scoreRedFlags(input: z.infer<typeof this.inputSchema>) {
        const prompt = `Identify red flags in this job posting (Block F scoring - INVERTED: 5 = no red flags, 0 = many red flags):

JOB TITLE: ${input.jobTitle}
COMPANY: ${input.companyName}
POSTED: ${input.postedDate || "Unknown"}

JOB DESCRIPTION:
${input.jobDescription}

Check for red flags:
- Vague or generic job description
- Unrealistic skill requirements ("unicorn" roles)
- Excessive requirements for junior positions
- Signs of high turnover (always hiring)
- Poor grammar or unprofessional language
- Lack of specific responsibilities
- Overly aggressive language
- Missing key information
- Ghost job indicators (old posting, no updates)

Score on 0-5 scale (INVERTED):
- 5.0: No red flags - professional, clear, realistic
- 4.0-4.9: Minor concerns - mostly good
- 3.0-3.9: Some red flags - proceed with caution
- 2.0-2.9: Multiple red flags - significant concerns
- 1.0-1.9: Many red flags - high risk
- 0.0-0.9: Critical red flags - avoid

Return JSON:
{
  "score": 4.5,
  "analysis": "2-3 sentence analysis",
  "redFlags": ["red flag 1", "red flag 2"],
  "severity": "None/Minor/Moderate/Significant/Critical"
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
                redFlags: [],
                severity: "Unknown"
            };
        } catch (parseError) {
            return {
                score: 3.0,
                analysis: "Unable to parse detailed analysis",
                redFlags: [],
                severity: "Unknown"
            };
        }
    }
}
