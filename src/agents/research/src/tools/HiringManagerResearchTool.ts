import { LuaTool, AI } from "lua-cli";
import { z } from "zod";

/**
 * HiringManagerResearchTool
 * 
 * Researches potential hiring managers and team structure using AI-powered analysis including:
 * - Engineering leadership identification
 * - Team structure and reporting lines
 * - LinkedIn profile analysis
 * - Background and experience
 * - Recent posts and activity
 * - Networking opportunities
 */
export default class HiringManagerResearchTool implements LuaTool {
    name = "research_hiring_managers";
    description = "Research potential hiring managers, team leads, and engineering leadership using AI-powered analysis";
    
    inputSchema = z.object({
        companyName: z.string().describe("Company name to research"),
        role: z.string().describe("Target role or team (e.g., 'Backend Engineer', 'Platform Team')")
    });

    async execute(input: z.infer<typeof this.inputSchema>) {
        const { companyName, role } = input;
        
        try {
            const hiringData = await this.researchHiringManagers(companyName, role);
            
            return {
                company: companyName,
                targetRole: role,
                potentialManagers: hiringData.managers,
                teamStructure: hiringData.teamStructure,
                engineeringLeadership: hiringData.leadership,
                networkingTips: hiringData.networkingTips,
                sources: hiringData.sources,
                lastUpdated: new Date().toISOString()
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                company: companyName,
                error: `Failed to research hiring managers: ${errorMessage}`,
                suggestion: "Search LinkedIn manually for engineering managers at the company"
            };
        }
    }

    private async researchHiringManagers(companyName: string, role: string) {
        const prompt = `Research potential hiring managers and engineering leadership at ${companyName} for a ${role} position.

Find and analyze:
1. Potential hiring managers who might oversee this role:
   - Name and title
   - LinkedIn profile (if publicly available)
   - Background and experience
   - Team size they manage
   - Recent activity or posts
   - Connection opportunities (conferences, communities, etc.)

2. Team structure:
   - How teams are organized (product-focused, functional, etc.)
   - Typical reporting structure
   - Average team sizes
   - Collaboration model (cross-functional, etc.)

3. Engineering leadership:
   - CTO or VP of Engineering name
   - Engineering organization structure
   - Engineering culture highlights

4. Networking tips:
   - How to connect with team members
   - Company events or meetups
   - Open source projects
   - Community involvement
   - Best practices for outreach

Search for information from:
- LinkedIn profiles and company pages
- Company website team pages
- Engineering blog author bios
- Conference speaker lists
- GitHub organization members
- Tech community forums

Return the response in this JSON format:
{
  "managers": [
    {
      "name": "Manager Name",
      "title": "Job Title",
      "linkedIn": "LinkedIn URL or 'Not publicly available'",
      "background": "Brief background summary",
      "teamSize": "Team size or 'Unknown'",
      "recentActivity": "Recent posts/activity or 'N/A'",
      "connectionOpportunity": "How to connect"
    }
  ],
  "teamStructure": {
    "organization": "How teams are organized",
    "reportingStructure": "Reporting hierarchy",
    "teamSize": "Typical team sizes",
    "collaboration": "Collaboration model"
  },
  "leadership": {
    "cto": "CTO name or 'Unknown'",
    "vpEngineering": "VP Engineering info",
    "engineeringCulture": "Culture highlights"
  },
  "networkingTips": [
    "Tip 1",
    "Tip 2",
    ...
  ],
  "sources": ["Source 1", "Source 2", ...]
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
                managers: [
                    {
                        name: "Information not available",
                        title: "Unknown",
                        linkedIn: "",
                        background: response.text.substring(0, 200),
                        teamSize: "Unknown",
                        recentActivity: "N/A",
                        connectionOpportunity: "Search LinkedIn for engineering managers"
                    }
                ],
                teamStructure: {
                    organization: "Unknown",
                    reportingStructure: "Not available",
                    teamSize: "Not specified",
                    collaboration: "Unknown"
                },
                leadership: {
                    cto: "Unknown",
                    vpEngineering: "Unknown",
                    engineeringCulture: "Research company website and LinkedIn"
                },
                networkingTips: [
                    "Search LinkedIn for engineering managers at the company",
                    "Look for company employees on Twitter and GitHub",
                    "Check if the company has an engineering blog",
                    "Attend industry events where company representatives speak"
                ],
                sources: ["AI-powered research"]
            };
        } catch (parseError) {
            return {
                managers: [
                    {
                        name: "See analysis below",
                        title: "Unknown",
                        linkedIn: "",
                        background: response.text.substring(0, 300),
                        teamSize: "Unknown",
                        recentActivity: "N/A",
                        connectionOpportunity: "Manual research recommended"
                    }
                ],
                teamStructure: {
                    organization: "See analysis above",
                    reportingStructure: "Not available",
                    teamSize: "Not specified",
                    collaboration: "Unknown"
                },
                leadership: {
                    cto: "Unknown",
                    vpEngineering: "Unknown",
                    engineeringCulture: response.text.substring(300, 500)
                },
                networkingTips: [
                    "Review the full analysis above for networking insights",
                    "Search LinkedIn for relevant connections",
                    "Check company social media and blog"
                ],
                sources: ["AI-powered research"]
            };
        }
    }
}
