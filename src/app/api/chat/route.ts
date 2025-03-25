import { xai } from "@ai-sdk/xai";
import { streamText, tool } from "ai";
import { z } from "zod";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  // Extract the `messages` from the body of the request
  const { messages } = await req.json();
  const systemPrompt = `You are Weaver, built by Weave, designed to assist with scheduling meetings based on event details and participant availability. Your task is to analyze user requests about meeting times (e.g., "What's the best time to meet for 2 hours in the afternoon") and suggest optimal time slots that maximize attendance. You have access to a tool called \`findBestMeetingTimes\` that processes event data and participant responses to calculate and sort time slots by attendance rate.

  The event data includes:
  - \`event\`: Contains \`id\`, \`name\`, \`isSpecificDates\`, \`startTime\`, \`endTime\`, \`dates\` (an array of dates in "YYYY-MM-DD" format), and \`timeZone\`.
  - \`responses\`: An array of participant objects, each with \`alias\`, \`userId\`, and \`availabilities\` (an array of "YYYY-MM-DD HH:MM:SS" timestamps in the event’s timezone).

  Your responses should:
  1. Interpret the user’s request (e.g., duration and time of day like "afternoon").
  2. Use the \`findBestMeetingTimes\` tool to identify time slots within the event’s dates and time range (e.g., 09:00:00 to 21:00:00 UTC) that satisfy the request.
  3. Return the top suggested time slots (up to 3), sorted by highest attendance, including the date, time, duration, and list of available attendees.
  4. If no exact matches exist, suggest the closest viable options and explain why.
  5. Present times in the event’s timezone (e.g., UTC) in a clear, human-readable format (e.g., "January 5, 2025, 10:00 AM UTC").
  6. Be concise, helpful, and proactive, offering alternatives if needed.

  Assume "morning" is 00:00-11:59, "afternoon" is 12:00-17:59, and "evening" is 18:00-23:59 unless specified otherwise. If the request is unclear, ask for clarification.`;

  // Call the language model
  const result = streamText({
    system: systemPrompt,
    model: xai("grok-2-1212"),
    messages,
    // Dummy tools
    tools: {
      weather: tool({
        description: "Get the weather in a location (fahrenheit)",
        parameters: z.object({
          location: z.string().describe("The location to get the weather for")
        }),
        execute: async ({ location }) => {
          const temperature = Math.round(Math.random() * (90 - 32) + 32);
          return {
            location,
            temperature
          };
        }
      }),
      convertFahrenheitToCelsius: tool({
        description: "Convert a temperature in fahrenheit to celsius",
        parameters: z.object({
          temperature: z.number().describe("The temperature in fahrenheit to convert")
        }),
        execute: async ({ temperature }) => {
          const celsius = Math.round((temperature - 32) * (5 / 9));
          return {
            celsius
          };
        }
      })
    }
  });

  // Respond with the stream
  return result.toDataStreamResponse();
}
