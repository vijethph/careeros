/**
 * cv-skills agent — types barrel
 *
 * Re-exports the shared project types so all files within this agent folder
 * can import from the short relative path "../types" without reaching outside
 * the agent boundary. This keeps the cv-skills folder self-contained and
 * reduces cross-folder import chains for teammates.
 */
export * from "../../types";
