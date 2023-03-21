import axios from "axios";
import { CurrentEmissions, GraphDates, JsonData } from "../types";

const apiUrl: string = process.env.NODE_ENV === "production"
  ? ""
  : "http://localhost:3001";

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

const getCurrentEmissions = async (): Promise<CurrentEmissions> => {
  const response = await axios.get(`${apiUrl}/current`);
  return response.data;
};

export default {
  getConsumedEmissions,
  getProductionEmissions,
  getCurrentEmissions,
};
