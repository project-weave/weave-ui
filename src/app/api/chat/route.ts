import { xai } from "@ai-sdk/xai";
import { streamText, tool } from "ai";
import { z } from "zod";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { eventData, messages } = await req.json();

  if (!eventData) {
    return new Response("Missing event data", { status: 400 });
  }

  const systemPrompt = `You are Weaver, a scheduling assistant. Your job is to:
1. Understand the user's request for a meeting time — including duration, time of day, date preferences, or required participants.
2. Convert the request into a structured format: start time, end time, duration, and any constraints.
3. Use the \`findBestMeetingTimes\` tool to return up to 3 optimal time slots based on event data and availability.

The event includes:
- \`event\`: { id, name, isSpecificDates, startTime, endTime, dates[], timeZone }
- \`responses\`: each has { alias, userId, availabilities[] in "YYYY-MM-DD HH:MM:SS" format }

Respond clearly with the best matching slots, showing:
- Date, time, duration, available attendees (in event timezone)
- Alternatives if no exact match

Time windows:
- Morning: 00:00–11:59
- Afternoon: 12:00–17:59
- Evening: 18:00–23:59`;

  // Use closure to inject eventData into tool
  const findBestMeetingTimes = tool({
    description: "Find the top 3 meeting times that fit the user's request and maximize attendance.",
    execute: async ({ dayOfWeek, durationMinutes, endTime, requiredParticipants, startTime, topN }) => {
      const { event, responses } = eventData;
      const { dates, timeZone } = event;
      const slotLengthMs = Math.ceil(durationMinutes / 30) * 30 * 60 * 1000;
      const timeSlotsToParticipants = {};

      responses.forEach(({ alias, availabilities }) => {
        (availabilities || []).forEach((timeSlot) => {
          if (timeSlotsToParticipants[timeSlot] === undefined) {
            timeSlotsToParticipants[timeSlot] = [];
          }
          timeSlotsToParticipants[timeSlot].push(alias);
        });
      });

      console.log(timeSlotsToParticipants);

      return "";
      // return {
      //   start: "1/6/2025, 14:00:00 PM",
      //   end: "1/6/2025, 14:30:00 PM",
      //   attendees: ["John", "Emily", "Raj", "Lena", "Carlos"]
      // };
    },
    parameters: z.object({
      dayOfWeek: z.string().optional().describe("Optional list of days of the week allowed for meeting"),
      durationMinutes: z.number().describe("Desired meeting duration in minutes"),
      endTime: z.string().describe("End of the meeting range in HH:MM:SS format (e.g. 17:00:00)"),
      requiredParticipants: z.array(z.string()).optional().describe("Optional list of aliases who must be present"),
      startTime: z.string().describe("Start of the meeting range in HH:MM:SS format (e.g. 12:00:00)"),
      topN: z.number().default(3).describe("Number of meeting times to return")
    })
  });

  // Call the model
  const result = streamText({
    maxSteps: 5,
    messages,
    model: xai("grok-2-1212"),
    system: systemPrompt,
    tools: { findBestMeetingTimes }
  });

  return result.toDataStreamResponse();
}
