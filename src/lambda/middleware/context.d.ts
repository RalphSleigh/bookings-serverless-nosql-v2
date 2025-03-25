type ContextConfig = { config: ConfigType }
type ContextUser = { user: EntityItem<typeof User> | undefined }

export type ContextWithConfig = Context & { config: ConfigType }
export type ContextWithUser = ContextWithConfig & { user: EntityItem<typeof User> | undefined }