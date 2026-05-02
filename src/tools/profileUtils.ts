import { execFile } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { v4 as uuidv4 } from "uuid";
import {
  ParsedCv,
  ParsedCvBasics,
  ParsedCvEducationItem,
  ParsedCvExperienceItem,
  ParsedCvProjectItem,
  ProfileFeatures,
  Skill,
  SkillType,
  UserProfile,
} from "../types";

const execFileAsync = promisify(execFile);

const KNOWN_SKILLS: ReadonlyArray<string> = [
  "python",
  "javascript",
  "typescript",
  "java",
  "c++",
  "c#",
  "go",
  "ruby",
  "php",
  "swift",
  "kotlin",
  "rust",
  "sql",
  "react",
  "vue",
  "angular",
  "svelte",
  "next.js",
  "nuxt",
  "node.js",
  "express",
  "nestjs",
  "django",
  "flask",
  "fastapi",
  "spring",
  "laravel",
  "aws",
  "gcp",
  "azure",
  "docker",
  "kubernetes",
  "terraform",
  "git",
  "github",
  "gitlab",
  "jenkins",
  "ci/cd",
  "postgres",
  "postgresql",
  "mysql",
  "redis",
  "mongodb",
  "rabbitmq",
  "kafka",
  "graphql",
  "rest",
  "linux",
  "bash",
  "machine learning",
  "data science",
  "nlp",
  "computer vision",
  "devops",
  "frontend",
  "backend",
  "full stack",
  "security",
  "fintech",
  "healthcare",
  "leadership",
  "communication",
  "mentoring",
  "collaboration",
  "project management",
  "agile",
  "scrum",
];

const SKILL_TYPE_MAP: Record<string, SkillType> = {
  python: "language",
  javascript: "language",
  typescript: "language",
  java: "language",
  "c++": "language",
  "c#": "language",
  go: "language",
  ruby: "language",
  php: "language",
  swift: "language",
  kotlin: "language",
  rust: "language",
  sql: "language",
  react: "framework",
  vue: "framework",
  angular: "framework",
  svelte: "framework",
  "next.js": "framework",
  nuxt: "framework",
  "node.js": "framework",
  express: "framework",
  nestjs: "framework",
  django: "framework",
  flask: "framework",
  fastapi: "framework",
  spring: "framework",
  laravel: "framework",
  aws: "tool",
  gcp: "tool",
  azure: "tool",
  docker: "tool",
  kubernetes: "tool",
  terraform: "tool",
  git: "tool",
  github: "tool",
  gitlab: "tool",
  jenkins: "tool",
  "ci/cd": "tool",
  postgres: "tool",
  postgresql: "tool",
  mysql: "tool",
  redis: "tool",
  mongodb: "tool",
  rabbitmq: "tool",
  kafka: "tool",
  graphql: "tool",
  rest: "tool",
  linux: "tool",
  bash: "tool",
  "machine learning": "domain",
  "data science": "domain",
  nlp: "domain",
  "computer vision": "domain",
  devops: "domain",
  frontend: "domain",
  backend: "domain",
  "full stack": "domain",
  security: "domain",
  fintech: "domain",
  healthcare: "domain",
  leadership: "soft",
  communication: "soft",
  mentoring: "soft",
  collaboration: "soft",
  "project management": "soft",
  agile: "soft",
  scrum: "soft",
};

type UserState = {
  profile?: UserProfile;
  lastParsedCv?: ParsedCv;
  skills?: Skill[];
};

type CvLink = NonNullable<ParsedCvBasics["links"]>[number];

let memoryUserState: UserState = {};

export async function getUserState(): Promise<{
  state: UserState;
  save: () => Promise<void>;
}> {
  const globalUser = (
    globalThis as {
      User?: { get: () => Promise<UserState & { save?: () => Promise<void> }> };
    }
  ).User;

  if (globalUser?.get) {
    const user = await globalUser.get();
    const save = user.save?.bind(user) ?? (async () => undefined);
    return { state: user, save };
  }

  const state = memoryUserState;
  return {
    state,
    save: async () => {
      memoryUserState = state;
    },
  };
}

export async function writeJsonFile(
  fileName: string,
  payload: unknown,
): Promise<void> {
  const dataDir = path.resolve(process.cwd(), "data");
  await mkdir(dataDir, { recursive: true });
  const targetPath = path.join(dataDir, fileName);
  await writeFile(targetPath, JSON.stringify(payload, null, 2), "utf-8");
}

