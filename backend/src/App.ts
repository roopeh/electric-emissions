import cors from "cors";
import express from "express";
import currentRouter from "./controllers/current";
import consumedRouter from "./controllers/consumed";
import { notFoundMiddleware, errorHandlerMiddleware } from "./utils/middleware";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/current", currentRouter);
app.use("/consumed", consumedRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

export default app;
