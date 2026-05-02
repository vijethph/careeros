import { LuaSkill } from "lua-cli";
import FundingResearchTool from "../tools/FundingResearchTool";
import TechStackResearchTool from "../tools/TechStackResearchTool";
import GlassdoorResearchTool from "../tools/GlassdoorResearchTool";
import CompanyNewsResearchTool from "../tools/CompanyNewsResearchTool";
import HiringManagerResearchTool from "../tools/HiringManagerResearchTool";
import ComprehensiveResearchTool from "../tools/ComprehensiveResearchTool";

/**
 * Company Research Skill
 * 
 * Provides comprehensive company research capabilities for job seekers.
 * This skill enables deep research into companies including funding, tech stack,
 * employee reviews, recent news, and hiring manager identification.
 */
const companyResearchSkill = new LuaSkill({
    name: "company-research-skill",
    description: "Deep company research for job applications including funding, tech stack, reviews, news, and hiring managers",
    context: `
This skill provides comprehensive company research capabilities for job seekers.

Tool Usage:

- comprehensive_company_research: Use this FIRST for a complete research report. 
  This is the main tool that provides an executive summary and all research sections.
  Best for: Getting a full picture of a company before applying.

- research_company_funding: Use for detailed funding information.
  When to use: When you need specific details about funding rounds, investors, or valuation.
  Returns: Funding stage, total raised, investors, valuation, funding history.

- research_tech_stack: Use for technology stack analysis.
  When to use: When you want to know what technologies the company uses.
  Returns: Languages, frameworks, databases, cloud infrastructure, DevOps tools.
  Tip: Provide job description to extract tech mentions.

- research_glassdoor_reviews: Use for employee sentiment and reviews.
  When to use: When you want to understand company culture and employee satisfaction.
  Returns: Ratings, pros/cons, interview experiences, salary insights.

- research_company_news: Use for recent company updates.
  When to use: When you want to know about recent developments and momentum.
  Returns: Recent articles, key highlights, sentiment analysis.

- research_hiring_managers: Use for identifying potential hiring managers.
  When to use: When you want to network or understand team structure.
  Returns: Potential managers, team structure, networking tips.

Guidelines:

1. Start with comprehensive_company_research for a full overview
2. Use specific tools for deeper dives into particular areas
3. Always provide company name exactly as it appears in job postings
4. Include job description when available for better tech stack analysis
5. Combine multiple research areas for complete due diligence
6. Use research to tailor CV and prepare for interviews
7. Identify networking opportunities from hiring manager research

Research Workflow:

1. User provides company name and optionally job details
2. Run comprehensive_company_research first
3. If user needs more detail, use specific research tools
4. Summarize findings with actionable recommendations
5. Suggest next steps for application and networking

Important Notes:

- Research data is aggregated from multiple sources
- Some companies may have limited public information
- Always verify critical information during interview process
- Use research to ask informed questions during interviews
- Respect privacy and use information ethically
`,
    tools: [
        new ComprehensiveResearchTool(),
        new FundingResearchTool(),
        new TechStackResearchTool(),
        new GlassdoorResearchTool(),
        new CompanyNewsResearchTool(),
        new HiringManagerResearchTool()
    ]
});

export default companyResearchSkill;