export async function loadCvText(inputPath: string): Promise<string> {
  const resolvedPath = path.resolve(inputPath);
  const extension = path.extname(resolvedPath).toLowerCase();

  if (extension === ".pdf") {
    try {
      const { stdout } = await execFileAsync("pdftotext", [
        "-layout",
        resolvedPath,
        "-",
      ]);
      return stdout.toString();
    } catch (error) {
      const buffer = await readFile(resolvedPath);
      const extracted = extractTextFromPdfBuffer(buffer);
      if (!extracted.trim()) {
        const message =
          error instanceof Error ? error.message : "pdftotext failed";
        throw new Error(`PDF extraction failed: ${message}`);
      }
      return extracted;
    }
  }

  return readFile(resolvedPath, "utf-8");
}

export function loadCvTextFromBase64(base64: string): string {
  const buffer = Buffer.from(base64, "base64");
  return extractTextFromPdfBuffer(buffer);
}

function extractTextFromPdfBuffer(buffer: Buffer): string {
  const content = buffer.toString("latin1");
  const matches = content.match(/\((?:\\.|[^\\)])*\)/g) ?? [];
  const cleaned = matches
    .map((entry) => entry.slice(1, -1))
    .map(unescapePdfText)
    .map((entry) => entry.replace(/\s+/g, " ").trim())
    .filter((entry) => entry.length > 1 && /[a-zA-Z]/.test(entry));

  return cleaned.join(" ");
}

function unescapePdfText(value: string): string {
  const withEscapes = value.replace(/\\([nrtbf\\()])/g, (_, char: string) => {
    switch (char) {
      case "n":
        return "\n";
      case "r":
        return "\r";
      case "t":
        return "\t";
      case "b":
        return "\b";
      case "f":
        return "\f";
      case "(":
        return "(";
      case ")":
        return ")";
      case "\\":
        return "\\";
      default:
        return char;
    }
  });

  return withEscapes.replace(/\\([0-7]{1,3})/g, (_, octal: string) => {
    const code = Number.parseInt(octal, 8);
    return Number.isNaN(code) ? octal : String.fromCharCode(code);
  });
}

export function parseCvText(cvText: string, sourcePath?: string): ParsedCv {
  const lines = cvText
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const basics = extractBasics(cvText, lines);
  const sectionLines = splitBySection(lines);

  const summary = sectionLines.summary.join(" ").trim() || undefined;
  const skillsRaw = parseSkills(sectionLines.skills, cvText);
  const experience = parseExperience(sectionLines.experience);
  const education = parseEducation(sectionLines.education);
  const projects = parseProjects(sectionLines.projects);
  const certifications = sectionLines.certifications.length
    ? sectionLines.certifications
    : undefined;

  return {
    basics: {
      ...basics,
      summary,
    },
    skillsRaw,
    experience,
    education,
    projects,
    certifications,
    lastParsedAt: new Date().toISOString(),
    sourcePath,
  };
}

export function extractCandidateSkills(
  parsedCv: ParsedCv,
  cvText?: string,
): string[] {
  const candidates = new Set<string>();

  for (const skill of parsedCv.skillsRaw) {
    const normalized = normalizeSkillName(skill);
    if (normalized) {
      candidates.add(normalized);
    }
  }

  for (const item of parsedCv.experience) {
    for (const tech of item.technologies ?? []) {
      const normalized = normalizeSkillName(tech);
      if (normalized) {
        candidates.add(normalized);
      }
    }
  }

  for (const item of parsedCv.projects) {
    for (const tech of item.technologies ?? []) {
      const normalized = normalizeSkillName(tech);
      if (normalized) {
        candidates.add(normalized);
      }
    }
  }

  if (cvText) {
    for (const skill of detectSkillsInText(cvText)) {
      candidates.add(normalizeSkillName(skill));
    }
  }

  return Array.from(candidates);
}

export function buildSkills(candidates: string[]): Skill[] {
  const seen = new Set<string>();
  const skills: Skill[] = [];

  for (const candidate of candidates) {
    const normalized = normalizeSkillName(candidate);
    if (!normalized || seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);

    skills.push({
      id: normalized.replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
      name: toDisplayName(candidate),
      normalizedName: normalized,
      type: inferSkillType(normalized),
      source: "cv",
    });
  }

  return skills;
}

