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
  preferences: z.object({
    emailNopeList: z.array(z.uuidv7()).default([]),
    driveSyncList: z.array(z.uuidv7()).default([]),
  }).default({ emailNopeList: [], driveSyncList: [] }),
});

export type TUser = z.infer<typeof UserSchema>;

export type ContextUser = (TUser & { roles: TRole[]}) | undefined