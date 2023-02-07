import { Router } from "express";

const pingRouter = Router();

pingRouter.get("/", async (_req, res) => {
  res.status(200).send("Pong");
});

export default pingRouter;
