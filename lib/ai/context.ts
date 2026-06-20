import { z } from "zod";

export const ChatContextSchema = z.object({
  lessonId: z.string().optional(),
  lessonTitle: z.string().optional(),
  learningObjectives: z.array(z.string()).optional(),
  optionalTrack: z.enum(["robotics", "embedded-ai"]).nullable().optional(),
});

export type ChatContext = z.infer<typeof ChatContextSchema>;
