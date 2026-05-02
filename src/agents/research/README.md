# 🔍 Company Research Agent

> Deep company research for informed job search decisions - Part of the Career-Ops AI pipeline

This agent provides comprehensive company research for job seekers, helping them make informed decisions about job opportunities by researching funding, tech stack, employee reviews, recent news, and hiring managers.

---

## 🎯 Purpose

The Research Agent is a critical component of the Career-Ops pipeline that sits between job evaluation and CV generation. It provides deep intelligence about companies to help job seekers:

- Assess company financial health and stability
- Understand technology stacks and engineering practices
- Learn about company culture from employee reviews
- Track recent news and company momentum
- Identify hiring managers and networking opportunities

---

## 🚀 Quick Start

```bash
# Test the research tools
lua test

# Chat with the research agent
lua chat

# Deploy to production
lua push all --force --auto-deploy
```

---

## 📁 Project Structure

```
research/
├── src/
│   ├── index.ts                          # Agent configuration
│   ├── skills/
│   │   └── company-research.skill.ts     # Main research skill
│   └── tools/
│       ├── ComprehensiveResearchTool.ts  # Full research report
│       ├── FundingResearchTool.ts        # Funding & investors
│       ├── TechStackResearchTool.ts      # Technology analysis
│       ├── GlassdoorResearchTool.ts      # Employee reviews
│       ├── CompanyNewsResearchTool.ts    # Recent news
│       └── HiringManagerResearchTool.ts  # Team structure
├── lua.skill.yaml                        # Lua AI state file
├── package.json
└── tsconfig.json
```

---

## 🛠️ Research Tools

### 1. Comprehensive Company Research
**Tool**: `comprehensive_company_research`

Generates a complete research report including all sections below.

**Input**:
- `companyName` (required): Company name
- `jobTitle` (optional): Target role
- `jobDescription` (optional): Job description text

**Output**:
- Executive summary
- Funding analysis
- Tech stack overview
- Employee review summary
- Recent news highlights
- Hiring manager insights
- Recommendations and next steps

**Example**:
```typescript
{
  companyName: "Stripe",
  jobTitle: "Senior Software Engineer",
  jobDescription: "Build scalable payment systems..."
}
```

---

### 2. Funding Research
**Tool**: `research_company_funding`

Researches company funding rounds, investors, and financial backing.

**Output**:
- Funding stage (Seed, Series A/B/C, etc.)
- Total funding raised
- Recent funding rounds
- Investor list
- Valuation estimates
- Funding history

---

### 3. Tech Stack Research
**Tool**: `research_tech_stack`

Analyzes company's technology stack and engineering practices.

**Output**:
- Programming languages
- Frontend/backend frameworks
- Databases and data stores
- Cloud infrastructure
- DevOps tools
- Engineering culture insights

**Tip**: Provide job description to extract tech mentions automatically.

---

### 4. Glassdoor Reviews
**Tool**: `research_glassdoor_reviews`

Summarizes employee reviews and company culture.

**Output**:
- Overall ratings (work-life balance, culture, compensation)
- CEO approval rating
- Top pros and cons
- Interview experience insights
- Salary information
- Employee sentiment analysis

---

### 5. Company News
**Tool**: `research_company_news`

Tracks recent company news and momentum.

**Input**:
- `companyName` (required)
- `timeframe` (optional): "1month", "3months", "6months", "1year"

**Output**:
- Recent news articles
- Key highlights
- Company momentum assessment
- Sentiment analysis

---

### 6. Hiring Manager Research
**Tool**: `research_hiring_managers`

Identifies potential hiring managers and team structure.

**Output**:
- Potential hiring managers
- Team structure and size
- Engineering leadership
- Networking tips and opportunities

---

## 💬 Example Conversations

### Basic Research
```
User: Research Stripe for a Senior Backend Engineer role

Agent: I'll research Stripe comprehensively for you...

[Provides executive summary, funding status, tech stack, 
employee reviews, recent news, and recommendations]
```

### Detailed Deep Dive
```
User: Tell me more about Stripe's tech stack

Agent: Let me analyze Stripe's technology stack in detail...

[Provides detailed breakdown of languages, frameworks, 
databases, cloud infrastructure, and engineering culture]
```

### Hiring Manager Identification
```
User: Who would I be working with at Notion?

Agent: Let me research the engineering team at Notion...

[Provides potential managers, team structure, and 
networking strategies]
```

---

## 🔄 Integration with Career-Ops Pipeline

The Research Agent fits into the broader Career-Ops workflow:

