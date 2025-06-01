import { RequestHandler } from "express"

export const loggerMiddleware: RequestHandler = async (req, res, next) => {
  try {
    console.log(req.path, req.method, req.body, req.query, req.params)
    next()
  } catch (error) {
    console.log(error)
    throw error
  }
}
