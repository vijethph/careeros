import { LuaTool, AI } from "lua-cli";
import { z } from "zod";

/**
 * CompanyNewsResearchTool
 * 
 * Researches recent company news using AI-powered web search including:
 * - Product launches and announcements
 * - Funding and acquisition news
 * - Leadership changes
 * - Company milestones
 * - Industry recognition and awards
 * - Press releases
 */
export default class CompanyNewsResearchTool implements LuaTool {
    name = "research_company_news";
    description = "Research recent company news, announcements, and press coverage using AI-powered web search";
    
    inputSchema = z.object({
        companyName: z.string().describe("Company name to research"),
        timeframe: z.enum(["1month", "3months", "6months", "1year"]).default("3months").describe("How far back to search for news")
    });

    async execute(input: z.infer<typeof this.inputSchema>) {
        const { companyName, timeframe } = input;
        
        try {
            // Use AI to research company news via web search
            const newsData = await this.researchCompanyNews(companyName, timeframe);
            
            return {
                company: companyName,
                timeframe: timeframe,
                recentNews: newsData.articles,
                keyHighlights: newsData.highlights,
                sentiment: newsData.sentiment,
                momentum: newsData.momentum,
                sources: newsData.sources,
                lastUpdated: new Date().toISOString()
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                company: companyName,
                error: `Failed to research company news: ${errorMessage}`,
                suggestion: "Search Google News or company press page manually"
            };
        }
    }

    private async researchCompanyNews(companyName: string, timeframe: string) {
        // Calculate date range based on timeframe
        const timeframeMap: Record<string, string> = {
            "1month": "past month",
            "3months": "past 3 months",
            "6months": "past 6 months",
            "1year": "past year"
        };
        
        const timeDescription = timeframeMap[timeframe] || "past 3 months";
        
        // Use AI to search and analyze company news
        const prompt = `Research recent news about ${companyName} from the ${timeDescription}.

Find and analyze:
1. Recent news articles from tech news sites (TechCrunch, The Verge, Bloomberg, etc.)
2. Product launches and announcements
3. Funding rounds or acquisition news
4. Leadership changes or executive appointments
5. Company milestones and achievements
6. Industry recognition or awards

For each news item, provide:
- Title
- Date (YYYY-MM-DD format)
- Source
- Brief summary (1-2 sentences)
- Category (Product Launch, Funding, Leadership, Milestone, etc.)

Then provide:
- Key highlights (3-5 bullet points of most important news)
- Overall sentiment (Positive, Neutral, Negative, or Mixed)
- Company momentum assessment (Strong, Moderate, Weak, or Unknown)
- List of sources used

Return the response in this JSON format:
{
  "articles": [
    {
      "title": "Article title",
      "date": "YYYY-MM-DD",
      "source": "Source name",
      "summary": "Brief summary",
      "url": "URL if available",
      "category": "Category"
    }
  ],
  "highlights": ["highlight 1", "highlight 2", ...],
  "sentiment": "Positive/Neutral/Negative/Mixed",
  "momentum": "Strong/Moderate/Weak/Unknown - brief explanation",
  "sources": ["source1", "source2", ...]
}`;

        const response = await AI.generate({
            model: "anthropic/claude-opus-4-7",
            prompt: prompt,
            temperature: 0.3,
            maxOutputTokens: 2000
        });
        
        try {
            // Parse AI response as JSON
            const jsonMatch = response.text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            
            // Fallback if JSON parsing fails
            return {
                articles: [{
                    title: "Research completed",
                    date: new Date().toISOString().split('T')[0],
                    source: "AI Research",
                    summary: response.text.substring(0, 200),
                    url: "",
                    category: "General"
                }],
                highlights: ["AI-powered research completed - see summary above"],
                sentiment: "Neutral",
                momentum: "Unknown - Unable to parse structured data",
                sources: ["AI-powered web research"]
            };
        } catch (parseError) {
            // Return raw AI response if JSON parsing fails
            return {
                articles: [{
                    title: `Recent news about ${companyName}`,
                    date: new Date().toISOString().split('T')[0],
                    source: "AI Research",
                    summary: response.text.substring(0, 300),
                    url: "",
                    category: "General"
                }],
                highlights: [response.text.substring(0, 200)],
                sentiment: "Neutral",
                momentum: "See research summary above",
                sources: ["AI-powered research"]
            };
        }
    }
}
