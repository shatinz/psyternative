'use server';
/**
 * @fileOverview An AI agent that provides advice on an experience report.
 *
 * - adviseOnExperienceReport - A function that provides advice on an experience report.
 * - AdviseOnExperienceReportInput - The input type for the adviseOnExperienceReport function.
 * - AdviseOnExperienceReportOutput - The return type for the adviseOnExperienceReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdviseOnExperienceReportInputSchema = z.object({
  reportText: z
    .string()
    .describe('The text of the experience report.'),
  experienceType: z
    .enum(['psychedelics', 'dreams', 'meditation'])
    .describe('The type of experience being reported.'),
});
export type AdviseOnExperienceReportInput = z.infer<
  typeof AdviseOnExperienceReportInputSchema
>;

const AdviseOnExperienceReportOutputSchema = z.object({
  summary: z.string().describe('A short summary of the experience report.'),
  relevantLinks: z
    .array(z.string())
    .describe('An array of relevant links to external resources.'),
  warnings: z.array(z.string()).describe('An array of warnings related to the experience.'),
  cautions: z.array(z.string()).describe('An array of cautions related to the experience.'),
  relatedReports: z
    .array(z.string())
    .describe('An array of IDs of related experience reports.'),
});
export type AdviseOnExperienceReportOutput = z.infer<
  typeof AdviseOnExperienceReportOutputSchema
>;

export async function adviseOnExperienceReport(
  input: AdviseOnExperienceReportInput
): Promise<AdviseOnExperienceReportOutput> {
  return adviseOnExperienceReportFlow(input);
}

const adviseOnExperienceReportPrompt = ai.definePrompt({
  name: 'adviseOnExperienceReportPrompt',
  input: {schema: AdviseOnExperienceReportInputSchema},
  output: {schema: AdviseOnExperienceReportOutputSchema},
  prompt: `You are an AI assistant that provides advice on experience reports related to altered states of consciousness.

You will receive an experience report and its type (psychedelics, dreams, or meditation). Your task is to provide the following information:

1.  A short summary of the experience report.
2.  Relevant links to external resources that might be helpful to understand the experience better.
3.  Any warnings or cautions that are relevant to the experience.
4.  IDs of other related experience reports that might be of interest.

Experience Type: {{{experienceType}}}
Experience Report:
{{reportText}}`,
});

const adviseOnExperienceReportFlow = ai.defineFlow(
  {
    name: 'adviseOnExperienceReportFlow',
    inputSchema: AdviseOnExperienceReportInputSchema,
    outputSchema: AdviseOnExperienceReportOutputSchema,
  },
  async input => {
    const {output} = await adviseOnExperienceReportPrompt(input);
    return output!;
  }
);
