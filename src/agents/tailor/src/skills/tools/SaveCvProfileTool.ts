import { z } from 'zod';
import { Data } from 'lua-cli';

const inputSchema = z.object({
  cvProfile: z.string().describe('The candidate CV as a JSON string'),
});

type Input = z.infer<typeof inputSchema>;

const COLLECTION = 'cv_profile';

export class SaveCvProfileTool {
  name = 'save_cv_profile';
  description =
    'Saves the candidate CV profile to persistent storage. Only needs to be called once — subsequent generate_cv calls will use this stored profile automatically.';
  inputSchema = inputSchema;

  async execute(input: Input): Promise<{ success: boolean; message: string }> {
    try {
      // Validate that the input is parseable JSON before storing
      JSON.parse(input.cvProfile);
    } catch {
      throw new Error('cvProfile must be a valid JSON string.');
    }

    try {
      const existing = await Data.get(COLLECTION, {}, 1, 1);

      if (existing && existing.data.length > 0) {
        await Data.update(COLLECTION, existing.data[0].id, { cvProfile: input.cvProfile });
        return { success: true, message: 'CV profile updated successfully.' };
      }

      await Data.create(COLLECTION, { cvProfile: input.cvProfile });
      return { success: true, message: 'CV profile saved successfully.' };
    } catch (err) {
      throw new Error(`save_cv_profile: failed to save — ${(err as Error).message}`);
    }
  }
}
