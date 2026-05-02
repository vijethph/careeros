import * as fs from "fs";
import * as path from "path";
import { JobOffer, EvaluationResult, CVRequest, CVResult, CVOutputFormat } from "../types";

// ---------------------------------------------------------------------------
// CVAgent
// ---------------------------------------------------------------------------

/**
 * CVAgent
 *
 * Reads a master CV and a job offer (with its evaluation), then produces a
 * tailored version that:
 *
 *  - Reorders and reweights experience to match the role
 *  - Mirrors the job description's language for ATS optimisation
 *  - Inserts relevant proof points and metrics from the portfolio
 *  - Outputs clean HTML, LaTeX-compatible `.tex`, or plain Markdown
 *
 * The starter implementation provides a structural skeleton.  In production,
 * replace the `_generate*` methods with LLM calls via the Lua AI SDK.
 */
export class CVAgent {
  /**
   * Generate a tailored CV for the given offer and evaluation.
   *
   * @param request  All context needed for generation
   * @returns        A `CVResult` containing the output content as a string
   */
  async generate(request: CVRequest): Promise<CVResult> {
    const masterCV = this._loadMasterCV(request.masterCVPath);
    const keywords = this._extractKeywords(request.offer);

    let content: string;

    switch (request.outputFormat) {
      case "html":
        content = await this._generateHTML(masterCV, request.offer, request.evaluation, keywords);
        break;
      case "latex":
        content = await this._generateLaTeX(masterCV, request.offer, request.evaluation, keywords);
        break;
      case "markdown":
      default:
        content = await this._generateMarkdown(masterCV, request.offer, request.evaluation, keywords);
        break;
    }

    return {
      offerId: request.offer.id,
      format: request.outputFormat,
      content,
    };
  }

  // --------------------------------------------------------------------------
  // Private helpers
  // --------------------------------------------------------------------------

  private _loadMasterCV(masterCVPath: string): string {
    const resolved = path.resolve(masterCVPath);
    if (!fs.existsSync(resolved)) {
      throw new Error(`Master CV not found at: ${resolved}`);
    }
    return fs.readFileSync(resolved, "utf-8");
  }

  /**
   * Extract high-signal keywords from the job title and description.
   * In production this is done by an LLM; here we use a simple heuristic.
   */
  private _extractKeywords(offer: JobOffer): string[] {
    const stopWords = new Set([
      "and", "or", "the", "a", "an", "in", "of", "to", "for", "with",
      "on", "at", "by", "from", "is", "are", "you", "we", "our",
    ]);
    const text = `${offer.title} ${offer.description}`;
    const words = text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 3 && !stopWords.has(w));

    const freq: Map<string, number> = new Map();
    for (const word of words) {
      freq.set(word, (freq.get(word) ?? 0) + 1);
    }

