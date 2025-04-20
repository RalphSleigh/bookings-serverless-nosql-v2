import { z } from 'zod';

export const UserSchema = z.object({
  userId: z.string(),
  sub: z.string(),
  name: z.string(),
  email: z.string(),
  avatar: z.string(),
  isWoodcraft: z.boolean(),
  isGroupAccount: z.boolean(),
});

export type TUser = z.infer<typeof UserSchema>;