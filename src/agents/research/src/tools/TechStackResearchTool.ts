import { LuaTool, AI } from "lua-cli";
import { z } from "zod";

/**
 * TechStackResearchTool
 * 
 * Researches company's technology stack using AI-powered analysis including:
 * - Programming languages
 * - Frameworks and libraries
 * - Databases and data stores
 * - Cloud infrastructure
 * - DevOps tools
 * - Engineering blog analysis
 */
export default class TechStackResearchTool implements LuaTool {
    name = "research_tech_stack";
    description = "Research company's technology stack, tools, and engineering practices using AI-powered analysis";
    
    inputSchema = z.object({
        companyName: z.string().describe("Company name to research"),
        jobDescription: z.string().optional().describe("Job description text to extract tech stack mentions")
    });

    async execute(input: z.infer<typeof this.inputSchema>) {
        const { companyName, jobDescription } = input;
        
        try {
            const techStack = await this.researchTechStack(companyName, jobDescription);
            
            return {
                company: companyName,
                primaryLanguages: techStack.languages,
                frontend: techStack.frontend,
                backend: techStack.backend,
                databases: techStack.databases,
                cloud: techStack.cloud,
                devops: techStack.devops,
                tools: techStack.tools,
                engineeringCulture: techStack.culture,
                sources: techStack.sources,
                confidence: techStack.confidence,
                lastUpdated: new Date().toISOString()
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                company: companyName,
                error: `Failed to research tech stack: ${errorMessage}`,
                suggestion: "Check company engineering blog or job postings manually"
            };
        }
    }

    private async researchTechStack(companyName: string, jobDescription?: string) {
        const jobContext = jobDescription ? `\n\nJob Description Context:\n${jobDescription}` : '';
        
        const prompt = `Research the technology stack and engineering practices of ${companyName}.${jobContext}

Find and analyze:
1. Primary programming languages used
2. Frontend technologies (frameworks, libraries)
3. Backend technologies (frameworks, services)
4. Databases and data stores
5. Cloud infrastructure (AWS, GCP, Azure, etc.)
6. DevOps tools and practices
7. Development tools
8. Engineering culture and practices

Search for information from:
- Company engineering blog
- Job postings and requirements
- StackShare
- GitHub repositories
- Tech conference talks
- Engineering team interviews
${jobDescription ? '- Extract technologies mentioned in the provided job description' : ''}

Return the response in this JSON format:
{
  "languages": ["Language 1", "Language 2", ...],
  "frontend": ["Framework 1", "Library 1", ...],
  "backend": ["Framework 1", "Service 1", ...],
  "databases": ["Database 1", "Database 2", ...],
  "cloud": ["Cloud provider and services"],
  "devops": ["Tool 1", "Tool 2", ...],
  "tools": ["Development tool 1", "Tool 2", ...],
  "culture": [
    "Culture aspect 1",
    "Engineering practice 1",
    ...
  ],
  "sources": ["Source 1", "Source 2", ...],
  "confidence": "High/Medium/Low - explanation"
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
                languages: ["Information not available"],
                frontend: ["Not specified"],
                backend: ["Not specified"],
                databases: ["Not specified"],
                cloud: ["Not specified"],
                devops: ["Not specified"],
                tools: ["Not specified"],
                culture: [response.text.substring(0, 200)],
                sources: ["AI-powered research"],
                confidence: "Low - Unable to parse structured data"
            };
        } catch (parseError) {
            return {
                languages: ["See analysis below"],
                frontend: ["See analysis below"],
                backend: ["See analysis below"],
                databases: ["See analysis below"],
                cloud: ["See analysis below"],
                devops: ["See analysis below"],
                tools: ["See analysis below"],
                culture: [response.text.substring(0, 500)],
                sources: ["AI-powered research"],
                confidence: "Medium - Unstructured data"
            };
        }
    }
}
