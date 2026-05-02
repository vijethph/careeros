import { LuaTool, AI } from "lua-cli";
import { z } from "zod";
import FundingResearchTool from "./FundingResearchTool";
import TechStackResearchTool from "./TechStackResearchTool";
import GlassdoorResearchTool from "./GlassdoorResearchTool";
import CompanyNewsResearchTool from "./CompanyNewsResearchTool";
import HiringManagerResearchTool from "./HiringManagerResearchTool";

/**
 * ComprehensiveResearchTool
 * 
 * Orchestrates all research tools to provide a complete company research report using AI.
 * This is the main tool that users should call to get a full research package.
 */
export default class ComprehensiveResearchTool implements LuaTool {
    name = "comprehensive_company_research";
    description = "Generate a complete AI-powered company research report including funding, tech stack, reviews, news, and hiring managers";
    
    inputSchema = z.object({
        companyName: z.string().describe("Company name to research"),
        jobTitle: z.string().optional().describe("Target job title for role-specific research"),
        jobDescription: z.string().optional().describe("Job description text for tech stack extraction")
    });

    private fundingTool = new FundingResearchTool();
    private techStackTool = new TechStackResearchTool();
    private glassdoorTool = new GlassdoorResearchTool();
    private newsTool = new CompanyNewsResearchTool();
    private hiringTool = new HiringManagerResearchTool();

    async execute(input: z.infer<typeof this.inputSchema>) {
        const { companyName, jobTitle, jobDescription } = input;
        
        try {
            // Run all research tools in parallel for efficiency
            const [funding, techStack, reviews, news, hiring] = await Promise.all([
                this.fundingTool.execute({ companyName }),
                this.techStackTool.execute({ companyName, jobDescription }),
                this.glassdoorTool.execute({ companyName }),
                this.newsTool.execute({ companyName, timeframe: "3months" }),
                this.hiringTool.execute({ companyName, role: jobTitle || "Software Engineer" })
            ]);

            // Use AI to generate executive summary and recommendations
            const analysis = await this.generateAnalysis(
                companyName,
                jobTitle,
                funding,
                techStack,
                reviews,
                news,
                hiring
            );
            
            return {
                company: companyName,
                researchDate: new Date().toISOString(),
                executiveSummary: analysis.summary,
                sections: {
                    funding: this.extractFundingSection(funding),
                    techStack: this.extractTechStackSection(techStack),
                    employeeReviews: this.extractReviewsSection(reviews),
                    recentNews: this.extractNewsSection(news),
                    hiringManagers: this.extractHiringSection(hiring)
                },
                recommendations: analysis.recommendations,
                nextSteps: analysis.nextSteps,
                sources: this.aggregateSources(funding, techStack, reviews, news, hiring)
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                company: companyName,
                error: `Failed to generate comprehensive research: ${errorMessage}`,
                suggestion: "Try running individual research tools separately"
            };
        }
    }

