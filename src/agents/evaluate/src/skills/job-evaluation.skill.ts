import { LuaSkill } from "lua-cli";
import EvaluateJobTool from "./tools/EvaluateJobTool";
import RoleFitScoringTool from "./tools/RoleFitScoringTool";
import CompanyQualityScoringTool from "./tools/CompanyQualityScoringTool";
import CompensationScoringTool from "./tools/CompensationScoringTool";
import LocationFlexibilityScoringTool from "./tools/LocationFlexibilityScoringTool";
import GrowthOpportunityScoringTool from "./tools/GrowthOpportunityScoringTool";
import RedFlagsScoringTool from "./tools/RedFlagsScoringTool";
import PostingLegitimacyScoringTool from "./tools/PostingLegitimacyScoringTool";

/**
 * Job Evaluation Skill
 * 
 * Provides comprehensive job evaluation using the A-G scoring system.
 * Helps job seekers make informed decisions about job opportunities.
 */
const jobEvaluationSkill = new LuaSkill({
    name: "job-evaluation-skill",
    description: "Comprehensive job evaluation using A-G scoring system (0-5 scale per block)",
    context: `
This skill provides job evaluation capabilities using the A-G scoring system.

Tool Usage:

- evaluate_job_posting: Use this FIRST for a complete evaluation.
  This is the main tool that provides overall score and all A-G block scores.
  Best for: Getting a comprehensive evaluation of a job opportunity.

- score_role_fit (Block A): Use for detailed role fit analysis.
  When to use: When you need specific details about skills match and seniority.
  Returns: Score, matched skills, missing skills, seniority assessment.

- score_company_quality (Block B): Use for company quality assessment.
  When to use: When you need details about company stage, funding, reputation.
  Returns: Score, company strengths, concerns.

- score_compensation (Block C): Use for compensation analysis.
  When to use: When you need details about salary, equity, benefits.
  Returns: Score, salary match, equity info, benefits highlights.

- score_location_flexibility (Block D): Use for location and flexibility analysis.
  When to use: When you need details about remote policy, timezone, relocation.
  Returns: Score, work policy, timezone compatibility, relocation requirements.

- score_growth_opportunity (Block E): Use for career growth analysis.
  When to use: When you need details about learning, advancement, tech stack.
  Returns: Score, learning opportunities, career path, tech modernity.

- score_red_flags (Block F): Use for red flag identification.
  When to use: When you need to identify potential issues or concerns.
  Returns: Score (inverted: 5 = no red flags), list of red flags, severity.

- score_posting_legitimacy (Block G): Use for posting credibility analysis.
  When to use: When you need to verify if the posting is legitimate.
  Returns: Score, freshness, credibility indicators, concerns.

Scoring Scale (0-5):
- 5.0: Excellent - exceeds expectations
- 4.0-4.9: Strong - meets/exceeds expectations
- 3.0-3.9: Good - acceptable, meets most criteria
- 2.0-2.9: Fair - below expectations, concerns
- 1.0-1.9: Poor - significant issues
- 0.0-0.9: Very poor - not recommended

Guidelines:

1. Start with evaluate_job_posting for a complete evaluation
2. Use specific block tools for deeper analysis of particular areas
3. Always provide candidate profile for accurate matching
4. Consider all blocks together for final decision
5. Red flags (Block F) are inverted: 5 = no red flags, 0 = many red flags
6. Overall score ≥ 3.5 typically indicates a good opportunity
7. Use evaluation results to inform company research and CV tailoring

Evaluation Workflow:

1. User provides job posting and candidate profile
2. Run evaluate_job_posting for comprehensive scoring
3. If user needs more detail, use specific block tools
4. Summarize findings with actionable recommendations
5. Suggest next steps (apply, research further, skip)

Important Notes:

- Evaluation is based on provided information
- Some blocks may have limited data (e.g., compensation not disclosed)
- Always recommend verifying details during interview process
- Use evaluation to prioritize job applications
- Combine with company research for complete picture
`,
    tools: [
        new EvaluateJobTool(),
        new RoleFitScoringTool(),
        new CompanyQualityScoringTool(),
        new CompensationScoringTool(),
        new LocationFlexibilityScoringTool(),
        new GrowthOpportunityScoringTool(),
        new RedFlagsScoringTool(),
        new PostingLegitimacyScoringTool()
    ]
});

export default jobEvaluationSkill;
