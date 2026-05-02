import { LuaTool, AI } from "lua-cli";
import { z } from "zod";

/**
 * EvaluateJobTool
 * 
 * Comprehensive job evaluation using A-G scoring system:
 * A — Role Fit: Skills + experience match
 * B — Company Quality: Stage, funding, team
 * C — Compensation: Expected range match
 * D — Location/Flexibility: Remote? Hybrid? Timezone?
 * E — Growth: Career trajectory
 * F — Red Flags: Ghost jobs, vague JD
 * G — Posting Legitimacy: Freshness, credibility
 */
export default class EvaluateJobTool implements LuaTool {
    name = "evaluate_job_posting";
    description = "Evaluate a job posting using A-G scoring system (0-5 scale) to determine fit and quality";
    
    inputSchema = z.object({
        jobTitle: z.string().describe("Job title"),
        jobDescription: z.string().describe("Full job description text"),
        companyName: z.string().describe("Company name"),
        companyInfo: z.string().optional().describe("Additional company information (stage, size, etc.)"),
        location: z.string().optional().describe("Job location or remote policy"),
        salaryRange: z.string().optional().describe("Salary range if provided"),
        postedDate: z.string().optional().describe("When the job was posted"),
        candidateProfile: z.object({
            skills: z.array(z.string()).describe("Candidate's skills"),
            experience: z.string().describe("Years and type of experience"),
            targetRoles: z.array(z.string()).describe("Target job titles"),
            salaryExpectation: z.string().optional().describe("Expected salary range"),
            locationPreference: z.string().optional().describe("Location preferences (remote, hybrid, specific cities)"),
            careerGoals: z.string().optional().describe("Career goals and growth areas")
        }).describe("Candidate profile for matching")
    });

    async execute(input: z.infer<typeof this.inputSchema>) {
        try {
            const evaluation = await this.evaluateJob(input);
            
            return {
                jobTitle: input.jobTitle,
                companyName: input.companyName,
                overallScore: evaluation.overallScore,
                verdict: evaluation.verdict,
                scores: evaluation.scores,
                reasons: evaluation.reasons,
                recommendations: evaluation.recommendations,
                redFlags: evaluation.redFlags,
                evaluationDate: new Date().toISOString()
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                jobTitle: input.jobTitle,
                companyName: input.companyName,
                error: `Failed to evaluate job: ${errorMessage}`,
                suggestion: "Try providing more complete job description and candidate profile"
            };
        }
    }

    private async evaluateJob(input: z.infer<typeof this.inputSchema>) {
        const prompt = `Evaluate this job posting using the A-G scoring system (0-5 scale for each block):

JOB DETAILS:
- Title: ${input.jobTitle}
- Company: ${input.companyName}
- Location: ${input.location || "Not specified"}
- Salary: ${input.salaryRange || "Not disclosed"}
- Posted: ${input.postedDate || "Unknown"}
- Company Info: ${input.companyInfo || "Not provided"}

JOB DESCRIPTION:
${input.jobDescription}

CANDIDATE PROFILE:
- Skills: ${input.candidateProfile.skills.join(", ")}
- Experience: ${input.candidateProfile.experience}
- Target Roles: ${input.candidateProfile.targetRoles.join(", ")}
- Salary Expectation: ${input.candidateProfile.salaryExpectation || "Not specified"}
- Location Preference: ${input.candidateProfile.locationPreference || "Flexible"}
- Career Goals: ${input.candidateProfile.careerGoals || "Not specified"}

SCORING CRITERIA (0-5 scale):

A — ROLE FIT (0-5):
- Does the title match target roles?
- Do required skills align with candidate skills?
- Is the seniority level appropriate?
- Does the scope match experience level?

B — COMPANY QUALITY (0-5):
- Company stage and stability
- Funding and growth trajectory
- Team size and structure
- Industry reputation

C — COMPENSATION (0-5):
- Salary range vs. expectations
- Equity/stock options
- Benefits package
- Total compensation competitiveness

D — LOCATION & FLEXIBILITY (0-5):
- Remote/hybrid/onsite policy
- Timezone compatibility
- Relocation requirements
- Work-life balance indicators

E — GROWTH OPPORTUNITY (0-5):
- Learning and development
- Career advancement potential
- Technology stack modernity
- Skill-building opportunities

F — RED FLAGS (0-5, where 5 = no red flags):
- Vague job description
- Unrealistic requirements
- Signs of high turnover
- Poor company reviews
- Ghost job indicators

G — POSTING LEGITIMACY (0-5):
- Posting freshness
- Recruiter credibility
- Company verification
- Job description quality

Return the response in this JSON format:
{
  "scores": {
    "roleFit": 4.5,
    "companyQuality": 4.0,
    "compensation": 3.5,
    "locationFlexibility": 5.0,
    "growthOpportunity": 4.2,
    "redFlags": 4.8,
    "postingLegitimacy": 4.5
  },
  "overallScore": 4.3,
  "verdict": "2-3 sentence overall assessment of this opportunity",
  "reasons": {
    "toApply": [
      "Reason 1 to apply",
      "Reason 2 to apply",
      "Reason 3 to apply"
    ],
    "toSkip": [
      "Concern 1",
      "Concern 2"
    ]
  },
  "redFlags": [
    "Red flag 1 if any",
    "Red flag 2 if any"
  ],
  "recommendations": [
    "Recommendation 1",
    "Recommendation 2",
    "Recommendation 3"
  ]
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
                scores: {
                    roleFit: 3.0,
                    companyQuality: 3.0,
                    compensation: 3.0,
                    locationFlexibility: 3.0,
                    growthOpportunity: 3.0,
                    redFlags: 3.0,
                    postingLegitimacy: 3.0
                },
                overallScore: 3.0,
                verdict: response.text.substring(0, 300),
                reasons: {
                    toApply: ["See detailed analysis above"],
                    toSkip: ["Unable to parse structured evaluation"]
                },
                redFlags: [],
                recommendations: ["Review the job description manually", "Research the company further"]
            };
        } catch (parseError) {
            return {
                scores: {
                    roleFit: 3.0,
                    companyQuality: 3.0,
                    compensation: 3.0,
                    locationFlexibility: 3.0,
                    growthOpportunity: 3.0,
                    redFlags: 3.0,
                    postingLegitimacy: 3.0
                },
                overallScore: 3.0,
                verdict: "Evaluation completed but unable to parse structured output. See raw analysis.",
                reasons: {
                    toApply: [response.text.substring(0, 200)],
                    toSkip: ["Manual review recommended"]
                },
                redFlags: [],
                recommendations: ["Review full evaluation details", "Cross-reference with company research"]
            };
        }
    }
}
