import { LuaTool, AI } from "lua-cli";
import { z } from "zod";

/**
 * LocationFlexibilityScoringTool
 * 
 * Evaluates Block D: Location & Flexibility
 * - Remote/hybrid/onsite policy
 * - Timezone compatibility
 * - Relocation requirements
 * - Work-life balance indicators
 */
export default class LocationFlexibilityScoringTool implements LuaTool {
    name = "score_location_flexibility";
    description = "Score location and work flexibility including remote policy and timezone (Block D: 0-5 scale)";
    
    inputSchema = z.object({
        location: z.string().optional().describe("Job location"),
        jobDescription: z.string().describe("Job description (check for remote/hybrid policy)"),
        candidateLocationPreference: z.string().optional().describe("Candidate's location preferences")
    });

    async execute(input: z.infer<typeof this.inputSchema>) {
        try {
            const score = await this.scoreLocationFlexibility(input);
            
            return {
                blockName: "D — Location & Flexibility",
                score: score.score,
                analysis: score.analysis,
                workPolicy: score.workPolicy,
                timezoneCompatibility: score.timezoneCompatibility,
                relocationRequired: score.relocationRequired
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                blockName: "D — Location & Flexibility",
                error: `Failed to score location flexibility: ${errorMessage}`
            };
        }
    }

    private async scoreLocationFlexibility(input: z.infer<typeof this.inputSchema>) {
        const prompt = `Evaluate location and flexibility (Block D scoring):

LOCATION: ${input.location || "Not specified"}
CANDIDATE PREFERENCE: ${input.candidateLocationPreference || "Not specified"}

JOB DESCRIPTION (check for remote/hybrid/onsite policy):
${input.jobDescription}

Score on 0-5 scale:
- 5.0: Perfect match - fully remote or matches preference exactly
- 4.0-4.9: Strong match - hybrid with flexibility or nearby location
- 3.0-3.9: Acceptable - some flexibility or manageable commute
- 2.0-2.9: Challenging - limited flexibility or difficult commute
- 1.0-1.9: Poor match - requires relocation or incompatible timezone
- 0.0-0.9: Incompatible - cannot meet location requirements

Return JSON:
{
  "score": 4.5,
  "analysis": "2-3 sentence analysis",
  "workPolicy": "Remote/Hybrid/Onsite/Not specified",
  "timezoneCompatibility": "Compatible/Challenging/Unknown",
  "relocationRequired": true/false
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
                workPolicy: "Unknown",
                timezoneCompatibility: "Unknown",
                relocationRequired: false
            };
        } catch (parseError) {
            return {
                score: 3.0,
                analysis: "Unable to parse detailed analysis",
                workPolicy: "Unknown",
                timezoneCompatibility: "Unknown",
                relocationRequired: false
            };
        }
    }
}
