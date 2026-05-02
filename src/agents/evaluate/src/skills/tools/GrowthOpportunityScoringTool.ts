import { LuaTool, AI } from "lua-cli";
import { z } from "zod";

/**
 * GrowthOpportunityScoringTool
 * 
 * Evaluates Block E: Growth Opportunity
 * - Learning and development
 * - Career advancement potential
 * - Technology stack modernity
 * - Skill-building opportunities
 */
export default class GrowthOpportunityScoringTool implements LuaTool {
    name = "score_growth_opportunity";
    description = "Score career growth and learning opportunities (Block E: 0-5 scale)";
    
    inputSchema = z.object({
        jobTitle: z.string().describe("Job title"),
        jobDescription: z.string().describe("Job description"),
        candidateCareerGoals: z.string().optional().describe("Candidate's career goals")
    });

    async execute(input: z.infer<typeof this.inputSchema>) {
        try {
            const score = await this.scoreGrowthOpportunity(input);
            
            return {
                blockName: "E — Growth Opportunity",
                score: score.score,
                analysis: score.analysis,
                learningOpportunities: score.learningOpportunities,
                careerPath: score.careerPath,
                techStackModernity: score.techStackModernity
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                blockName: "E — Growth Opportunity",
                error: `Failed to score growth opportunity: ${errorMessage}`
            };
        }
    }

    private async scoreGrowthOpportunity(input: z.infer<typeof this.inputSchema>) {
        const prompt = `Evaluate growth opportunity (Block E scoring):

JOB TITLE: ${input.jobTitle}
CANDIDATE CAREER GOALS: ${input.candidateCareerGoals || "Not specified"}

JOB DESCRIPTION:
${input.jobDescription}

Score on 0-5 scale based on:
- Learning and development opportunities
- Career advancement potential
- Technology stack modernity
- Skill-building and mentorship
- Scope for impact and ownership

Return JSON:
{
  "score": 4.2,
  "analysis": "2-3 sentence analysis",
  "learningOpportunities": ["opportunity1", "opportunity2"],
  "careerPath": "Clear/Moderate/Limited/Unknown",
  "techStackModernity": "Modern/Mixed/Legacy/Unknown"
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
                learningOpportunities: [],
                careerPath: "Unknown",
                techStackModernity: "Unknown"
            };
        } catch (parseError) {
            return {
                score: 3.0,
                analysis: "Unable to parse detailed analysis",
                learningOpportunities: [],
                careerPath: "Unknown",
                techStackModernity: "Unknown"
            };
        }
    }
}
