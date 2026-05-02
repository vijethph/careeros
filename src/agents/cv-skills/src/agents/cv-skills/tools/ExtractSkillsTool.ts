import { LuaTool } from "lua-cli";
import { z } from "zod";
import { ParsedCv, Skill } from "../types";
import {
  buildSkills,
  extractCandidateSkills,
  getUserState,
  loadCvText,
  writeJsonFile,
} from "./profileUtils";

export class ExtractSkillsTool implements LuaTool {
  name = "extract_skills";
  description = "Extract and normalize skills from parsed CV data.";

  inputSchema = z.object({
    parsedCv: z.any().describe("Parsed CV object."),
  });

  async execute(input: { parsedCv: ParsedCv }): Promise<{ skills: Skill[] }> {
    const cvText = input.parsedCv.sourcePath
      ? await loadCvText(input.parsedCv.sourcePath)
      : undefined;
    const candidates = extractCandidateSkills(input.parsedCv, cvText);
    const skills = buildSkills(candidates);

    const { state, save } = await getUserState();
    state.skills = skills;
    if (state.profile) {
      state.profile.skills = skills;
    }
    await save();

    await writeJsonFile("skills.json", skills);

    return { skills };
  }
}
