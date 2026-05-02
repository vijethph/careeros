import { LuaTool, AI } from "lua-cli";
import { z } from "zod";

/**
 * CompanyQualityScoringTool
 * 
 * Evaluates Block B: Company Quality
 * - Company stage and stability
 * - Funding and growth
 * - Team size and structure
 * - Industry reputation
 */
export default class CompanyQualityScoringTool implements LuaTool {
    name = "score_company_quality";
    description = "Score company quality including stage, funding, team, and reputation (Block B: 0-5 scale)";
    
    inputSchema = z.object({
        companyName: z.string().describe("Company name"),
        companyInfo: z.string().optional().describe("Company information (stage, size, funding, etc.)"),
        jobDescription: z.string().describe("Job description for context")
    });

    async execute(input: z.infer<typeof this.inputSchema>) {
        try {
            const score = await this.scoreCompanyQuality(input);
            
            return {
                blockName: "B — Company Quality",
                score: score.score,
                analysis: score.analysis,
                strengths: score.strengths,
                concerns: score.concerns
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                blockName: "B — Company Quality",
                error: `Failed to score company quality: ${errorMessage}`
            };
        }
    }

    private async scoreCompanyQuality(input: z.infer<typeof this.inputSchema>) {
        const prompt = `Evaluate company quality (Block B scoring):

COMPANY: ${input.companyName}
COMPANY INFO: ${input.companyInfo || "Not provided"}

JOB DESCRIPTION (for context):
${input.jobDescription.substring(0, 500)}

Score on 0-5 scale based on:
- Company stage (startup, growth, established, public)
- Financial stability and funding
- Team size and organizational maturity
- Industry reputation and brand strength
- Growth trajectory

Return JSON:
{
  "score": 4.0,
  "analysis": "2-3 sentence analysis",
  "strengths": ["strength1", "strength2"],
  "concerns": ["concern1", "concern2"]
}`;

        const response = await AI.generate({
            model: "anthropic/claude-opus-4-7",
            prompt: prompt,
            temperature: 0.3,
            maxOutputTokens: 800
        });
        
        try {
            const jsonMatch = response.text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            
            return {
                score: 3.0,
                analysis: response.text.substring(0, 200),
                strengths: [],
                concerns: []
            };
        } catch (parseError) {
            return {
                score: 3.0,
                analysis: "Unable to parse detailed analysis",
                strengths: [],
                concerns: []
            };
        }
    }
}
