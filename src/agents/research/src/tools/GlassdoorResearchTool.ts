import { LuaTool, AI } from "lua-cli";
import { z } from "zod";

/**
 * GlassdoorResearchTool
 * 
 * Researches company reviews and employee sentiment using AI-powered analysis including:
 * - Overall ratings
 * - Work-life balance scores
 * - Culture and values ratings
 * - Career opportunities
 * - Compensation and benefits
 * - Interview experiences
 * - Pros and cons from reviews
 */
export default class GlassdoorResearchTool implements LuaTool {
    name = "research_glassdoor_reviews";
    description = "Research company reviews, ratings, and employee sentiment using AI-powered analysis";
    
    inputSchema = z.object({
        companyName: z.string().describe("Company name to research on Glassdoor")
    });

    async execute(input: z.infer<typeof this.inputSchema>) {
        const { companyName } = input;
        
        try {
            const reviewData = await this.researchGlassdoorReviews(companyName);
            
            return {
                company: companyName,
                overallRating: reviewData.overallRating,
                totalReviews: reviewData.totalReviews,
                ratings: reviewData.ratings,
                ceoApproval: reviewData.ceoApproval,
                recommendToFriend: reviewData.recommendToFriend,
                topPros: reviewData.topPros,
                topCons: reviewData.topCons,
                interviewExperience: reviewData.interviewExperience,
                salaryInsights: reviewData.salaryInsights,
                sentiment: reviewData.sentiment,
                lastUpdated: new Date().toISOString()
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                company: companyName,
                error: `Failed to research Glassdoor reviews: ${errorMessage}`,
                suggestion: "Visit Glassdoor.com manually for detailed reviews"
            };
        }
    }

    private async researchGlassdoorReviews(companyName: string) {
        const prompt = `Research employee reviews and company ratings for ${companyName} from Glassdoor and similar review sites.

Find and analyze:
1. Overall company rating (out of 5 stars)
2. Number of reviews available
3. Category ratings:
   - Work-life balance
   - Culture and values
   - Career opportunities
   - Compensation and benefits
   - Senior management
4. CEO approval rating (percentage)
5. Percentage who would recommend to a friend
6. Top 5 pros mentioned by employees
7. Top 5 cons mentioned by employees
8. Interview experience insights:
   - Difficulty rating (1-5)
   - Positive experience percentage
   - Average interview duration
   - Process description
9. Salary insights:
   - Average base salary range
   - Stock options/equity information
   - Bonus structure
10. Overall employee sentiment analysis

Return the response in this JSON format:
{
  "overallRating": 4.2,
  "totalReviews": 1000,
  "ratings": {
    "workLifeBalance": 4.0,
    "cultureValues": 4.5,
    "careerOpportunities": 4.2,
    "compensationBenefits": 4.3,
    "seniorManagement": 4.0
  },
  "ceoApproval": 90,
  "recommendToFriend": 85,
  "topPros": ["Pro 1", "Pro 2", ...],
  "topCons": ["Con 1", "Con 2", ...],
  "interviewExperience": {
    "difficulty": 3.8,
    "positiveExperience": 75,
    "averageDuration": "2-3 weeks",
    "processDescription": "Brief description"
  },
  "salaryInsights": {
    "averageBaseSalary": "$150,000 - $200,000",
    "stockOptions": "Description",
    "bonus": "Description"
  },
  "sentiment": "Overall sentiment summary (2-3 sentences)"
}`;

        const response = await AI.generate({
            model: "anthropic/claude-opus-4-7",
            prompt: prompt,
            temperature: 0.3,
            maxOutputTokens: 2000
        });
        
        try {
            const jsonMatch = response.text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            
            // Fallback structure
            return {
                overallRating: 0,
                totalReviews: 0,
                ratings: {
                    workLifeBalance: 0,
                    cultureValues: 0,
                    careerOpportunities: 0,
                    compensationBenefits: 0,
                    seniorManagement: 0
                },
                ceoApproval: 0,
                recommendToFriend: 0,
                topPros: [response.text.substring(0, 100)],
                topCons: ["Information not available"],
                interviewExperience: {
                    difficulty: 0,
                    positiveExperience: 0,
                    averageDuration: "Unknown",
                    processDescription: "Not available"
                },
                salaryInsights: {
                    averageBaseSalary: "Not available",
                    stockOptions: "Not available",
                    bonus: "Not available"
                },
                sentiment: response.text.substring(0, 300)
            };
        } catch (parseError) {
            return {
                overallRating: 0,
                totalReviews: 0,
                ratings: {
                    workLifeBalance: 0,
                    cultureValues: 0,
                    careerOpportunities: 0,
                    compensationBenefits: 0,
                    seniorManagement: 0
                },
                ceoApproval: 0,
                recommendToFriend: 0,
                topPros: ["See analysis below"],
                topCons: ["See analysis below"],
                interviewExperience: {
                    difficulty: 0,
                    positiveExperience: 0,
                    averageDuration: "Unknown",
                    processDescription: response.text.substring(0, 200)
                },
                salaryInsights: {
                    averageBaseSalary: "See analysis below",
                    stockOptions: "See analysis below",
                    bonus: "See analysis below"
                },
                sentiment: response.text.substring(0, 500)
            };
        }
    }
}
