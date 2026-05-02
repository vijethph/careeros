# 🧪 Research Agent - Testing Guide

Complete guide for testing the Company Research Agent.

---

## Quick Test Commands

```bash
# Test individual tools
lua test

# Chat with agent
lua chat

# Compile TypeScript
lua compile

# View logs
lua logs
```

---

## 1. Testing Individual Tools

### Test Comprehensive Research

```bash
lua test
```

**Select**: `comprehensive_company_research`

**Input**:
```json
{
  "companyName": "Stripe",
  "jobTitle": "Senior Software Engineer",
  "jobDescription": "Build scalable payment systems using Go and PostgreSQL"
}
```

**Expected Output**:
- Executive summary
- Funding analysis
- Tech stack overview
- Employee review summary
- Recent news highlights
- Hiring manager insights
- Recommendations
- Next steps

---

### Test Funding Research

**Select**: `research_company_funding`

**Input**:
```json
{
  "companyName": "Vercel"
}
```

**Expected Output**:
- Funding stage
- Total funding raised
- Last round details
- Investor list
- Valuation
- Funding history

---

### Test Tech Stack Research

**Select**: `research_tech_stack`

**Input**:
```json
{
  "companyName": "Notion",
  "jobDescription": "Experience with React, TypeScript, and PostgreSQL required"
}
```

**Expected Output**:
- Primary languages
- Frontend technologies
- Backend technologies
- Databases
- Cloud infrastructure
- DevOps tools
- Engineering culture
- Extracted tech from job description

---

### Test Glassdoor Reviews

**Select**: `research_glassdoor_reviews`

**Input**:
```json
{
  "companyName": "Linear"
}
```

**Expected Output**:
- Overall rating
- Category ratings (work-life, culture, etc.)
- CEO approval
- Top pros and cons
- Interview experience
- Salary insights
- Sentiment analysis

---

### Test Company News

**Select**: `research_company_news`

**Input**:
```json
{
  "companyName": "OpenAI",
  "timeframe": "3months"
}
```

**Expected Output**:
- Recent news articles
- Key highlights
- Sentiment analysis
- Momentum assessment
- Sources

---

### Test Hiring Manager Research

**Select**: `research_hiring_managers`

**Input**:
```json
{
  "companyName": "Figma",
  "role": "Backend Engineer"
}
```

**Expected Output**:
- Potential managers
- Team structure
- Engineering leadership
- Networking tips
- Sources

---

## 2. Testing via Chat

### Basic Research Query

```bash
lua chat
```

**Conversation**:
```
You: Research Stripe for a backend engineer position

Agent: I'll research Stripe comprehensively for you...

[Agent provides full research report]

You: Tell me more about their tech stack

Agent: Let me analyze Stripe's technology stack in detail...

[Agent provides detailed tech stack analysis]
```

---

### Multi-Company Comparison

```
You: Compare Stripe and Coinbase for a payments engineer role

Agent: I'll research both companies for you...

[Agent researches both and provides comparison]
```

---

### Specific Deep Dive

```
You: What do employees say about working at Notion?

Agent: Let me check Glassdoor reviews for Notion...

[Agent provides detailed review analysis]
```

---

### Networking Strategy

```
You: I want to apply to Vercel. Who should I connect with?

Agent: Let me research the engineering team at Vercel...

[Agent provides hiring manager info and networking tips]
```

---

## 3. Testing with Real Job Data

Use the sample jobs from `src/workspace/jobs.json`:

```bash
lua chat
```

**Test with Job #1 (Stripe)**:
```
You: Research the company for this job:
{
  "title": "Senior Software Engineer, Platform",
  "company": "Stripe",
  "description": "Build scalable APIs and services..."
}

Agent: [Provides comprehensive research for Stripe]
```

**Test with Job #2 (Vercel)**:
```
You: I'm considering this role at Vercel. What should I know?
{
  "title": "Staff Software Engineer, Frontend",
  "company": "Vercel",
  "description": "Lead frontend initiatives..."
}

Agent: [Provides research with focus on frontend engineering]
```

---

## 4. Integration Testing

