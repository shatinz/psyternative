
'use server';

/**
 * @fileOverview Summarizes experience reports to provide a TLDR for users.
 *
 * - summarizeExperienceReport - A function that summarizes experience reports.
 * - SummarizeExperienceReportInput - The input type for the summarizeExperienceReport function.
 * - SummarizeExperienceReportOutput - The return type for the summarizeExperienceReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeExperienceReportInputSchema = z.object({
  report: z.string().describe('The full text of the experience report.'),
});
export type SummarizeExperienceReportInput = z.infer<typeof SummarizeExperienceReportInputSchema>;

const SummarizeExperienceReportOutputSchema = z.object({
  summary: z.string().describe("A concise, TLDR-style summary of the experience report in Persian. It should capture the essence of the experience, key events, and the overall outcome."),
});
export type SummarizeExperienceReportOutput = z.infer<typeof SummarizeExperienceReportOutputSchema>;

export async function summarizeExperienceReport(input: SummarizeExperienceReportInput): Promise<SummarizeExperienceReportOutput> {
  return summarizeExperienceReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeExperienceReportPrompt',
  input: {schema: SummarizeExperienceReportInputSchema},
  output: {schema: SummarizeExperienceReportOutputSchema},
  prompt: `Provide a concise, TLDR-style summary in Persian for the following experience report. The summary must capture the main points, key events, and the final outcome of the experience.

Experience Report:
{{{report}}}`,
  model: 'googleai/gemini-2.5-flash',
});

const summarizeExperienceReportFlow = ai.defineFlow(
  {
    name: 'summarizeExperienceReportFlow',
    inputSchema: SummarizeExperienceReportInputSchema,
    outputSchema: SummarizeExperienceReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
