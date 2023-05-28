import { Router } from "express";
import axios from "axios";
import { CurrentEmissionData, CurrentEmissions } from "../types";
import { handleApiError } from "../utils/apiHelpers";
import { API_KEY } from "../utils/config";

const currentRouter = Router();

const currentEmissions: CurrentEmissions = {
  consumed: undefined,
  production: undefined,
  cached: false,
};

let lastUpdateTimeMs: number = 0;

currentRouter.get("/", async (_req, res) => {
  const curTime = new Date().getTime();

  // Get new current emission values every 1 minutes
  // otherwise return cached values
  if (lastUpdateTimeMs !== 0 && ((curTime - lastUpdateTimeMs) < 1 * 60 * 1000)) {
    res.status(200).json({
      ...currentEmissions,
      cached: true,
    });
    return;
  }

  lastUpdateTimeMs = curTime;
  try {
    const response = await axios.get(
      "https://api.fingrid.fi/v1/variable/event/json/265,266",
      {
        headers: {
          "x-api-key": API_KEY,
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
    res.status(200).json({
      ...currentEmissions,
      cached: false,
    });
  } catch (err) {
    const apiErrorBody = handleApiError({ responseType: "current", err });
    res.status(apiErrorBody.code).json({ error: apiErrorBody.message });
  }
});

export default currentRouter;