```
Portal Scan → Job Evaluation → [RESEARCH AGENT] → CV Generation → Application
```

**Workflow**:
1. Jobs are scanned and evaluated (A-G scoring)
2. For high-scoring jobs, Research Agent provides deep company intelligence
3. Research insights inform CV tailoring and interview preparation
4. User makes informed decision about applying

---

## 📊 Research Output Format

All research tools return structured JSON that can be:
- Displayed to users in the chat interface
- Stored in the Company Research Folder
- Used by downstream agents (CV generation, interview prep)
- Exported as PDF reports

**Example Output Structure**:
```json
{
  "company": "Stripe",
  "researchDate": "2024-01-15T10:00:00Z",
  "executiveSummary": "...",
  "sections": {
    "funding": { ... },
    "techStack": { ... },
    "employeeReviews": { ... },
    "recentNews": { ... },
    "hiringManagers": { ... }
  },
  "recommendations": [...],
  "nextSteps": [...],
  "sources": [...]
}
```

---

## 🎨 Customization

### Adding New Research Sources

To add new research capabilities:

1. Create a new tool in `src/tools/`:
```typescript
import { LuaTool } from "lua-cli";
import { z } from "zod";

export default class NewResearchTool implements LuaTool {
    name = "research_new_source";
    description = "Research from new source";
    inputSchema = z.object({
        companyName: z.string()
    });
    
    async execute(input: any) {
        // Research logic here
        return { ... };
    }
}
```

2. Add to the skill in `src/skills/company-research.skill.ts`:
```typescript
import NewResearchTool from "../tools/NewResearchTool";

// Add to tools array
tools: [
    ...,
    new NewResearchTool()
]
```

3. Update the skill context to explain when to use the new tool.

---

## 🔌 API Integration (Production)

In production, replace simulated data with real API calls:

### Funding Research
- **Crunchbase API**: Company funding data
- **PitchBook API**: Private company intelligence
- **Company press releases**: Direct announcements

### Tech Stack
- **StackShare API**: Technology stack data
- **GitHub API**: Open source projects
- **Engineering blogs**: Web scraping
- **Job postings**: Tech mention extraction

### Reviews
- **Glassdoor API**: Employee reviews (if available)
- **Web scraping**: Review aggregation
- **Indeed/Comparably**: Alternative review sources

### News
- **Google News API**: Recent articles
- **NewsAPI**: News aggregation
- **Company RSS feeds**: Direct updates
- **Twitter API**: Social media monitoring

### Hiring Managers
- **LinkedIn API**: Profile data
- **Company org charts**: Structure analysis
- **GitHub**: Engineering team identification

---

## 📖 Essential Commands

| Command | Purpose |
|---------|---------|
| `lua test` | Test research tools interactively |
| `lua chat` | Chat with the research agent |
| `lua compile` | Compile TypeScript code |
| `lua push` | Upload to Lua AI platform |
| `lua deploy` | Deploy to production |
| `lua logs` | View execution logs |

---

## 🧪 Testing

Test individual research tools:

```bash
# Test comprehensive research
lua test
# Select: comprehensive_company_research
# Input: { companyName: "Stripe" }

# Test funding research
lua test
# Select: research_company_funding
# Input: { companyName: "Notion" }
```

Test via chat:

```bash
lua chat
> Research Stripe for a backend engineer role
> Tell me about Vercel's tech stack
> Who are the engineering managers at Linear?
```

---

## 🚀 Deployment

Deploy the research agent to production:

```bash
# Compile and push
lua push all --force

# Deploy to production
lua deploy

# Verify deployment
lua logs
```

---

## 📚 Learn More

- **Lua AI Documentation**: https://docs.heylua.ai
- **Career-Ops Main README**: ../../README.md
- **Main Plan**: ../../mainPlan.md

---

## 💡 Best Practices

1. **Start with comprehensive research** - Use the main tool first for overview
2. **Provide job descriptions** - Helps extract relevant tech stack info
3. **Cross-reference sources** - Verify critical information
4. **Respect rate limits** - When using real APIs in production
5. **Cache results** - Avoid redundant API calls
6. **Update regularly** - Company data changes frequently
7. **Acknowledge limitations** - Be transparent about data gaps

---

## 🤝 Contributing

To improve the research agent:

1. Add new research sources and tools
2. Enhance data aggregation logic
3. Improve sentiment analysis
4. Add more company profiles to simulated data
5. Integrate real APIs for production use

---

*Part of the Career-Ops AI-powered job search pipeline*
