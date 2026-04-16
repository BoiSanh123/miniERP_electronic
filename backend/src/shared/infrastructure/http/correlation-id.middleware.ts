import { NextFunction, Request, Response } from "express";
import { randomUUID } from "crypto";

export class CorrelationIdMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const incoming = req.headers["x-correlation-id"];
    const id = (Array.isArray(incoming) ? incoming[0] : incoming) || randomUUID();
    req.headers["x-correlation-id"] = id;
    res.setHeader("x-correlation-id", id);
    next();
  }
}