    private async generateAnalysis(
        companyName: string,
        jobTitle: string | undefined,
        funding: any,
        techStack: any,
        reviews: any,
        news: any,
        hiring: any
    ) {
        const roleContext = jobTitle ? ` for a ${jobTitle} position` : '';
        
        const prompt = `Based on the following research data about ${companyName}${roleContext}, generate an executive summary, recommendations, and next steps.

FUNDING DATA:
${JSON.stringify(funding, null, 2)}

TECH STACK DATA:
${JSON.stringify(techStack, null, 2)}

EMPLOYEE REVIEWS DATA:
${JSON.stringify(reviews, null, 2)}

RECENT NEWS DATA:
${JSON.stringify(news, null, 2)}

HIRING MANAGERS DATA:
${JSON.stringify(hiring, null, 2)}

Generate:
1. Executive Summary (2-3 sentences): Overall assessment of the company as a potential employer
2. Recommendations (5-7 bullet points): Specific advice for job seekers considering this company
3. Next Steps (5-7 bullet points): Actionable steps to take if applying

Return the response in this JSON format:
{
  "summary": "Executive summary text",
  "recommendations": [
    "Recommendation 1",
    "Recommendation 2",
    ...
  ],
  "nextSteps": [
    "Step 1",
    "Step 2",
    ...
  ]
}`;

        const response = await AI.generate({
            model: "anthropic/claude-opus-4-7",
            prompt: prompt,
            temperature: 0.4,
            maxOutputTokens: 1500
        });
        
        try {
            const jsonMatch = response.text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            
            // Fallback
            return {
                summary: response.text.substring(0, 300),
                recommendations: [
                    "Review detailed research sections for specific insights",
                    "Assess company stability and culture fit",
                    "Prepare for technical interviews"
                ],
                nextSteps: [
                    "Tailor CV to highlight relevant skills",
                    "Research specific team and product area",
                    "Prepare questions for interviews"
                ]
            };
        } catch (parseError) {
            return {
                summary: `${companyName} research completed. Review individual sections for detailed insights.`,
                recommendations: [
                    "Analyze funding stability and growth trajectory",
                    "Assess tech stack alignment with your skills",
                    "Review employee sentiment and culture fit",
                    "Consider recent company momentum and news",
                    "Identify networking opportunities with team members"
                ],
                nextSteps: [
                    "Customize CV emphasizing relevant experience",
                    "Research the specific team and product area",
                    "Prepare technical questions about their stack",
                    "Connect with engineering team on LinkedIn",
                    "Review company blog and recent projects"
                ]
            };
        }
    }

    private extractFundingSection(funding: any) {
        if (funding.error) {
            return {
                stage: "Unknown",
                status: "Information not available",
                risk: "Unable to assess"
            };
        }
        
        return {
            stage: funding.fundingStage || "Unknown",
            totalFunding: funding.totalFunding || "Not disclosed",
            lastRound: funding.lastRound || {},
            investors: funding.investors || [],
            valuation: funding.valuation || "Not disclosed",
            analysis: funding.analysis || "No analysis available",
            status: this.assessFundingStatus(funding),
            risk: this.assessFundingRisk(funding)
        };
    }

    private extractTechStackSection(techStack: any) {
        if (techStack.error) {
            return {
                alignment: "Unable to assess",
                highlights: ["Information not available"],
                learningOpportunities: "Unknown"
            };
        }
        
        return {
            languages: techStack.primaryLanguages || [],
            frontend: techStack.frontend || [],
            backend: techStack.backend || [],
            databases: techStack.databases || [],
            cloud: techStack.cloud || [],
            devops: techStack.devops || [],
            tools: techStack.tools || [],
            culture: techStack.engineeringCulture || [],
            alignment: "Review tech stack for skill alignment",
            highlights: this.extractTechHighlights(techStack),
            learningOpportunities: "Exposure to modern technologies and practices"
        };
    }

    private extractReviewsSection(reviews: any) {
        if (reviews.error) {
            return {
                overallSentiment: "Unknown",
                strengths: ["Information not available"],
                concerns: ["Information not available"],
                recommendation: "Research manually on Glassdoor"
            };
        }
        
        return {
            overallRating: reviews.overallRating || 0,
            totalReviews: reviews.totalReviews || 0,
            ratings: reviews.ratings || {},
            ceoApproval: reviews.ceoApproval || 0,
            recommendToFriend: reviews.recommendToFriend || 0,
            topPros: reviews.topPros || [],
            topCons: reviews.topCons || [],
            interviewExperience: reviews.interviewExperience || {},
            salaryInsights: reviews.salaryInsights || {},
            overallSentiment: reviews.sentiment || "Unknown",
            strengths: reviews.topPros?.slice(0, 3) || [],
            concerns: reviews.topCons?.slice(0, 3) || [],
            recommendation: this.generateReviewRecommendation(reviews)
        };
    }

