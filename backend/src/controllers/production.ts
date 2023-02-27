import axios from "axios";
import { Router } from "express";
import { handleApiError, validateDates } from "../utils/apiHelpers";

const sampleProductionData = require("../sampleData/production.json");

const productionRouter = Router();

productionRouter.get("/:startDateStr/:endDateStr", async (req, res) => {
  const { startDateStr, endDateStr } = req.params;
  const {
    code, message,
  } = validateDates({ startDateStr, endDateStr });
  if (code !== 200) {
    res.status(code).json({ error: message });
    return;
  }
  try {
    /* const response = await axios.get(
      `https://api.fingrid.fi/v1/variable/266/events/json?start_time=${apiStartDate}&end_time=${apiEndDate}`,
      {
        headers: {
          "x-api-key": "",
        },
      },
    );
    res.status(200).json(response.data); */
    await axios.get("https://www.google.fi");
    res.status(200).json(sampleProductionData);
  } catch (err) {
    const apiErrorBody = handleApiError({ responseType: "production", err });
    res.status(apiErrorBody.code).json({ error: apiErrorBody.message });
  }
});

export default productionRouter;
