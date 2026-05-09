'use server';
/**
 * @fileOverview This flow provides an AI-generated, natural language insight summarizing predicted future congestion levels
 * and potential wait times for an EV charging station, helping drivers proactively plan their charging stops.
 *
 * - predictCongestionInsight - A function that generates a congestion insight for a given charging station.
 * - PredictCongestionInsightInput - The input type for the predictCongestionInsight function.
 * - PredictCongestionInsightOutput - The return type for the predictCongestionInsight function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictCongestionInsightInputSchema = z.object({
  stationName: z.string().describe('The name of the charging station.'),
  currentDateTime: z
    .string()
    .describe('The current date and time in ISO format (e.g., "2023-10-27T10:00:00Z").'),
  historicalDemandSummary:
    z.string().describe('A summary of historical demand patterns for the station (e.g., "Usually busy during weekday evenings, quiet mornings.").'),
  currentQueueLength:
    z.number().describe('The current number of vehicles waiting in the queue at the station.'),
  averageChargingTime:
    z.number().describe('The average charging time in minutes for a typical session at this station.'),
  upcomingEvents:
    z.array(z.string()).describe('A list of significant upcoming events near the station that might influence congestion.'),
});
export type PredictCongestionInsightInput = z.infer<typeof PredictCongestionInsightInputSchema>;

const PredictCongestionInsightOutputSchema = z.object({
  insight: z
    .string()
    .describe(
      'A natural language summary of predicted future congestion levels and potential wait times for the next few hours.'
    ),
});
export type PredictCongestionInsightOutput = z.infer<typeof PredictCongestionInsightOutputSchema>;

export async function predictCongestionInsight(
  input: PredictCongestionInsightInput
): Promise<PredictCongestionInsightOutput> {
  return predictCongestionInsightFlow(input);
}

const predictCongestionInsightPrompt = ai.definePrompt({
  name: 'predictCongestionInsightPrompt',
  input: {schema: PredictCongestionInsightInputSchema},
  output: {schema: PredictCongestionInsightOutputSchema},
  prompt: `You are an AI assistant specialized in predicting EV charging station congestion. Your task is to analyze the provided information and generate a natural language insight summarizing the predicted future congestion levels and potential wait times for the given charging station over the next few hours. The insight should be proactive, helping an EV driver plan their charging stops to avoid peak periods.

Current Time: {{{currentDateTime}}}
Station Name: {{{stationName}}}

Historical Demand Summary: {{{historicalDemandSummary}}}
Current Queue Length: {{{currentQueueLength}}} vehicles
Average Charging Time: {{{averageChargingTime}}} minutes per session

Upcoming Events in the area that might affect demand:
{{#if upcomingEvents}}
{{#each upcomingEvents}}
- {{{this}}}
{{/each}}
{{else}}
None reported.
{{/if}}

Based on this information, provide a concise and helpful prediction for the next 3-6 hours. Focus on times to avoid and potential quieter periods. Start directly with the insight, without conversational filler.`,
});

const predictCongestionInsightFlow = ai.defineFlow(
  {
    name: 'predictCongestionInsightFlow',
    inputSchema: PredictCongestionInsightInputSchema,
    outputSchema: PredictCongestionInsightOutputSchema,
  },
  async input => {
    const {output} = await predictCongestionInsightPrompt(input);
    return output!;
  }
);
