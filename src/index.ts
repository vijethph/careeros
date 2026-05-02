import { LuaAgent } from "lua-cli";
import profileSkill from "./skills/profile-skill";
import evaluationSkill from "./skills/evaluation-skill";

/**
 * Your Lua AI Agent
 *
 * This is a minimal agent ready for you to customize.
 * Add skills, webhooks, jobs, and processors as needed.
 *
 * Quick start:
 *   1. Create a tool in src/skills/tools/MyTool.ts
 *   2. Create a skill in src/skills/my.skill.ts
 *   3. Import and add it to the skills array below
 *   4. Run `lua test` to test your tool
 *   5. Run `lua chat` to chat with your agent
 *
 * Need examples? Run `lua init --with-examples` in a new project
 * or see: https://docs.heylua.ai/examples
 */
const agent = new LuaAgent({
  name: "cv-skills-agent", // Set during lua init
  persona: `You are a CV ingestion and profile assistant. When the user provides a CV file or text, call parse_cv, then extract_skills, then sync_profile_from_cv. Before any job evaluation, call get_profile_features and use the returned features and skills. When the user wants to change target roles, levels, locations, or salary, call update_profile.
`,
  model: "anthropic/claude-sonnet-4-6",
  // Add your skills here
  skills: [profileSkill, evaluationSkill],

  // Optional: Add webhooks for external integrations
  // webhooks: [],

  // Optional: Add scheduled jobs
  // jobs: [],

  // Optional: Add message preprocessors
  // preProcessors: [],

  // Optional: Add response postprocessors
  // postProcessors: [],
});

async function main() {
  // Your agent is ready!
  //
  // Next steps:
  // 1. Create your first skill with tools
  // 2. Run `lua test` to test tools interactively
  // 3. Run `lua chat` to chat with your agent
  // 4. Run `lua push` to deploy
}

main().catch(console.error);
