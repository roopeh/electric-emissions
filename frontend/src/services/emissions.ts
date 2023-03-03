import axios from "axios";
import { GraphDates, JsonData } from "../types";

const apiUrl: string = "http://localhost:3001";

const getConsumedEmissions = async (dates: GraphDates): Promise<Array<JsonData>> => {
  const isoStartDate = dates.startDate.toISOString();
  const isoEndDate = dates.endDate.toISOString();
  const response = await axios.get(`${apiUrl}/consumed/${isoStartDate}/${isoEndDate}`);
  return response.data;
};

const getProductionEmissions = async (dates: GraphDates): Promise<Array<JsonData>> => {
  const isoStartDate = dates.startDate.toISOString();
  const isoEndDate = dates.endDate.toISOString();
  const response = await axios.get(`${apiUrl}/production/${isoStartDate}/${isoEndDate}`);
  return response.data;
};

export default {
  getConsumedEmissions,
  getProductionEmissions,
};