export function ensureProfileDefaults(
  profile: UserProfile,
  parsedCv?: ParsedCv,
): UserProfile {
  return {
    id: profile.id || uuidv4(),
    name: profile.name || parsedCv?.basics.fullName || "",
    email: profile.email || parsedCv?.basics.email || "",
    location: profile.location || parsedCv?.basics.location || "",
    targetRoles: profile.targetRoles ?? [],
    targetLevels: profile.targetLevels ?? [],
    targetLocations: profile.targetLocations ?? [],
    salaryRange: profile.salaryRange,
    keywords: profile.keywords ?? [],
    narrative: profile.narrative ?? "",
    proofPoints: profile.proofPoints ?? [],
    cvMarkdownPath: profile.cvMarkdownPath || parsedCv?.sourcePath || "",
    parsedCv: profile.parsedCv ?? parsedCv,
    skills: profile.skills,
  };
}

export function buildProfileFeatures(
  profile: UserProfile,
  skills: Skill[],
): ProfileFeatures {
  const totalYoe = inferTotalYoe(profile.parsedCv?.experience ?? []);
  const seniorityLevel = inferSeniorityLevel(profile, totalYoe);
  const primaryRole = inferPrimaryRole(profile);
  const skillNames = skills.map((skill) => skill.normalizedName);
  const coreStacks = skills
    .filter(
      (skill) =>
        skill.type === "language" ||
        skill.type === "framework" ||
        skill.type === "tool",
    )
    .slice(0, 6)
    .map((skill) => skill.normalizedName);

  return {
    profileId: profile.id,
    seniorityLevel,
    primaryRole,
    totalYoe,
    currentLocation: profile.location,
    remotePreference: inferRemotePreference(profile),
    skillNames,
    coreStacks,
    salaryRange: profile.salaryRange,
  };
}

function extractBasics(cvText: string, lines: string[]): ParsedCvBasics {
  const email = extractEmail(cvText);
  const phone = extractPhone(cvText);
  const links = extractLinks(cvText);

  const fullName =
    lines.find(
      (line) =>
        /[a-zA-Z]{2,}/.test(line) &&
        !line.includes("@") &&
        !/\d{7,}/.test(line),
    ) ||
    lines[0] ||
    "";
  const headline = lines.find(
    (line) =>
      line !== fullName && /[a-zA-Z]{2,}/.test(line) && line.length < 80,
  );

  return {
    fullName,
    email: email ?? undefined,
    phone: phone ?? undefined,
    location: undefined,
    headline: headline ?? undefined,
    summary: undefined,
    links,
  };
}

function splitBySection(lines: string[]): Record<string, string[]> {
  const sections: Record<string, string[]> = {
    summary: [],
    skills: [],
    experience: [],
    education: [],
    projects: [],
    certifications: [],
    other: [],
  };

  let current = "other";

  for (const line of lines) {
    const section = identifySection(line);
    if (section) {
      current = section;
      continue;
    }
    sections[current].push(line);
  }

  return sections;
}

function identifySection(line: string): string | null {
  const normalized = line
    .toLowerCase()
    .replace(/[^a-z\s]/g, "")
    .trim();
  if (!normalized) {
    return null;
  }

  if (normalized.includes("summary") || normalized.includes("profile")) {
    return "summary";
  }
  if (normalized.includes("skill")) {
    return "skills";
  }
  if (
    normalized.includes("experience") ||
    normalized.includes("employment") ||
    normalized.includes("work history")
  ) {
    return "experience";
  }
  if (normalized.includes("education")) {
    return "education";
  }
  if (normalized.includes("project")) {
    return "projects";
  }
  if (
    normalized.includes("certification") ||
    normalized.includes("certificate")
  ) {
    return "certifications";
  }

  return null;
}

function parseSkills(lines: string[], cvText: string): string[] {
  const raw = new Set<string>();

  for (const line of lines) {
    for (const chunk of splitSkillLine(line)) {
      if (chunk) {
        raw.add(chunk);
      }
    }
  }

  if (raw.size === 0) {
    for (const skill of detectSkillsInText(cvText)) {
      raw.add(skill);
    }
  }

  return Array.from(raw);
}

function splitSkillLine(line: string): string[] {
  const cleaned = line.replace(/^[-•*]+\s*/, "").trim();
  return cleaned
    .split(/[|,/·]/g)
    .map((part) => part.trim())
    .filter(Boolean);
}