### Test with CV Data

```bash
lua chat
```

```
You: I have this CV: [paste from src/workspace/cv.json]
    And I'm interested in this job at Stripe: [paste job details]
    Should I apply?

Agent: [Analyzes CV-job fit and provides research-backed recommendation]
```

---

### Test Pipeline Integration

```typescript
// In your test script
import { ResearchAgent } from './agents/research';

const job = {
  company: "Stripe",
  title: "Senior Software Engineer",
  description: "..."
};

const research = await researchAgent.research({
  companyName: job.company,
  jobTitle: job.title,
  jobDescription: job.description
});

console.log(research);
```

---

## 5. Edge Case Testing

### Unknown Company

**Input**:
```json
{
  "companyName": "UnknownStartup123"
}
```

**Expected**: Graceful handling with "Information not available" message

---

### Missing Optional Fields

**Input**:
```json
{
  "companyName": "Stripe"
}
```

**Expected**: Works without optional fields (jobTitle, jobDescription)

---

### Invalid Timeframe

**Input**:
```json
{
  "companyName": "Stripe",
  "timeframe": "invalid"
}
```

**Expected**: Defaults to "3months" or shows validation error

---

## 6. Performance Testing

### Response Time

```bash
time lua test
# Select comprehensive_company_research
# Measure execution time
```

**Expected**: < 2 seconds for simulated data

---

### Concurrent Requests

```typescript
// Test multiple companies simultaneously
const companies = ["Stripe", "Vercel", "Notion", "Linear"];

const results = await Promise.all(
  companies.map(company => 
    researchAgent.research({ companyName: company })
  )
);
```

**Expected**: All complete successfully

---

## 7. Output Validation

### Check JSON Structure

```typescript
const result = await researchAgent.research({
  companyName: "Stripe"
});

// Validate structure
assert(result.company === "Stripe");
assert(result.executiveSummary);
assert(result.sections.funding);
assert(result.sections.techStack);
assert(result.sections.employeeReviews);
assert(result.sections.recentNews);
assert(result.sections.hiringManagers);
assert(Array.isArray(result.recommendations));
assert(Array.isArray(result.nextSteps));
```

---

### Check Data Quality

```typescript
// Funding data
assert(result.sections.funding.stage);
assert(result.sections.funding.totalFunding);

// Tech stack
assert(Array.isArray(result.sections.techStack.languages));
assert(result.sections.techStack.languages.length > 0);

// Reviews
assert(typeof result.sections.employeeReviews.overallRating === 'number');
assert(result.sections.employeeReviews.overallRating >= 0);
assert(result.sections.employeeReviews.overallRating <= 5);
```

---

## 8. Error Handling Testing

### Network Failure Simulation

```typescript
// Mock API failure
jest.mock('fetch', () => ({
  fetch: jest.fn(() => Promise.reject(new Error('Network error')))
}));

const result = await researchAgent.research({
  companyName: "Stripe"
});

// Should return error with suggestion
assert(result.error);
assert(result.suggestion);
```

---

### Timeout Testing

```typescript
// Set short timeout
const result = await researchAgent.research(
  { companyName: "Stripe" },
  { timeout: 100 }
);

// Should handle timeout gracefully
```

---

## 9. Regression Testing

### Test All Companies

```bash
# Test all pre-configured companies
for company in "Stripe" "Vercel" "Notion" "Linear" "Figma" "OpenAI"
do
  echo "Testing $company..."
  lua test --input "{\"companyName\": \"$company\"}"
done
```

---

### Test All Tools

```bash
# Test each tool individually
lua test --tool comprehensive_company_research
lua test --tool research_company_funding
lua test --tool research_tech_stack
lua test --tool research_glassdoor_reviews
lua test --tool research_company_news
lua test --tool research_hiring_managers
```

---

## 10. User Acceptance Testing

### Scenario 1: Job Seeker Research

**User Story**: As a job seeker, I want to research a company before applying.

**Test**:
```
1. User provides company name
2. Agent provides comprehensive research
3. User can ask follow-up questions
4. Agent provides detailed answers
```

