import { LuaTool } from "lua-cli";
import { z } from "zod";
import { UserProfile } from "../types";
import { getUserState, writeJsonFile } from "./profileUtils";

export class UpdateProfileTool implements LuaTool {
  name = "update_profile";
  description =
    "Update profile fields like roles, levels, locations, and salary range.";

  inputSchema = z.object({
    targetRoles: z.array(z.string()).optional(),
    targetLevels: z.array(z.string()).optional(),
    targetLocations: z.array(z.string()).optional(),
    salaryRange: z
      .object({
        currency: z.string(),
        min: z.number(),
        max: z.number(),
      })
      .optional(),
  });

  async execute(
    input: z.infer<typeof this.inputSchema>,
  ): Promise<{ profile: UserProfile }> {
    const { state, save } = await getUserState();
    const profile = (state.profile ?? {}) as UserProfile;

    if (input.targetRoles) {
      profile.targetRoles = input.targetRoles;
    }
    if (input.targetLevels) {
      profile.targetLevels = input.targetLevels;
    }
    if (input.targetLocations) {
      profile.targetLocations = input.targetLocations;
    }
    if (input.salaryRange) {
      profile.salaryRange = input.salaryRange;
    }

    state.profile = profile;
    await save();

    await writeJsonFile("profile.json", profile);

    return { profile };
  }
}
