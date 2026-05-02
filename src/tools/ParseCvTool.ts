import { LuaTool } from "lua-cli";
import { z } from "zod";
import { ParsedCv } from "../types";
import {
  getUserState,
  loadCvText,
  loadCvTextFromBase64,
  parseCvText,
  writeJsonFile,
} from "./profileUtils";

export class ParseCvTool implements LuaTool {
  name = "parse_cv";
  description = "Parse a CV file or text into structured sections.";

  inputSchema = z
    .object({
      cvText: z.string().optional(),
      sourcePath: z.string().optional(),
      cvFilePath: z.string().optional(),
      cvBase64: z.string().optional(),
    })
    .refine(
      (input) =>
        input.cvText || input.sourcePath || input.cvFilePath || input.cvBase64,
      {
        message: "Provide cvText or a file path.",
      },
    );

  async execute(
    input: z.infer<typeof this.inputSchema>,
  ): Promise<{ parsedCv: ParsedCv }> {
    const sourcePath = input.cvFilePath ?? input.sourcePath;
    let cvText = input.cvText;
    if (!cvText && input.cvBase64) {
      cvText = loadCvTextFromBase64(input.cvBase64);
    }
    if (!cvText && sourcePath) {
      cvText = await loadCvText(sourcePath);
    }
    if (!cvText) {
      cvText = "";
    }
    const parsedCv = parseCvText(cvText, sourcePath);

    const { state, save } = await getUserState();
    state.lastParsedCv = parsedCv;
    if (state.profile) {
      state.profile.parsedCv = parsedCv;
    }
    await save();

    try {
      await writeJsonFile("parsed-cv.json", parsedCv);
    } catch {
      return { parsedCv };
    }

    return { parsedCv };
  }
}