**Success Criteria**:
- ✅ Research is comprehensive
- ✅ Information is accurate
- ✅ Recommendations are actionable
- ✅ Sources are cited

---

### Scenario 2: Interview Preparation

**User Story**: As a candidate, I want to prepare for an interview.

**Test**:
```
1. User mentions upcoming interview
2. Agent researches company
3. Agent provides interview-specific insights
4. Agent suggests questions to ask
```

**Success Criteria**:
- ✅ Recent news included
- ✅ Tech stack detailed
- ✅ Team structure explained
- ✅ Questions suggested

---

### Scenario 3: Salary Negotiation

**User Story**: As a candidate, I want to understand fair compensation.

**Test**:
```
1. User asks about compensation
2. Agent provides Glassdoor salary data
3. Agent explains equity and benefits
4. Agent provides negotiation context
```

**Success Criteria**:
- ✅ Salary ranges provided
- ✅ Equity explained
- ✅ Benefits listed
- ✅ Context given

---

## 11. Automated Testing

### Unit Tests

```typescript
// test/tools/FundingResearchTool.test.ts
describe('FundingResearchTool', () => {
  it('should return funding data for known company', async () => {
    const tool = new FundingResearchTool();
    const result = await tool.execute({ companyName: 'Stripe' });
    
    expect(result.company).toBe('Stripe');
    expect(result.fundingStage).toBeDefined();
    expect(result.totalFunding).toBeDefined();
  });
  
  it('should handle unknown company gracefully', async () => {
    const tool = new FundingResearchTool();
    const result = await tool.execute({ companyName: 'Unknown' });
    
    expect(result.fundingStage).toBe('Unknown');
  });
});
```

---

### Integration Tests

```typescript
// test/integration/research-pipeline.test.ts
describe('Research Pipeline', () => {
  it('should complete full research workflow', async () => {
    const job = loadJobFromFile('workspace/jobs.json', 0);
    const research = await researchAgent.research({
      companyName: job.company,
      jobTitle: job.title,
      jobDescription: job.description
    });
    
    expect(research.executiveSummary).toBeDefined();
    expect(research.recommendations.length).toBeGreaterThan(0);
  });
});
```

---

## 12. Checklist

### Before Deployment

- [ ] All tools tested individually
- [ ] Chat interface tested
- [ ] Edge cases handled
- [ ] Error messages clear
- [ ] Output format validated
- [ ] Performance acceptable
- [ ] Documentation complete
- [ ] Examples working

### Production Readiness

- [ ] Real API integrations tested
- [ ] Rate limiting implemented
- [ ] Caching working
- [ ] Monitoring set up
- [ ] Error tracking enabled
- [ ] Logs configured
- [ ] Backup plan ready

---

## 13. Troubleshooting

### Tool Not Found

```bash
# Recompile
lua compile

# Push changes
lua push

# Verify
lua test
```

---

### Incorrect Output

```bash
# Check logs
lua logs

# Test specific tool
lua test --tool [tool-name]

# Verify input format
```

---

### Agent Not Responding

```bash
# Check agent status
lua status

# Restart agent
lua deploy

# Check logs
lua logs --tail
```

---

## 14. Test Data

### Sample Companies

Pre-configured companies with full data:
- Stripe
- Vercel
- Notion
- Linear
- Figma
- Retool
- Coinbase
- Airbnb
- Shopify
- Netflix
- GitHub
- OpenAI

### Sample Jobs

Located in: `src/workspace/jobs.json`

### Sample CV

Located in: `src/workspace/cv.json`

---

## 15. Next Steps

After testing:

1. ✅ Verify all tests pass
2. ✅ Document any issues
3. ✅ Fix bugs found
4. ✅ Re-test after fixes
5. ✅ Deploy to staging
6. ✅ User acceptance testing
7. ✅ Deploy to production

---

**Happy Testing!** 🧪

For questions or issues, refer to:
- [README.md](./README.md)
- [QUICKSTART.md](./QUICKSTART.md)
- [IMPLEMENTATION.md](./IMPLEMENTATION.md)
