import { HandlerWrapper } from "../utils";

export const getEnv = HandlerWrapper(res => ['get','env'], async (req, res) => {
    res.json({ "env": res.locals.config.ENV })
})