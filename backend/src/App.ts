import express from "express";
import axios, { AxiosRequestConfig } from "axios";
import { notFoundMiddleware, errorHandlerMiddleware } from "./utils/middleware";
import { logError } from "./utils/logger";
import pingRouter from "./controllers/ping";

const apiUrl: string = "https://api.fingrid.fi/v1/variable/265/events/json?start_time=2022-12-27T22:00:00Z&end_time=2022-12-27T23:00:00Z";

const options: AxiosRequestConfig = {
  headers: {
    "x-api-key": "",
  },
};

const loadData = async (): Promise<any> => {
  try {
    const response = await axios.get(apiUrl, options);
    return response.data;
  } catch (err) {
    logError(String(err));
    return null;
  }
};

const app = express();
app.use(express.json());

app.use("/ping", pingRouter);

app.get("/test", async (_req, res) => {
  const data = await loadData();
  res.json(data);
});

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

export default app;