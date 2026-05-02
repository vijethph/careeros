# Career-Ops on Lua AI

> An AI-powered job search pipeline built on [Lua AI](https://heylua.ai) — the Agent OS for enterprise-grade automation.

This project covers how to build a career-ops job search system on Lua AI: portal scanning, offer evaluation, CV generation, application tracking, interview prep, and more — all deployed as managed AI agents with zero infrastructure overhead.

---

## Why Lua AI

Running a job search well is a multi-agent problem. You need agents that scan portals on a schedule, evaluate job descriptions against your profile, generate tailored CVs, track application status, and prep you for interviews — all coordinated, all automated. Lua AI is purpose-built for exactly this kind of workflow.

| What you get | Why it matters for job search |
|---|---|
| Zero infrastructure | No servers to maintain. Agents run, scale, and recover automatically. |
| Cron scheduling | Scan job portals every few days without touching a keyboard. |
| Multi-channel output | Get new offer alerts on Slack, email, or your phone. |
| Multi-provider AI | Use Anthropic Claude for deep evaluation, Gemini for research, OpenAI for drafting — all in one pipeline. |
| TypeScript + Zod | Real type-safe agent code, not config files. |
| Webhooks | Trigger pipeline processing from GitHub, Notion, or any external tool. |
| SOC 2 / GDPR | Your CV and salary data stay compliant and protected. |

---

## Features

### 1. Automated Portal Scanning

`ScanAgent` hits Greenhouse, Ashby, and Lever APIs directly — zero LLM tokens spent on discovery. Schedule it with a cron job to run every 2–3 days and push new offers into your evaluation queue automatically.

```typescript
// Example: Scheduled scan every 3 days
export const scanAgent = new LuaAgent({
  name: "portal-scanner",
  schedule: "0 9 */3 * *", // 9am every 3 days
  handler: () => new ScanAgent({ filter }).run(),
});
```

**What it does:**
- Queries 45+ pre-configured companies across Greenhouse, Ashby, and Lever
- Applies keyword filters to match your target roles
- Deduplicates against previously seen offers
- Appends new matches to your evaluation queue

---

### 2. Offer Evaluation (A–G Scoring)

`EvaluationAgent` reads a job posting and scores it across six blocks:

| Block | What it evaluates |
|---|---|
| A — Role Fit | Title, seniority, scope vs. your profile |
| B — Company Quality | Stage, funding, team size, signal strength |
| C — Compensation | Base, equity, bonus vs. your target range |
| D — Location & Flexibility | Remote policy, timezone, travel expectations |
| E — Growth | Learning opportunity, career trajectory |
| F — Red Flags | Vague descriptions, unusual requirements, warning signs |
| G — Posting Legitimacy | Real role vs. ghost posting, freshness, recruiter credibility |

The agent outputs a structured score (0–5), a one-paragraph verdict, and a ranked list of reasons to apply or skip.

---

### 3. Tailored CV Generation

`CVAgent` reads your master CV and the evaluated job posting, then generates a tailored version that:

- Reorders and reweights your experience to match the role
- Mirrors the job description's language for ATS optimization
- Inserts relevant proof points and metrics from your portfolio
- Outputs clean HTML or LaTeX ready for PDF rendering

**Supported output formats:**
- `html` → ready for headless-browser → PDF rendering
- `latex` → Overleaf-compatible `.tex`
- `markdown` → plain text for quick review

---

## Project Structure

```
careeros/
├── src/
│   ├── index.ts                 # Pipeline entry point
│   ├── agents/
│   │   ├── scanAgent.ts         # Portal scanning (Greenhouse, Ashby, Lever)
│   │   ├── evaluationAgent.ts   # A–G offer scoring
│   │   └── cvAgent.ts           # Tailored CV generation
│   ├── tools/
│   │   ├── GreenhouseTool.ts    # Greenhouse Jobs API client
│   │   ├── AshbyTool.ts         # Ashby Posting API client
│   │   ├── LeverTool.ts         # Lever Posting API client
│   │   └── DeduplicateTool.ts   # In-memory deduplication
│   └── types/
│       └── index.ts             # Shared Zod schemas and TypeScript types
├── .env.example                 # Required environment variables
├── package.json
└── tsconfig.json
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- A [Lua AI](https://heylua.ai) account (for managed deployment)

### 1. Clone and install

```bash
git clone https://github.com/vijethph/careeros.git
cd careeros
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Fill in your Lua AI key and any portal API keys
```

### 3. Add your master CV

Create a `master-cv.md` file in the project root (or set `MASTER_CV_PATH` in `.env`):

```bash
echo "# [Your Name]\n\n## Experience\n..." > master-cv.md
```

### 4. Customise candidate profile

Open `src/index.ts` and update `CANDIDATE_PROFILE` with your target titles, seniority, salary range, and preferred locations.

### 5. Run the pipeline

```bash
npm run dev
```

The pipeline will scan configured portals, evaluate new offers, and generate tailored CVs for strong matches (score ≥ 3.5).

---

## Deploying to Lua AI

In production, each agent is registered as a managed `LuaAgent` on the Lua AI platform.  No servers required — agents run on Lua AI's infrastructure, scale automatically, and recover from failures.

```typescript
import { LuaAgent } from "@heylua/sdk";
import { ScanAgent } from "./agents/scanAgent";

export const portalScanner = new LuaAgent({
  name: "portal-scanner",
  schedule: "0 9 */3 * *",   // 9 am every 3 days
  handler: async (ctx) => {
    const agent = new ScanAgent({ filter: ctx.config.filter });
    return agent.run();
  },
});
```

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

---

## License

[MIT](LICENSE)
