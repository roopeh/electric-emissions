import { Router } from "express";
import axios from "axios";
import { CurrentEmissionData, CurrentEmissions } from "../types";
import { handleApiError } from "../utils/apiHelpers";

const currentRouter = Router();

const currentEmissions: CurrentEmissions = {
  consumed: undefined,
  production: undefined,
};

let lastUpdateTimeMs: number = 0;

currentRouter.get("/", async (_req, res) => {
  const curTime = new Date().getTime();

  // Get new current emission values every 1 minutes
  // otherwise return cached values
  if (lastUpdateTimeMs !== 0 && ((curTime - lastUpdateTimeMs) < 1 * 60 * 1000)) {
    res.status(200).json(currentEmissions);
    return;
  }

  lastUpdateTimeMs = curTime;
  try {
    const response = await axios.get(
      "https://api.fingrid.fi/v1/variable/event/json/265,266",
      {
        headers: {
          "x-api-key": "",
        },
      },
    );
    (response.data as Array<CurrentEmissionData>).forEach((itr) => {
      if (itr.variable_id === 265) {
        currentEmissions.consumed = itr;
      } else {
        currentEmissions.production = itr;
      }
    });
    res.status(200).json(currentEmissions);
  } catch (err) {
    const apiErrorBody = handleApiError({ responseType: "current", err });
    res.status(apiErrorBody.code).json({ error: apiErrorBody.message });
  }
});

export default currentRouter;
