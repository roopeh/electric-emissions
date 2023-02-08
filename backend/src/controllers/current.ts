import { Router } from "express";

const currentData = [
  {
    value: 68.884,
    variable_id: 265,
    start_time: "2023-01-04T01:37:00+0000",
    end_time: "2023-01-04T01:37:00+0000",
  },
  {
    value: 76.503,
    variable_id: 266,
    start_time: "2023-01-04T01:37:00+0000",
    end_time: "2023-01-04T01:37:00+0000",
  },
];

const currentRouter = Router();

currentRouter.get("/", async (_req, res) => {
  res.status(200).json(currentData);
});

export default currentRouter;