    return Array.from(freq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([word]) => word);
  }

  private async _generateHTML(
    masterCV: string,
    offer: JobOffer,
    evaluation: EvaluationResult,
    keywords: string[]
  ): Promise<string> {
    const score = evaluation.overallScore;
    const keywordList = keywords.map((k) => `<li>${k}</li>`).join("\n      ");

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>CV – Tailored for ${offer.company}: ${offer.title}</title>
  <style>
    body { font-family: Georgia, serif; max-width: 800px; margin: 40px auto; line-height: 1.6; color: #222; }
    h1 { border-bottom: 2px solid #333; }
    .meta { color: #666; font-size: 0.9em; }
    .keywords { font-size: 0.85em; color: #555; }
    .section { margin-top: 2em; }
  </style>
</head>
<body>

  <!--
    ===================================================================
    TAILORED CV
    Role   : ${offer.title}
    Company: ${offer.company}
    Score  : ${score}/5
    Generated: ${new Date().toISOString()}
    ===================================================================

    TODO: Replace this skeleton with your actual CV content.
          The CVAgent will re-order and reweight each section below
          based on the role keywords and evaluation scores.
  -->

  <h1>[Your Name]</h1>
  <p class="meta">[Email] · [Phone] · [LinkedIn] · [GitHub]</p>

  <div class="section">
    <h2>Professional Summary</h2>
    <p>
      <!-- CVAgent will generate a targeted 2–3 sentence summary here,
           mirroring language from the job description. -->
      [Tailored summary for ${offer.title} at ${offer.company} will be generated here.]
    </p>
  </div>

  <div class="section">
    <h2>Experience</h2>
    <!-- CVAgent reorders and reweights experience blocks to surface
         the most relevant roles and proof points for this position. -->
    <p><em>[Experience sections from master CV — reweighted for this role]</em></p>
  </div>

  <div class="section">
    <h2>Skills</h2>
    <p class="keywords">
      Top keywords from job description (used for ATS optimisation):
    </p>
    <ul class="keywords">
      ${keywordList}
    </ul>
  </div>

  <div class="section">
    <h2>Education</h2>
    <p><em>[Education from master CV]</em></p>
  </div>

  <!--
    Master CV source (raw):
    ${masterCV.slice(0, 200)}…
  -->

</body>
</html>`;
  }

  private async _generateLaTeX(
    masterCV: string,
    offer: JobOffer,
    evaluation: EvaluationResult,
    keywords: string[]
  ): Promise<string> {
    const keywordList = keywords.map((k) => `  \\item ${k}`).join("\n");

    return `% ===================================================================
% TAILORED CV — LaTeX
% Role   : ${offer.title}
% Company: ${offer.company}
% Score  : ${evaluation.overallScore}/5
% Generated: ${new Date().toISOString()}
%
% TODO: Replace placeholder sections with content from your master CV.
%       The CVAgent re-orders \\section blocks based on role keywords.
% ===================================================================

\\documentclass[11pt,a4paper]{article}
\\usepackage[margin=2cm]{geometry}
\\usepackage{enumitem}
\\usepackage{hyperref}

\\begin{document}

\\begin{center}
  {\\Large \\textbf{[Your Name]}}\\\\[4pt]
  [Email] $\\cdot$ [Phone] $\\cdot$ [LinkedIn] $\\cdot$ [GitHub]
\\end{center}

\\section*{Professional Summary}
% CVAgent will generate a targeted summary here.
[Tailored summary for ${this._latexEscape(offer.title)} at ${this._latexEscape(offer.company)}.]

\\section*{Experience}
% CVAgent reorders experience blocks to surface the most relevant roles.
[Experience sections from master CV — reweighted for this role]

\\section*{Skills}
% Top ATS keywords extracted from the job description:
\\begin{itemize}[noitemsep]
${keywordList}
\\end{itemize}

\\section*{Education}
[Education from master CV]

\\end{document}
`;
  }

  private async _generateMarkdown(
    masterCV: string,
    offer: JobOffer,
    evaluation: EvaluationResult,
    keywords: string[]
  ): Promise<string> {
    const keywordList = keywords.map((k) => `- ${k}`).join("\n");

    return `<!-- Tailored CV — ${offer.title} @ ${offer.company} | Score: ${evaluation.overallScore}/5 | ${new Date().toISOString()} -->

# [Your Name]

[Email] · [Phone] · [LinkedIn] · [GitHub]

---

## Professional Summary

> TODO: Replace with a 2–3 sentence summary tailored for **${offer.title}** at **${offer.company}**.
> The CVAgent generates this by mirroring language from the job description.

---

## Experience

> TODO: The CVAgent reorders and reweights your experience blocks here,
> surfacing the most relevant roles and proof points for this position.

---

## Skills

Top ATS keywords extracted from the job description:

${keywordList}

---

## Education

> TODO: Add education from your master CV.

---

<!-- Master CV source preview: ${masterCV.slice(0, 120).replace(/\n/g, " ")}… -->
`;
  }

  /** Escape special LaTeX characters in a plain string. */
  private _latexEscape(text: string): string {
    return text
      .replace(/\\/g, "\\textbackslash{}")
      .replace(/[&%$#_{}]/g, (c) => `\\${c}`)
      .replace(/\^/g, "\\textasciicircum{}")
      .replace(/~/g, "\\textasciitilde{}");
  }
}
