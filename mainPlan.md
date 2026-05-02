# **Career-Ops on Lua AI: End-to-End AI Job Search System**

> **An AI-powered job search + CV-tailoring pipeline built on Lua AI — the Agent OS for enterprise-grade automation.**

This document describes a full multi-agent job search workflow including CV analysis, portal scanning, company research, offer scoring, ATS-friendly CV generation (LaTeX), preview/revision flow, and interview prep — all automated through Lua AI.

It also includes a complete flowchart, implementation plan, and a 5-person task division for a team.

---

# **1. Why Lua AI**

Job searching is a multi-agent orchestration problem:

* scan portals regularly
* evaluate job descriptions
* research companies
* match requirements to your CV
* generate tailored CVs
* track applications
* prepare for interviews

Lua AI is built for exactly this.

| What Lua AI Provides | Why It Matters                                      |
| -------------------- | --------------------------------------------------- |
| Zero infrastructure  | Agents run, scale, and recover automatically        |
| Cron scheduling      | Automate portal scans every 2–3 days                |
| Multi-provider AI    | Use Claude, OpenAI, Gemini, and Perplexity together |
| TypeScript + Zod     | Strongly typed agent logic                          |
| Webhooks             | Trigger processing from external tools              |
| SOC 2 / GDPR         | Safe for CVs, salary data, personal info            |

---

# **2. System Features**

## **2.1 CV Intake + Analysis Layer (Layer 1)**

### **Inputs**

* Upload CV (PDF/TXT)
* Parse → structured skills, experiences, metrics

### **Processing**

* Extract skills using LLM + deterministic parsers
* Score experience depth
* Map skills to target industries
* Store results in a **CV Profile Folder**

### **Outputs**

* User CV profile (JSON)
* Ranked list of relevant companies
* Feedback notes about improvement areas

---

## **2.2 Portal Scanning (Career-Ops Integration)**

