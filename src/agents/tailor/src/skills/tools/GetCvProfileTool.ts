import { z } from 'zod';
import { Data } from 'lua-cli';

const COLLECTION = 'cv_profile';

export class GetCvProfileTool {
  name = 'get_cv_profile';
  description = 'Retrieves the currently saved CV profile from storage.';
  inputSchema = z.object({});

  async execute(_input: Record<string, never>): Promise<{ cvProfile: string } | { message: string }> {
    const entries = await Data.get(COLLECTION, {}, 1, 1);

    if (!entries || entries.data.length === 0) {
      return { message: 'No CV profile saved yet. Use save_cv_profile to upload one.' };
    }

    return { cvProfile: entries.data[0].data.cvProfile as string };
  }
}
