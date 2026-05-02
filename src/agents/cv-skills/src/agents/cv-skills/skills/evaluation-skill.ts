import { LuaSkill } from "lua-cli";
import { EvaluateJobTool } from "../tools/EvaluateJobTool";

const evaluationSkill = new LuaSkill({
  name: "evaluation-skill",
  description: "Job evaluation and A–G scoring.",
  context: "Use this tool when the user asks to evaluate a job offer.",
  tools: [new EvaluateJobTool()],
});

export default evaluationSkill;
