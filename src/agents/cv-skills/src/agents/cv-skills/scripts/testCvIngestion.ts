import { ParseCvTool } from "../tools/ParseCvTool";
import { ExtractSkillsTool } from "../tools/ExtractSkillsTool";
import { SyncProfileFromCvTool } from "../tools/SyncProfileFromCvTool";

async function run(): Promise<void> {
  const cvPath = process.argv[2] ?? "data/sample-cv.pdf";
  const parseTool = new ParseCvTool();
  const extractTool = new ExtractSkillsTool();
  const syncTool = new SyncProfileFromCvTool();

  const { parsedCv } = await parseTool.execute({ cvFilePath: cvPath });
  const { skills } = await extractTool.execute({ parsedCv });
  const { profile } = await syncTool.execute({ parsedCv, skills });

  console.log(
    JSON.stringify(
      { basics: parsedCv.basics, skills, profileId: profile.id },
      null,
      2,
    ),
  );
}

run().catch((error) => {
  const message =
    error instanceof Error ? error.message : "Failed to run CV ingestion.";
  console.error(message);
  process.exit(1);
});
