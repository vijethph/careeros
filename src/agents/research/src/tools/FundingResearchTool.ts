import { LuaTool, AI } from "lua-cli";
import { z } from "zod";

/**
 * FundingResearchTool
 * 
 * Researches company funding information using AI-powered web search including:
 * - Funding rounds (Seed, Series A/B/C, etc.)
 * - Total funding raised
 * - Recent funding announcements
 * - Investor information
 * - Valuation estimates
 */
export default class FundingResearchTool implements LuaTool {
    name = "research_company_funding";
    description = "Research company funding rounds, investors, and financial backing using AI-powered web search";
    
    inputSchema = z.object({
        companyName: z.string().describe("Company name to research"),
        companyWebsite: z.string().optional().describe("Company website URL for additional context")
    });

    async execute(input: z.infer<typeof this.inputSchema>) {
        const { companyName, companyWebsite } = input;
        
        try {
            const fundingData = await this.researchFunding(companyName, companyWebsite);
            
            return {
                company: companyName,
                fundingStage: fundingData.stage,
                totalFunding: fundingData.totalFunding,
                lastRound: fundingData.lastRound,
                investors: fundingData.investors,
                valuation: fundingData.valuation,
                fundingHistory: fundingData.history,
                analysis: fundingData.analysis,
                sources: fundingData.sources,
                lastUpdated: new Date().toISOString()
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                company: companyName,
                error: `Failed to research funding: ${errorMessage}`,
                suggestion: "Try searching manually on Crunchbase or company press releases"
            };
        }
    }

    private async researchFunding(companyName: string, companyWebsite?: string) {
        const websiteContext = companyWebsite ? ` (website: ${companyWebsite})` : '';
        
        const prompt = `Research the funding and financial backing of ${companyName}${websiteContext}.

Find and analyze:
1. Current funding stage (Seed, Series A/B/C/D, etc., or Public/Bootstrapped)
2. Total funding raised (in USD)
3. Most recent funding round details (type, amount, date, valuation if available)
4. List of key investors (VCs, angels, strategic investors)
5. Company valuation (if publicly disclosed)
6. Funding history timeline (previous rounds with amounts and dates)
7. Analysis of financial health and runway

Search for information from:
- Crunchbase
- TechCrunch funding announcements
- Company press releases
- Business news sites (Bloomberg, WSJ, etc.)
- Company website investor pages

Return the response in this JSON format:
{
  "stage": "Current funding stage",
  "totalFunding": "Total amount raised (e.g., '$100M' or 'Not disclosed')",
  "lastRound": {
    "type": "Round type (e.g., 'Series B')",
    "amount": "Amount raised",
    "date": "YYYY-MM or 'Unknown'",
    "valuation": "Company valuation or 'Not disclosed'"
  },
  "investors": ["Investor 1", "Investor 2", ...],
  "valuation": "Current valuation or 'Not publicly disclosed'",
  "history": [
    {
      "round": "Round name",
      "amount": "Amount",
      "date": "YYYY-MM",
      "valuation": "Valuation if known"
    }
  ],
  "analysis": "2-3 sentence analysis of financial health and what this means for job seekers",
  "sources": ["Source 1", "Source 2", ...]
}`;

        const response = await AI.generate({
            model: "anthropic/claude-opus-4-7",
            prompt: prompt,
            temperature: 0.3,
            maxOutputTokens: 1500
        });
        
        try {
            const jsonMatch = response.text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            
            // Fallback structure
            return {
                stage: "Unknown",
                totalFunding: "Information not available",
                lastRound: {
                    type: "Unknown",
                    amount: "N/A",
                    date: "N/A",
                    valuation: "N/A"
                },
                investors: ["Information not available"],
                valuation: "Not publicly disclosed",
                history: [],
                analysis: response.text.substring(0, 300),
                sources: ["AI-powered research"]
            };
        } catch (parseError) {
            return {
                stage: "Unknown",
                totalFunding: "See analysis below",
                lastRound: {
                    type: "Unknown",
                    amount: "N/A",
                    date: "N/A",
                    valuation: "N/A"
                },
                investors: ["See analysis below"],
                valuation: "Not publicly disclosed",
                history: [],
                analysis: response.text.substring(0, 500),
                sources: ["AI-powered research"]
            };
        }
    }
}
