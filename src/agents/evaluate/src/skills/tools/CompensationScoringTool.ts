import { LuaTool, AI } from "lua-cli";
import { z } from "zod";

/**
 * CompensationScoringTool
 * 
 * Evaluates Block C: Compensation
 * - Salary range vs. expectations
 * - Equity/stock options
 * - Benefits package
 * - Total compensation competitiveness
 */
export default class CompensationScoringTool implements LuaTool {
    name = "score_compensation";
    description = "Score compensation package including salary, equity, and benefits (Block C: 0-5 scale)";
    
    inputSchema = z.object({
        jobTitle: z.string().describe("Job title"),
        salaryRange: z.string().optional().describe("Salary range if provided"),
        jobDescription: z.string().describe("Job description (may contain compensation details)"),
        candidateSalaryExpectation: z.string().optional().describe("Candidate's salary expectations")
    });

    async execute(input: z.infer<typeof this.inputSchema>) {
        try {
            const score = await this.scoreCompensation(input);
            
            return {
                blockName: "C — Compensation",
                score: score.score,
                analysis: score.analysis,
                salaryMatch: score.salaryMatch,
                equityMentioned: score.equityMentioned,
                benefitsHighlights: score.benefitsHighlights
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                blockName: "C — Compensation",
                error: `Failed to score compensation: ${errorMessage}`
            };
        }
    }

    private async scoreCompensation(input: z.infer<typeof this.inputSchema>) {
        const prompt = `Evaluate compensation package (Block C scoring):

JOB TITLE: ${input.jobTitle}
SALARY RANGE: ${input.salaryRange || "Not disclosed"}
CANDIDATE EXPECTATION: ${input.candidateSalaryExpectation || "Not specified"}

JOB DESCRIPTION (check for compensation details):
${input.jobDescription}

Score on 0-5 scale:
- 5.0: Excellent - exceeds expectations, comprehensive package
- 4.0-4.9: Strong - meets/slightly exceeds expectations
- 3.0-3.9: Fair - market rate, standard benefits
- 2.0-2.9: Below average - below expectations
- 1.0-1.9: Poor - significantly below market
- 0.0-0.9: Very poor - not disclosed or far below market

Return JSON:
{
  "score": 3.5,
  "analysis": "2-3 sentence analysis",
  "salaryMatch": "Above/Meets/Below expectations or Not disclosed",
  "equityMentioned": true/false,
  "benefitsHighlights": ["benefit1", "benefit2"]
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
                salaryMatch: "Unknown",
                equityMentioned: false,
                benefitsHighlights: []
            };
        } catch (parseError) {
            return {
                score: 3.0,
                analysis: "Unable to parse detailed analysis",
                salaryMatch: "Unknown",
                equityMentioned: false,
                benefitsHighlights: []
            };
        }
    }
}
