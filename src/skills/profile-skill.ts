import { LuaSkill } from "lua-cli";
import { ExtractSkillsTool } from "../tools/ExtractSkillsTool";
import { GetProfileFeaturesTool } from "../tools/GetProfileFeaturesTool";
import { ParseCvTool } from "../tools/ParseCvTool";
import { SyncProfileFromCvTool } from "../tools/SyncProfileFromCvTool";
import { UpdateProfileTool } from "../tools/UpdateProfileTool";

const profileSkill = new LuaSkill({
  name: "profile-skill",
  description: "CV parsing, skill extraction, and profile management.",
  context: "Use these tools when ingesting a CV or updating profile details.",
  tools: [
    new ParseCvTool(),
    new ExtractSkillsTool(),
    new SyncProfileFromCvTool(),
    new GetProfileFeaturesTool(),
    new UpdateProfileTool(),
  ],
});

export default profileSkill;
