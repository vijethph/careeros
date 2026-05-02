# 📊 Job Evaluation Agent

> AI-powered job evaluation using A-G scoring system - Part of the Career-Ops AI pipeline

This agent evaluates job postings objectively using a comprehensive A-G scoring system to help tech professionals make informed decisions about job opportunities.

---

## 🎯 Purpose

The Evaluation Agent is a critical component of the Career-Ops pipeline that sits between portal scanning and company research. It provides objective, data-driven assessments of job opportunities to help candidates prioritize their applications.

**Key Benefits:**
- Objective scoring across 7 evaluation blocks
- Data-driven decision making
- Time-saving prioritization
- Red flag identification
- Comprehensive analysis

---

## 🚀 Quick Start

```bash
# Test the evaluation tools
lua test

# Chat with the evaluation agent
lua chat

# Deploy to production
lua push all --force --auto-deploy
```

---

## 📁 Project Structure

```
evaluate/
├── src/
│   ├── index.ts                                    # Agent configuration
│   └── skills/
│       ├── job-evaluation.skill.ts                 # Main evaluation skill
│       └── tools/
│           ├── EvaluateJobTool.ts                  # Comprehensive evaluation
│           ├── RoleFitScoringTool.ts               # Block A: Role fit
│           ├── CompanyQualityScoringTool.ts        # Block B: Company quality
│           ├── CompensationScoringTool.ts          # Block C: Compensation
│           ├── LocationFlexibilityScoringTool.ts   # Block D: Location/flexibility
│           ├── GrowthOpportunityScoringTool.ts     # Block E: Growth opportunity
│           ├── RedFlagsScoringTool.ts              # Block F: Red flags
│           └── PostingLegitimacyScoringTool.ts     # Block G: Posting legitimacy
├── lua.skill.yaml                                  # Lua AI state file
├── package.json
└── tsconfig.json
```

---

## 🛠️ A-G Scoring System

### Scoring Scale (0-5)

| Score | Interpretation |
|-------|----------------|
| 5.0 | Excellent - exceeds expectations |
| 4.0-4.9 | Strong - meets/exceeds expectations |
| 3.0-3.9 | Good - acceptable, meets most criteria |
| 2.0-2.9 | Fair - below expectations, concerns |
| 1.0-1.9 | Poor - significant issues |
| 0.0-0.9 | Very poor - not recommended |

### Evaluation Blocks

#### **Block A — Role Fit** (0-5)
Evaluates how well the role matches the candidate's profile:
- Title alignment with target roles
- Skills match (required vs. candidate skills)
- Seniority level appropriateness
- Scope vs. experience match

**Output**: Score, matched skills, missing skills, seniority assessment

---

#### **Block B — Company Quality** (0-5)
Assesses the company as an employer:
- Company stage (startup, growth, established, public)
- Financial stability and funding
- Team size and organizational maturity
- Industry reputation and brand strength

**Output**: Score, company strengths, concerns

---

#### **Block C — Compensation** (0-5)
Evaluates the compensation package:
- Salary range vs. expectations
- Equity/stock options
- Benefits package
- Total compensation competitiveness

**Output**: Score, salary match, equity info, benefits highlights

---

#### **Block D — Location & Flexibility** (0-5)
Analyzes work location and flexibility:
- Remote/hybrid/onsite policy
- Timezone compatibility
- Relocation requirements
- Work-life balance indicators

**Output**: Score, work policy, timezone compatibility, relocation requirements

---

#### **Block E — Growth Opportunity** (0-5)
Assesses career development potential:
- Learning and development opportunities
- Career advancement potential
- Technology stack modernity
- Skill-building and mentorship

**Output**: Score, learning opportunities, career path clarity, tech stack modernity

---

#### **Block F — Red Flags** (0-5, inverted)
Identifies potential issues (5 = no red flags, 0 = many red flags):
- Vague or generic job description
- Unrealistic skill requirements
- Signs of high turnover
- Poor grammar or unprofessional language
- Ghost job indicators

**Output**: Score, list of red flags, severity assessment

---

#### **Block G — Posting Legitimacy** (0-5)
Verifies posting credibility:
- Posting freshness (recent vs. stale)
- Recruiter credibility
- Company verification
- Job description quality

**Output**: Score, freshness assessment, credibility indicators, concerns

---

## 💬 Example Usage

### Comprehensive Evaluation

```typescript
{
  jobTitle: "Senior Software Engineer",
  jobDescription: "We're looking for an experienced backend engineer...",
  companyName: "Stripe",
  location: "Remote (US)",
  salaryRange: "$180,000 - $220,000",
  postedDate: "2026-04-28",
  candidateProfile: {
    skills: ["Python", "Go", "PostgreSQL", "AWS", "Kubernetes"],
    experience: "7 years backend development",
    targetRoles: ["Senior Software Engineer", "Staff Engineer"],
    salaryExpectation: "$170,000 - $200,000",
    locationPreference: "Remote",
    careerGoals: "Technical leadership and system design"
  }
}
```

