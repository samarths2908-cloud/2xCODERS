'use server';
/**
 * @fileOverview Provides a Genkit flow for generating a natural language explanation
 * detailing why a specific charging station is the optimal choice for an EV driver.
 *
 * - explainOptimalStationChoice - A function that handles the explanation process.
 * - ExplainOptimalStationChoiceInput - The input type for the explainOptimalStationChoice function.
 * - ExplainOptimalStationChoiceOutput - The return type for the explainOptimalStationChoice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainOptimalStationChoiceInputSchema = z.object({
  userLocation: z
    .object({
      latitude: z.number(),
      longitude: z.number(),
    })
    .describe("The user's current geographical location."),
  currentBatteryPercentage: z
    .number()
    .min(0)
    .max(100)
    .describe('The current battery percentage of the EV.'),
  targetBatteryPercentage: z
    .number()
    .min(0)
    .max(100)
    .describe('The desired target battery percentage for charging.'),
  recommendedStation: z
    .object({
      id: z.string(),
      name: z.string().describe('The name of the recommended charging station.'),
      location: z
        .object({latitude: z.number(), longitude: z.number()})
        .describe('The location of the recommended station.'),
      totalEstimatedMinutes: z
        .number()
        .describe('The total estimated time in minutes (travel + wait + charge).'),
      travelMinutes: z.number().describe('Estimated travel time to the station in minutes.'),
      waitMinutes: z.number().describe('Estimated wait time at the station in minutes.'),
      chargeMinutes: z
        .number()
        .describe('Estimated charging time at the station in minutes.'),
      reason: z.string().optional().describe('Additional context for the recommendation.'),
    })
    .describe('Details of the recommended charging station.'),
  otherStationsConsidered: z
    .array(
      z.object({
        id: z.string(),
        name: z.string().describe('The name of the alternative charging station.'),
        location: z
          .object({latitude: z.number(), longitude: z.number()})
          .describe('The location of the alternative station.'),
        totalEstimatedMinutes: z
          .number()
          .describe('The total estimated time in minutes (travel + wait + charge) for this alternative.'),
      })
    )
    .optional()
    .describe('Optional: A list of other stations considered, for comparison.'),
});

export type ExplainOptimalStationChoiceInput = z.infer<
  typeof ExplainOptimalStationChoiceInputSchema
>;

const ExplainOptimalStationChoiceOutputSchema = z.object({
  explanation: z.string().describe('A natural language explanation of the recommendation.'),
});

export type ExplainOptimalStationChoiceOutput = z.infer<
  typeof ExplainOptimalStationChoiceOutputSchema
>;

export async function explainOptimalStationChoice(
  input: ExplainOptimalStationChoiceInput
): Promise<ExplainOptimalStationChoiceOutput> {
  return explainOptimalStationChoiceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainOptimalStationChoicePrompt',
  input: {schema: ExplainOptimalStationChoiceInputSchema},
  output: {schema: ExplainOptimalStationChoiceOutputSchema},
  prompt: `You are an AI assistant designed to provide clear, concise, and helpful explanations for EV charging station recommendations.

The user is currently at {{userLocation.latitude}}, {{userLocation.longitude}} with a battery level of {{currentBatteryPercentage}}% and wants to charge to {{targetBatteryPercentage}}%.

Here is the recommended charging station:
Station Name: {{{recommendedStation.name}}}
Total Estimated Time: {{recommendedStation.totalEstimatedMinutes}} minutes (Travel: {{recommendedStation.travelMinutes}} min, Wait: {{recommendedStation.waitMinutes}} min, Charge: {{recommendedStation.chargeMinutes}} min).

{{#if recommendedStation.reason}}
Additional context for recommendation: {{{recommendedStation.reason}}}
{{/if}}

{{#if otherStationsConsidered}}
Other stations considered:
{{#each otherStationsConsidered}}
- {{{name}}}: Total Estimated Time {{totalEstimatedMinutes}} minutes.
{{/each}}
{{/if}}

Explain in a natural, friendly tone why the recommended station is the best choice for the user, focusing on minimizing the total effective time (travel + wait + charge). If other stations were considered, subtly highlight how the recommended station offers a better overall experience compared to them. Keep the explanation concise and easy to understand for an EV driver.`,
});

const explainOptimalStationChoiceFlow = ai.defineFlow(
  {
    name: 'explainOptimalStationChoiceFlow',
    inputSchema: ExplainOptimalStationChoiceInputSchema,
    outputSchema: ExplainOptimalStationChoiceOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
