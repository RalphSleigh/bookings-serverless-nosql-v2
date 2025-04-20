import { HandlerWrapper } from "../utils";

export const getEnv = HandlerWrapper(['get','env'], async (event, context) => {
    return { "env": context.config.ENV }
})