**Response**:
```json
{
  "overallScore": 4.5,
  "verdict": "Excellent opportunity with strong role fit and competitive compensation. Company is well-established with clear growth path. Minor concern about salary being slightly above expectation range, but within reach.",
  "scores": {
    "roleFit": 4.8,
    "companyQuality": 4.7,
    "compensation": 4.5,
    "locationFlexibility": 5.0,
    "growthOpportunity": 4.3,
    "redFlags": 4.9,
    "postingLegitimacy": 4.8
  },
  "reasons": {
    "toApply": [
      "Excellent skills match with 95% alignment",
      "Top-tier company with strong reputation",
      "Fully remote with flexible work policy",
      "Clear career growth path to Staff Engineer",
      "Competitive compensation with equity"
    ],
    "toSkip": [
      "Salary slightly above current expectation (stretch goal)"
    ]
  },
  "redFlags": [],
  "recommendations": [
    "Strongly recommend applying - excellent fit",
    "Prepare system design examples for interview",
    "Research Stripe's engineering culture and values",
    "Highlight distributed systems experience",
    "Negotiate for upper end of salary range"
  ]
}
```

---

### Individual Block Scoring

```bash
# Test role fit only
lua test
# Select: score_role_fit

# Test red flags only
lua test
# Select: score_red_flags
```

---

## 🔄 Integration with Career-Ops Pipeline

The Evaluation Agent fits into the broader Career-Ops workflow:

```
Portal Scan → [EVALUATION AGENT] → Company Research → CV Generation → Application
```

**Workflow**:
1. Jobs are scanned from portals (Greenhouse, Lever, Ashby)
2. Evaluation Agent scores each job using A-G system
3. High-scoring jobs (≥ 3.5) proceed to company research
4. Research insights + evaluation inform CV tailoring
5. User makes final decision about applying

---

## 📊 Overall Score Interpretation

| Overall Score | Recommendation |
|---------------|----------------|
| ≥ 4.0 | Excellent opportunity - strongly recommend applying |
| 3.5-3.9 | Good opportunity - recommend applying |
| 3.0-3.4 | Decent opportunity - apply if aligned with goals |
| 2.5-2.9 | Marginal opportunity - proceed with caution |
| < 2.5 | Poor opportunity - likely not worth pursuing |

---

## 🎨 Customization

### Adding New Evaluation Criteria

To add new evaluation criteria:

1. Create a new tool in `src/skills/tools/`:
```typescript
import { LuaTool, AI } from "lua-cli";
import { z } from "zod";

export default class NewCriteriaTool implements LuaTool {
    name = "score_new_criteria";
    description = "Score new evaluation criteria";
    inputSchema = z.object({
        // Define inputs
    });
    
    async execute(input: any) {
        // Scoring logic here
        return { score, analysis };
    }
}
```

2. Add to the skill in `src/skills/job-evaluation.skill.ts`:
```typescript
import NewCriteriaTool from "./tools/NewCriteriaTool";

tools: [
    ...,
    new NewCriteriaTool()
]
```

3. Update the skill context to explain when to use the new tool.

---

## 📖 Essential Commands

| Command | Purpose |
|---------|---------|
| `lua test` | Test evaluation tools interactively |
| `lua chat` | Chat with the evaluation agent |
| `lua compile` | Compile TypeScript code |
| `lua push` | Upload to Lua AI platform |
| `lua deploy` | Deploy to production |
| `lua logs` | View execution logs |

---

## 🧪 Testing

Test individual evaluation tools:

```bash
# Test comprehensive evaluation
lua test
# Select: evaluate_job_posting
# Input: { jobTitle: "...", jobDescription: "...", ... }

# Test role fit scoring
lua test
# Select: score_role_fit
# Input: { jobTitle: "...", candidateSkills: [...], ... }
```

Test via chat:

```bash
lua chat
> Evaluate this job: Senior Engineer at Stripe, remote, $180k-220k
> Score the role fit for a backend engineer with 7 years experience
> Check for red flags in this job description: [paste description]
```

---

## 🚀 Deployment

Deploy the evaluation agent to production:

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

1. **Always provide complete candidate profile** - Better matching requires complete data
2. **Use comprehensive evaluation first** - Get the full picture before diving into details
3. **Consider all blocks together** - Don't focus on just one aspect
4. **Pay attention to red flags** - Even high scores can have deal-breakers
5. **Verify during interviews** - Use evaluation as a guide, not absolute truth
6. **Update candidate profile regularly** - Keep skills and preferences current
7. **Combine with company research** - Evaluation + research = complete picture

---

## 🤝 Contributing

To improve the evaluation agent:

1. Refine scoring algorithms based on feedback
2. Add new evaluation criteria
3. Improve AI prompts for better accuracy
4. Add more detailed analysis
5. Integrate with external data sources (Glassdoor, Levels.fyi, etc.)

---

*Part of the Career-Ops AI-powered job search pipeline*
