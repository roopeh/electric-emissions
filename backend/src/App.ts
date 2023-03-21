import cors from "cors";
import express from "express";
import currentRouter from "./controllers/current";
import consumedRouter from "./controllers/consumed";
import productionRouter from "./controllers/production";
import { notFoundMiddleware, errorHandlerMiddleware } from "./utils/middleware";

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static("build/frontend"));

app.use("/current", currentRouter);
app.use("/consumed", consumedRouter);
app.use("/production", productionRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

export default app;
