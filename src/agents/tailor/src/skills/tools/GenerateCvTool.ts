import { z } from 'zod';
import { AI, Data, CDN } from 'lua-cli';

const inputSchema = z.object({
  jobDescription: z.string().describe('The full job description text'),
  jobScore: z.number().optional().describe('Optional A–F match score from the evaluation agent'),
  revisionRequest: z.string().optional().describe('Changes to apply if iterating on a previous draft'),
});

type Input = z.infer<typeof inputSchema>;

export interface GenerateCvResult {
  latex: string;
  fileId: string;
  warnings: string[];
}

const COLLECTION = 'cv_profile';

const SYSTEM_PROMPT = `You are an expert CV writer specialised in ATS-optimised CVs for the Irish tech job market.

You will receive a candidate CV profile and a job description. In one pass:
1. Identify what to emphasise, downplay, and address (gap analysis)
2. Generate a complete, compilable LaTeX CV tailored to that specific role

Return ONLY a JSON object — no prose, no markdown fences.

## Irish Market Context
Key employers: Google Dublin, Stripe, Intercom, HubSpot, Workday, Fenergo, Workhuman, Version 1, Mastercard Dublin
Salary benchmarks: Junior €45k–€65k | Mid €65k–€90k | Senior €90k–€120k | Lead €120k–€160k
Irish/EU CV norms: 1–2 pages, no photo, no date of birth, results-focused bullets, quantify achievements
Flag Critical Skills Employment Permit (CSEP) considerations in warnings if visa sponsorship may be relevant.

## LaTeX Requirements
- Use only standard TeX Live packages: geometry, hyperref, enumitem, titlesec, parskip, fontenc, inputenc, xcolor
- Single-column layout, clean and professional, A4 paper
- Sections in order: Contact Info, Professional Summary, Experience, Skills, Education, Projects (optional)
- Experience bullets start with strong action verbs; include metrics where available
- No photos, no graphics, no tables — pure semantic LaTeX for ATS compatibility
- Must compile cleanly with pdflatex

## LaTeX document skeleton
\\documentclass[11pt,a4paper]{article}
\\usepackage[a4paper, margin=2cm]{geometry}
\\usepackage[T1]{fontenc}
\\usepackage[utf8]{inputenc}
\\usepackage{enumitem}
\\usepackage{titlesec}
\\usepackage{parskip}
\\usepackage[hidelinks]{hyperref}
\\usepackage{xcolor}

\\begin{document}
% \\begin{center} name, contact \\end{center}
% \\section*{Professional Summary} ...
% \\section*{Experience} ...
% \\section*{Skills} ...
% \\section*{Education} ...
\\end{document}

## Output schema (strict JSON, no extra keys)
{
  "latex":    string,    // complete LaTeX document — must compile with pdflatex
  "warnings": string[]   // gaps or tailoring notes that could not be fully addressed
}`;

export class GenerateCvTool {
  name = 'generate_cv';
  description =
    'Generates a tailored LaTeX CV for a given job description using the stored CV profile. Returns the LaTeX source and uploads a .tex file to the Lua CDN.';
  inputSchema = inputSchema;

  async execute(input: Input): Promise<GenerateCvResult> {
    // Fetch stored CV profile
    let cvProfile: string;
    try {
      const entries = await Data.get(COLLECTION, {}, 1, 1);
      if (!entries || entries.data.length === 0) {
        throw new Error(
          'No CV profile found. Ask the candidate to run save_cv_profile first.',
        );
      }
      cvProfile = entries.data[0].data.cvProfile as string;
    } catch (err) {
      throw new Error(`generate_cv: could not retrieve CV profile — ${(err as Error).message}`);
    }

    const userContent = [
      `## CV Profile (JSON)\n${cvProfile}`,
      `## Job Description\n${input.jobDescription}`,
      input.jobScore !== undefined
        ? `## Job Match Score\n${input.jobScore} (from evaluation agent)`
        : null,
      input.revisionRequest
        ? `## Revision Request\nApply these changes to the previous draft:\n${input.revisionRequest}`
        : null,
    ]
      .filter(Boolean)
      .join('\n\n');

    // Generate LaTeX
    let responseText: string;
    try {
      responseText = await AI.generate(SYSTEM_PROMPT, [
        { type: 'text', text: userContent },
      ]);
    } catch (err) {
      throw new Error(`generate_cv: AI.generate failed — ${(err as Error).message}`);
    }

    let latex: string;
    let warnings: string[];
    try {
      const cleaned = responseText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
      const parsed = JSON.parse(cleaned) as { latex: string; warnings: string[] };
      latex = parsed.latex;
      warnings = parsed.warnings ?? [];
    } catch {
      throw new Error(
        `generate_cv: response was not valid JSON.\nRaw response (first 500 chars):\n${responseText.slice(0, 500)}`,
      );
    }

    // Upload .tex file to CDN
    let fileId: string;
    try {
      const file = new File([latex], 'cv.tex', { type: 'text/plain' });
      fileId = await CDN.upload(file);
    } catch (err) {
      throw new Error(`generate_cv: CDN upload failed — ${(err as Error).message}`);
    }

    return { latex, fileId, warnings };
  }
}
