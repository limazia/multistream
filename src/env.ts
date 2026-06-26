import { z } from "zod";

const required = {
  string: (key: string) => z.string().min(1, `${key} é obrigatório`),
  url: (key: string) =>
    z.url(`${key} deve ser uma URL válida`).min(1, `${key} é obrigatório`),
};

export const envSchema = z.object({
  VITE_NODE_ENV: z
    .enum(["development", "qa", "production"])
    .default("development"),

  VITE_TWITCH_PARENT: required.string("VITE_TWITCH_PARENT"),
});

export type Env = z.infer<typeof envSchema>;

export const envParseResult = envSchema.safeParse(import.meta.env);
export const env: Env | undefined = envParseResult.success
  ? envParseResult.data
  : undefined;
