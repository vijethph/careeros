import { LuaTool } from "lua-cli";
import { z } from "zod";
import { ParsedCv, Skill, UserProfile } from "../types";
import {
  ensureProfileDefaults,
  getUserState,
  writeJsonFile,
} from "./profileUtils";

export class SyncProfileFromCvTool implements LuaTool {
  name = "sync_profile_from_cv";
  description =
    "Sync the user profile based on parsed CV and extracted skills.";

  inputSchema = z.object({
    parsedCv: z.any(),
    skills: z.any(),
  });

  async execute(input: {
    parsedCv: ParsedCv;
    skills: Skill[];
  }): Promise<{ profile: UserProfile }> {
    const { state, save } = await getUserState();
    const currentProfile = state.profile ?? ({} as UserProfile);
    const profile = ensureProfileDefaults(currentProfile, input.parsedCv);

    profile.parsedCv = input.parsedCv;
    profile.skills = input.skills;

    state.profile = profile;
    state.skills = input.skills;
    state.lastParsedCv = input.parsedCv;

    await save();
    await writeJsonFile("profile.json", profile);

    return { profile };
  }
}
