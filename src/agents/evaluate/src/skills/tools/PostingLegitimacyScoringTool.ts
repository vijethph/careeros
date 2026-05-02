import { LuaTool, AI } from "lua-cli";
import { z } from "zod";

/**
 * PostingLegitimacyScoringTool
 * 
 * Evaluates Block G: Posting Legitimacy
 * - Posting freshness
 * - Recruiter credibility
 * - Company verification
 * - Job description quality
 */
export default class PostingLegitimacyScoringTool implements LuaTool {
    name = "score_posting_legitimacy";
    description = "Score job posting legitimacy and credibility (Block G: 0-5 scale)";
    
    inputSchema = z.object({
        jobTitle: z.string().describe("Job title"),
        companyName: z.string().describe("Company name"),
        postedDate: z.string().optional().describe("When posted"),
        jobDescription: z.string().describe("Job description"),
        recruiterInfo: z.string().optional().describe("Recruiter or contact information")
    });

    async execute(input: z.infer<typeof this.inputSchema>) {
        try {
            const score = await this.scorePostingLegitimacy(input);
            
            return {
                blockName: "G — Posting Legitimacy",
                score: score.score,
                analysis: score.analysis,
                freshness: score.freshness,
                credibilityIndicators: score.credibilityIndicators,
                concerns: score.concerns
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                blockName: "G — Posting Legitimacy",
                error: `Failed to score posting legitimacy: ${errorMessage}`
            };
        }
    }

    private async scorePostingLegitimacy(input: z.infer<typeof this.inputSchema>) {
        const prompt = `Evaluate posting legitimacy (Block G scoring):

JOB TITLE: ${input.jobTitle}
COMPANY: ${input.companyName}
POSTED: ${input.postedDate || "Unknown"}
RECRUITER: ${input.recruiterInfo || "Not provided"}

JOB DESCRIPTION:
${input.jobDescription}

Score on 0-5 scale based on:
- Posting freshness (recent vs. stale)
- Company verification (real company, active)
- Job description quality and detail
- Recruiter credibility
- Contact information provided
- Professional presentation

Indicators of legitimacy:
- Recent posting date
- Detailed, specific job description
- Named recruiter or hiring manager
- Company website and verification
- Professional formatting
- Realistic requirements

Indicators of ghost jobs or scams:
- Very old posting (3+ months)
- Generic, vague description
- No contact information
- Suspicious company name
- Too good to be true compensation

Return JSON:
{
  "score": 4.5,
  "analysis": "2-3 sentence analysis",
  "freshness": "Fresh/Recent/Stale/Very old",
  "credibilityIndicators": ["indicator1", "indicator2"],
  "concerns": ["concern1", "concern2"]
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
                freshness: "Unknown",
                credibilityIndicators: [],
                concerns: []
            };
        } catch (parseError) {
            return {
                score: 3.0,
                analysis: "Unable to parse detailed analysis",
                freshness: "Unknown",
                credibilityIndicators: [],
                concerns: []
            };
        }
    }
}
