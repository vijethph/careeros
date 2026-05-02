import { LuaTool } from "lua-cli";
import { z } from "zod";
import { ProfileFeatures, Skill, UserProfile } from "../types";
import { buildProfileFeatures, getUserState } from "./profileUtils";

export class GetProfileFeaturesTool implements LuaTool {
  name = "get_profile_features";
  description = "Return normalized profile features used for job scoring.";

  inputSchema = z.object({});

  async execute(_: {}): Promise<{
    profile: UserProfile;
    features: ProfileFeatures;
    skills: Skill[];
  }> {
    const { state } = await getUserState();
    const profile = (state.profile ?? {}) as UserProfile;
    const skills = (profile.skills ?? state.skills ?? []) as Skill[];
    const features = buildProfileFeatures(profile, skills);

    return { profile, features, skills };
  }
}
