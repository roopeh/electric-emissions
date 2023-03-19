import axios from "axios";
import { Router } from "express";
import { handleApiError, validateDates } from "../utils/apiHelpers";
import { API_KEY } from "../utils/config";

const sampleConsumedData = require("../sampleData/consumed.json");

// For debugging
const useConstantData: boolean = false;

const consumedRouter = Router();

consumedRouter.get("/:startDateStr/:endDateStr", async (req, res) => {
  const { startDateStr, endDateStr } = req.params;
  const {
    code, message, isoStartDate, isoEndDate,
  } = validateDates({ startDateStr, endDateStr });
  if (code !== 200) {
    res.status(code).json({ error: message });
    return;
  }
  try {
    if (useConstantData) {
      res.status(200).json(sampleConsumedData);
    } else {
      const response = await axios.get(
        `https://api.fingrid.fi/v1/variable/265/events/json?start_time=${isoStartDate}&end_time=${isoEndDate}`,
        {
          headers: {
            "x-api-key": API_KEY,
          },
        },
      );
      res.status(200).json(response.data);
    }
  } catch (err) {
    const apiErrorBody = handleApiError({ responseType: "consumed", err });
    res.status(apiErrorBody.code).json({ error: apiErrorBody.message });
  }
});

export default consumedRouter;