function parseExperience(lines: string[]): ParsedCvExperienceItem[] {
  const items: ParsedCvExperienceItem[] = [];
  let current: ParsedCvExperienceItem | null = null;

  for (const line of lines) {
    if (looksLikeNewItem(line)) {
      if (current) {
        items.push(current);
      }
      current = buildExperienceItem(line);
      continue;
    }

    if (!current) {
      current = buildExperienceItem(line);
      continue;
    }

    if (isBulletLine(line)) {
      current.bulletPoints = current.bulletPoints ?? [];
      current.bulletPoints.push(stripBullet(line));
    } else {
      current.description = current.description
        ? `${current.description} ${line}`
        : line;
    }

    current.technologies = mergeTechnologies(
      current.technologies,
      detectSkillsInText(line),
    );
  }

  if (current) {
    items.push(current);
  }

  return items;
}

function parseEducation(lines: string[]): ParsedCvEducationItem[] {
  const items: ParsedCvEducationItem[] = [];
  let current: ParsedCvEducationItem | null = null;

  for (const line of lines) {
    if (looksLikeNewItem(line)) {
      if (current) {
        items.push(current);
      }
      current = {
        id: uuidv4(),
        institution: line,
      };
      continue;
    }

    if (!current) {
      current = { id: uuidv4(), institution: line };
      continue;
    }

    if (isBulletLine(line)) {
      current.degree = current.degree
        ? `${current.degree} ${stripBullet(line)}`
        : stripBullet(line);
    } else if (!current.degree) {
      current.degree = line;
    } else {
      current.fieldOfStudy = current.fieldOfStudy
        ? `${current.fieldOfStudy} ${line}`
        : line;
    }
  }

  if (current) {
    items.push(current);
  }

  return items;
}

function parseProjects(lines: string[]): ParsedCvProjectItem[] {
  const items: ParsedCvProjectItem[] = [];
  let current: ParsedCvProjectItem | null = null;

  for (const line of lines) {
    if (looksLikeNewItem(line)) {
      if (current) {
        items.push(current);
      }
      current = {
        id: uuidv4(),
        name: line,
      };
      continue;
    }

    if (!current) {
      current = { id: uuidv4(), name: line };
      continue;
    }

    if (isBulletLine(line)) {
      current.description = current.description
        ? `${current.description} ${stripBullet(line)}`
        : stripBullet(line);
    } else {
      current.description = current.description
        ? `${current.description} ${line}`
        : line;
    }

    current.technologies = mergeTechnologies(
      current.technologies,
      detectSkillsInText(line),
    );
  }

  if (current) {
    items.push(current);
  }

  return items;
}

function mergeTechnologies(
  existing: string[] | undefined,
  additional: string[],
): string[] {
  const merged = new Set(existing ?? []);
  for (const entry of additional) {
    merged.add(entry);
  }
  return Array.from(merged);
}

function looksLikeNewItem(line: string): boolean {
  const lower = line.toLowerCase();
  if (isBulletLine(line)) {
    return false;
  }
  if (/\b(19|20)\d{2}\b/.test(line)) {
    return true;
  }
  if (lower.includes(" at ") || line.includes(" - ") || line.includes(" | ")) {
    return true;
  }
  return line.length > 0 && line.length < 120;
}

function buildExperienceItem(line: string): ParsedCvExperienceItem {
  const { title, company } = splitCompanyAndTitle(line);
  const { startDate, endDate } = extractDateRange(line);

  return {
    id: uuidv4(),
    company: company || line,
    title: title || line,
    startDate,
    endDate,
    description: undefined,
    bulletPoints: [],
    technologies: detectSkillsInText(line),
  };
}

function splitCompanyAndTitle(line: string): {
  company?: string;
  title?: string;
} {
  if (line.includes(" at ")) {
    const [title, company] = line.split(" at ").map((part) => part.trim());
    return { title, company };
  }
  if (line.includes(" - ")) {
    const [left, right] = line.split(" - ").map((part) => part.trim());
    return { title: left, company: right };
  }
  if (line.includes(" | ")) {
    const [left, right] = line.split(" | ").map((part) => part.trim());
    return { title: left, company: right };
  }
  return { title: line, company: undefined };
}

function extractDateRange(line: string): {
  startDate?: string;
  endDate?: string;
} {
  const dateMatch = line.match(
    /(\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)?\s*\d{4})\s*[-–]\s*(Present|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)?\s*\d{4})/i,
  );

  if (!dateMatch) {
    return {};
  }

  return {
    startDate: dateMatch[1],
    endDate: dateMatch[2],
  };
}

