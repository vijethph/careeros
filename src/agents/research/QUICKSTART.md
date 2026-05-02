# 🚀 Research Agent - Quick Start Guide

Get started with the Company Research Agent in 5 minutes.

---

## Step 1: Install Dependencies

```bash
cd src/agents/research
npm install
```

---

## Step 2: Test the Research Tools

```bash
lua test
```

You'll see a list of available tools:
- `comprehensive_company_research` - Full research report
- `research_company_funding` - Funding information
- `research_tech_stack` - Technology stack
- `research_glassdoor_reviews` - Employee reviews
- `research_company_news` - Recent news
- `research_hiring_managers` - Team structure

**Try it**:
1. Select `comprehensive_company_research`
2. Enter input:
```json
{
  "companyName": "Stripe",
  "jobTitle": "Senior Software Engineer"
}
```
3. Review the comprehensive research report!

---

## Step 3: Chat with the Agent

```bash
lua chat
```

**Example conversations**:

```
You: Research Stripe for a backend engineer position

Agent: [Provides comprehensive research including funding, 
tech stack, reviews, news, and recommendations]
```

```
You: Tell me about Notion's technology stack

Agent: [Provides detailed tech stack analysis]
```

```
You: Who are the engineering managers at Vercel?

Agent: [Provides hiring manager information and networking tips]
```

---

## Step 4: Integrate with Career-Ops Pipeline

The research agent is designed to work with the main Career-Ops pipeline:

```typescript
// In your main pipeline
import { ResearchAgent } from './agents/research';

// After job evaluation
const researchReport = await researchAgent.research({
  companyName: job.company,
  jobTitle: job.title,
  jobDescription: job.description
});

// Use research to tailor CV
const tailoredCV = await cvAgent.generate({
  masterCV,
  job,
  research: researchReport
});
```

---

## Step 5: Deploy to Production

```bash
# Compile TypeScript
lua compile

# Push to Lua AI platform
lua push all --force

# Deploy to production
lua deploy
```

---

## Common Use Cases

### 1. Research Before Applying
```
User: I'm considering applying to Linear. What should I know?

Agent: [Provides comprehensive research report with 
recommendations on whether to apply]
```

### 2. Interview Preparation
```
User: I have an interview with Figma next week. 
      What should I research?

Agent: [Provides tech stack, recent news, team structure, 
and suggested interview questions]
```

### 3. Salary Negotiation
```
User: What's the typical compensation at Coinbase?

Agent: [Provides Glassdoor salary insights and 
compensation structure]
```

### 4. Networking Strategy
```
User: How can I connect with engineers at Airbnb?

Agent: [Provides hiring manager info and networking tips]
```

---

## Customization

### Add Your Own Company Data

Edit the simulation data in each tool to add companies you're interested in:

**Example** - Add to `FundingResearchTool.ts`:
```typescript
const fundingProfiles = {
  "your-company": {
    stage: "Series B",
    totalFunding: "$50M",
    // ... more data
  }
};
```

### Connect Real APIs

Replace simulated data with real API calls:

```typescript
// In production
async execute(input: any) {
  const response = await fetch(
    `https://api.crunchbase.com/v4/entities/organizations/${input.companyName}`,
    {
      headers: {
        'X-cb-user-key': process.env.CRUNCHBASE_API_KEY
      }
    }
  );
  
  const data = await response.json();
  return this.formatFundingData(data);
}
```

---

## Troubleshooting

### Tool not found
```bash
# Recompile TypeScript
lua compile

# Push changes
lua push
```

### Agent not responding
```bash
# Check logs
lua logs

# Verify deployment
lua chat
```

### Need more detail
```bash
# Use specific research tools instead of comprehensive
lua test
# Select individual tools for deeper analysis
```

---

## Next Steps

1. ✅ Test all research tools
2. ✅ Chat with the agent
3. ✅ Integrate with main pipeline
4. ✅ Add real API integrations
5. ✅ Deploy to production

---

## Resources

- **Full README**: [README.md](./README.md)
- **Lua AI Docs**: https://docs.heylua.ai
- **Career-Ops Main**: [../../README.md](../../README.md)

---

**Ready to research companies like a pro!** 🔍