    private extractNewsSection(news: any) {
        if (news.error) {
            return {
                momentum: "Unknown",
                recentHighlights: ["Information not available"],
                concerns: "Unable to assess"
            };
        }
        
        return {
            articles: news.recentNews || [],
            highlights: news.keyHighlights || [],
            sentiment: news.sentiment || "Unknown",
            momentum: news.momentum || "Unknown",
            recentHighlights: news.keyHighlights?.slice(0, 3) || [],
            concerns: this.identifyNewsConcerns(news)
        };
    }

    private extractHiringSection(hiring: any) {
        if (hiring.error) {
            return {
                teamStructure: "Unknown",
                culture: "Information not available",
                networkingOpportunities: "Research LinkedIn manually"
            };
        }
        
        return {
            potentialManagers: hiring.potentialManagers || [],
            teamStructure: hiring.teamStructure || {},
            leadership: hiring.engineeringLeadership || {},
            networkingTips: hiring.networkingTips || [],
            teamStructureDescription: this.describeTeamStructure(hiring),
            culture: hiring.engineeringLeadership?.engineeringCulture || "Unknown",
            networkingOpportunities: hiring.networkingTips?.join("; ") || "Unknown"
        };
    }

    private assessFundingStatus(funding: any): string {
        const stage = funding.fundingStage?.toLowerCase() || "";
        if (stage.includes("series") || stage.includes("public")) {
            return "Well-funded with strong investor backing";
        }
        if (stage.includes("seed")) {
            return "Early-stage with initial funding";
        }
        return "Funding status unclear";
    }

    private assessFundingRisk(funding: any): string {
        const stage = funding.fundingStage?.toLowerCase() || "";
        if (stage.includes("series c") || stage.includes("series d") || stage.includes("public")) {
            return "Low - Stable financial position";
        }
        if (stage.includes("series a") || stage.includes("series b")) {
            return "Medium - Growth stage";
        }
        if (stage.includes("seed")) {
            return "Higher - Early stage";
        }
        return "Unknown - Insufficient data";
    }

    private extractTechHighlights(techStack: any): string[] {
        const highlights = [];
        if (techStack.cloud?.length > 0) {
            highlights.push("Cloud-native architecture");
        }
        if (techStack.devops?.length > 0) {
            highlights.push("Modern DevOps practices");
        }
        if (techStack.primaryLanguages?.length > 0) {
            highlights.push(`Uses ${techStack.primaryLanguages.slice(0, 3).join(", ")}`);
        }
        return highlights.length > 0 ? highlights : ["Modern tech stack"];
    }

    private generateReviewRecommendation(reviews: any): string {
        const rating = reviews.overallRating || 0;
        if (rating >= 4.0) {
            return "Strong employee satisfaction - Good fit for most candidates";
        }
        if (rating >= 3.5) {
            return "Moderate satisfaction - Review pros/cons carefully";
        }
        if (rating > 0) {
            return "Mixed reviews - Proceed with caution";
        }
        return "Insufficient review data - Research during interviews";
    }

    private identifyNewsConcerns(news: any): string {
        const sentiment = news.sentiment?.toLowerCase() || "";
        if (sentiment.includes("negative")) {
            return "Recent negative news - investigate further";
        }
        if (sentiment.includes("mixed")) {
            return "Mixed signals - review news carefully";
        }
        return "No major concerns identified";
    }

    private describeTeamStructure(hiring: any): string {
        const structure = hiring.teamStructure?.organization || "";
        if (structure) {
            return structure;
        }
        return "Team structure information not available";
    }

    private aggregateSources(...results: any[]): string[] {
        const sources = new Set<string>();
        results.forEach(result => {
            if (result.sources && Array.isArray(result.sources)) {
                result.sources.forEach((source: string) => sources.add(source));
            }
        });
        return Array.from(sources);
    }
}