We integrate with the open-source tool:
🔗 [https://github.com/santifer/career-ops](https://github.com/santifer/career-ops)

### **ScanAgent capabilities**

* Query Greenhouse, Lever, Ashby APIs
* Run every 3 days (cron)
* Apply filters based on CV’s skills
* Deduplicate results
* Store the job list in *JobQueue* folder

```ts
schedule: "0 9 */3 * *"
```

---

## **2.3 Job Offer Evaluation (A–G Scoring)**

Each job is scored across seven blocks:

| Block                    | Purpose                   |
| ------------------------ | ------------------------- |
| A — Role Fit             | Skills + experience match |
| B — Company Quality      | Stage, funding, team      |
| C — Compensation         | Expected range match      |
| D — Location/Flexibility | Remote? Hybrid? Timezone? |
| E — Growth               | Career trajectory         |
| F — Red Flags            | Ghost jobs, vague JD      |
| G — Posting Legitimacy   | Freshness, credibility    |

Output is structured JSON + PDF report.

---

## **2.4 Deep Company Research**

Before generating the CV, the system does:

* Funding round check
* Tech stack reconstruction
* Glassdoor analysis
* Recent news summary
* Hiring manager identification

This is delivered in the **Company Research Folder**.

---

## **2.5 Two-Layer CV Generation (Layer 2)**

### **Layer 2 Workflow**

1. User selects a company from evaluated list
2. System **re-checks** alignment between JD and CV
3. System applies CV improvement comments
4. Preview of ATS-friendly CV is shown
5. User accepts or requests adjustments
6. Final CV is generated in **LaTeX**

### **Outputs**

* ATS-optimised CV (LaTeX download)
* Optional PDF render
* Tailored CV stored per company

---

## **2.6 Application Tracker**

Logged fields:

| Field   | Example                         |
| ------- | ------------------------------- |
| ID      | 00021                           |
| Date    | 2026-05-01                      |
| Company | Acme Corp                       |
| Role    | Senior Engineer                 |
| Score   | 4.3/5                           |
| Status  | Evaluated → Applied → Interview |
| Notes   | Link to CV + research           |

Status updates automatically.

---

## **2.7 Interview Preparation Agent**

Generates:

* Expected interview structure
* Technical topics
* STAR/STAR+R story bank from CV
* Questions for hiring manager

---

## **2.8 Multi-channel Delivery**

* Slack (alerts + pipeline summary)
* Email (weekly digest)
* Web widget (paste a job URL → full pipeline runs)
* WhatsApp/Messenger mobile notifications

---

# **3. Flowchart (Full Pipeline)**

```
               ┌────────────────────┐
               │   Upload CV File   │
               └─────────┬──────────┘
                         ▼
               ┌────────────────────┐
               │   CV Analysis      │
               │ Extract skills     │
               │ Identify domains   │
               └─────────┬──────────┘
                         ▼
               ┌────────────────────┐
               │ Relevant Company   │
               │ List Generation    │
               └─────────┬──────────┘
                         ▼
               ┌────────────────────┐
               │  Portal Scanning   │
               │ (Career-Ops)       │
               └─────────┬──────────┘
                         ▼
               ┌────────────────────┐
               │ Job Evaluation     │
               │ A–G Scoring        │
               └─────────┬──────────┘
                         ▼
               ┌────────────────────┐
               │ Company Research   │
               └─────────┬──────────┘
                         ▼
               ┌──────────────────────────┐
               │ Pre-CV Check & Feedback  │
               └─────────┬───────────────┘
                         ▼
               ┌──────────────────────────┐
               │ ATS CV Preview (Layer 2) │
               └─────────┬───────────────┘
                         ▼
          ┌──────────────┴───────────────┐
          ▼                                ▼
┌────────────────────▲───────────┐   ┌────────────────────┐
│ User requests edits│           │   │  Final CV (LaTeX)   │
└─────────┬──────────┴───────────┘   └────────────────────┘
          │
          ▼
 ┌────────────────────┐
 │ Regenerate Preview │
 └────────────────────┘

```

---

# **4. Implementation Plan**

## **Phase 1 — System Core (Week 1–2)**

* CV intake + parsing
* Skills extraction + CV profile structure
* Company list generator
* CareerOps integration + scanning agent
* Queue system for offers

## **Phase 2 — Evaluation + Research (Week 3–4)**

* A–G scoring agent
* Company research agent
* Store research outputs

## **Phase 3 — Two-Layer CV Generator (Week 5–6)**

* Pre-CV JD comparison + feedback pass
* ATS CV template (LaTeX)
* Preview engine (HTML → PDF)
* Final LaTeX export

## **Phase 4 — Tracker + Interview Prep (Week 7–8)**

* Application tracker storage
* Tracker UI/API
* Interview preparation agent

## **Phase 5 — Multi-channel Delivery + QA (Week 9–10)**

* Slack, email, web widget
* Integration testing
* Cron scheduling
* Pipeline automation

---

# **5. Team of 5 – Task Assignment**

| Member                                                 | Responsibilities                                                           |
| ------------------------------------------------------ | -------------------------------------------------------------------------- |
| **Person 1 – CV & Skills Pipeline Lead**               | CV parsing, skill extraction, user profile folder, A–G scoring integration |
| **Person 2 – Portal Scanning & Queue Lead**            | CareerOps integration, ScanAgent, dedupe logic, cron scheduling            |
| **Person 3 – Evaluation & Research Lead**              | Offer scoring algorithms, company research agent, data enrichment          |
| **Person 4 – CV Generation & Preview Lead**            | Two-layer CV workflow, LaTeX templates, preview UI, feedback loop          |
| **Person 5 – Tracker, UX, Delivery Integrations Lead** | Application tracker, user portal, Slack/email integrations, interview prep |

---

# **6. Final Architecture Overview**

```
CV Intake → CV Analysis → Portal Scan → Evaluation → Research
       → Pre-CV Check → ATS CV Preview → Final CV (LaTeX)
       → Tracker → Interview Prep → Notifications
```

Everything runs on Lua AI with typed agents, cron automation, and multi-provider AI.

---

# **End of Document**

