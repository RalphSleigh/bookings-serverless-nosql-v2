import { HandlerWrapper } from "../utils";

export const getEnv = HandlerWrapper(async (event, context) => {
    return { "env": context.config.ENV }
})