import { z } from 'zod';

export const serverOptionsSchema = z.object({
  port: z.string().transform((port, ctx) => {
    if (!isNaN(Number(port))) return Number(port);
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Port string must be numeric',
    });
    return z.NEVER;
  }),
  origin: z.string().url(),
});
export type ServerOptions = z.infer<typeof serverOptionsSchema>;

export const operationalOptionsSchema = z.object({
  clearCache: z.boolean(),
});
export type OperationalOptions = z.infer<typeof operationalOptionsSchema>;
