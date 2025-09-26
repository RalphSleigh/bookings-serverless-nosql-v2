import { z } from "zod/v4";
import { TRole } from './role';

export const UserSchema = z.object({
  userId: z.uuidv7(),
  sub: z.string(),
  name: z.string(),
  email: z.email(),
  avatar: z.string().optional(),
  isWoodcraft: z.boolean(),
  isGroupAccount: z.boolean(),
});

export type TUser = z.infer<typeof UserSchema>;

export type ContextUser = (TUser & { roles: TRole[]}) | undefined