import { z } from "zod";

export const streamProviderSchema = z.enum(["twitch", "youtube"]);

export type StreamProvider = z.infer<typeof streamProviderSchema>;

export const streamSchema = z.object({
  id: z.string(),
  provider: streamProviderSchema,
  sourceKey: z.string(),
  label: z.string(),
  originalUrl: z.string(),
  embedUrl: z.string(),
});

export type Stream = z.infer<typeof streamSchema>;

export const addStreamErrorCodeSchema = z.enum([
  "invalid_url",
  "duplicate",
  "max_streams",
]);

export type AddStreamErrorCode = z.infer<typeof addStreamErrorCodeSchema>;

export interface AddStreamError {
  code: AddStreamErrorCode;
  message: string;
}

export type AddStreamResult =
  | { ok: true; stream: Stream }
  | { ok: false; error: AddStreamError };