function extractEmail(text: string): string | null {
  const match = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return match ? match[0] : null;
}

function extractPhone(text: string): string | null {
  const match = text.match(/(\+?\d[\d\s().-]{7,}\d)/);
  return match ? match[0] : null;
}

function extractLinks(text: string): ParsedCvBasics["links"] {
  const urlPattern = /https?:\/\/[^\s)]+/g;
  const matches = text.match(urlPattern) ?? [];
  const links: CvLink[] = matches.map((url) => {
    const lower = url.toLowerCase();
    const type = lower.includes("linkedin")
      ? "linkedin"
      : lower.includes("github")
        ? "github"
        : lower.includes("portfolio")
          ? "portfolio"
          : lower.includes("personal")
            ? "website"
            : "other";

    return {
      type,
      label: type,
      url,
    };
  });

  return links.length ? links : undefined;
}

function detectSkillsInText(text: string): string[] {
  const normalized = text.toLowerCase();
  const matches = new Set<string>();

  for (const skill of KNOWN_SKILLS) {
    if (skill.length <= 3) {
      const pattern = new RegExp(`\\b${escapeRegex(skill)}\\b`, "i");
      if (pattern.test(normalized)) {
        matches.add(skill);
      }
      continue;
    }

    if (normalized.includes(skill)) {
      matches.add(skill);
    }
  }

  return Array.from(matches);
}

function normalizeSkillName(skill: string): string {
  return skill
    .toLowerCase()
    .replace(/[^a-z0-9+.#\s-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function inferSkillType(normalizedName: string): SkillType {
  return SKILL_TYPE_MAP[normalizedName] ?? "tool";
}

function toDisplayName(skill: string): string {
  const normalized = normalizeSkillName(skill);
  return normalized
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function isBulletLine(line: string): boolean {
  return /^[-•*]/.test(line.trim());
}

function stripBullet(line: string): string {
  return line.replace(/^[-•*]+\s*/, "").trim();
}

function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function inferTotalYoe(
  experience: ParsedCvExperienceItem[],
): number | undefined {
  const years: number[] = [];

  for (const item of experience) {
    const startYear = extractYear(item.startDate);
    const endYear =
      item.endDate && /present/i.test(item.endDate)
        ? new Date().getFullYear()
        : extractYear(item.endDate);
    if (startYear && endYear && endYear >= startYear) {
      years.push(endYear - startYear);
    }
  }

  if (years.length === 0) {
    return undefined;
  }

  return years.reduce((sum, value) => sum + value, 0);
}

function extractYear(value: string | undefined): number | undefined {
  if (!value) {
    return undefined;
  }
  const match = value.match(/(19|20)\d{2}/);
  return match ? Number(match[0]) : undefined;
}

function inferSeniorityLevel(
  profile: UserProfile,
  totalYoe?: number,
): ProfileFeatures["seniorityLevel"] {
  const targetLevel = profile.targetLevels?.join(" ").toLowerCase() ?? "";
  if (targetLevel.includes("principal") || targetLevel.includes("exec")) {
    return "principal";
  }
  if (targetLevel.includes("staff")) {
    return "staff";
  }
  if (targetLevel.includes("senior")) {
    return "senior";
  }
  if (targetLevel.includes("mid")) {
    return "mid";
  }
  if (targetLevel.includes("junior")) {
    return "junior";
  }

  const yoe = totalYoe ?? 0;
  if (yoe >= 12) {
    return "principal";
  }
  if (yoe >= 8) {
    return "staff";
  }
  if (yoe >= 5) {
    return "senior";
  }
  if (yoe >= 2) {
    return "mid";
  }
  return "junior";
}

function inferPrimaryRole(profile: UserProfile): string {
  if (profile.targetRoles?.length) {
    return profile.targetRoles[0];
  }
  if (profile.parsedCv?.basics.headline) {
    return profile.parsedCv.basics.headline;
  }
  return "Software Engineer";
}

function inferRemotePreference(
  profile: UserProfile,
): ProfileFeatures["remotePreference"] {
  const targets = profile.targetLocations?.join(" ").toLowerCase() ?? "";
  if (targets.includes("remote")) {
    return "remote";
  }
  if (targets.includes("hybrid")) {
    return "hybrid";
  }
  if (targets.includes("onsite")) {
    return "onsite";
  }
  return "flexible";
}
