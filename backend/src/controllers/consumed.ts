import axios, { AxiosError } from "axios";
import { Router } from "express";
import { logError } from "../utils/logger";

const consumedRouter = Router();

consumedRouter.get("/:startDateStr/:endDateStr", async (req, res) => {
  const { startDateStr, endDateStr } = req.params;
  const startDate = new Date(startDateStr);
  if (!startDate.getTime()) {
    res.status(400).json({ error: "Invalid start date" });
    return;
  }
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(endDateStr);
  if (!endDate.getTime()) {
    res.status(400).json({ error: "Invalid end date" });
    return;
  }
  endDate.setHours(23, 59, 59);

  const apiStartDate = `${startDate.toISOString().substring(0, 19)}Z`;
  const apiEndDate = `${endDate.toISOString().substring(0, 19)}Z`;
  try {
    const response = await axios.get(
      `https://api.fingrid.fi/v1/variable/265/events/json?start_time=${apiStartDate}&end_time=${apiEndDate}`,
      {
        headers: {
          "x-api-key": "",
        },
      },
    );
    res.status(200).json(response.data);
  } catch (err) {
    if (err instanceof AxiosError) {
      const errCode = err.response ? err.response.status : 400;
      let errMsg = "";
      if (errCode === 503) {
        errMsg = "Api is down for mainteance";
      } else if (errCode === 416) {
        errMsg = "Time between start date and end date is too large";
      } else if (errCode === 422 || errCode === 400) {
        errMsg = "Invalid date values";
      } else {
        errMsg = "Unknown error while fetching data";
        logError(`Unknown error with code ${errCode} while fetching consumed data from api`);
      }
      res.status(errCode).json({ error: errMsg });
    } else {
      res.status(400).json({ error: "Unknown server error" });
      logError("Unknown non-Axios error while fetching consumed data from api");
    }
  }
});

export default consumedRouter;
