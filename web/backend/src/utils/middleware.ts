import { NextFunction, Request, Response } from "express";
import { logError } from "./logger";

interface NetworkParams {
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
}

export const notFoundMiddleware = ({ res }: NetworkParams): void => {
  res.status(404).send({ error: "Unknown page request" });
};

export const errorHandlerMiddleware = ({ error, next }: NetworkParams): void => {
  logError(error.message);
  next(error);
};
