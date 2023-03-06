import { AxiosError } from "axios";
import { ApiErrorResponseBody, ValidateDatesResponse } from "../types";
import { logError } from "./logger";

interface DateProps {
  startDateStr: string,
  endDateStr: string,
}

interface ApiErrorProps {
  responseType: "consumed" | "production" | "current",
  err: unknown,
}

export const validateDates = ({ startDateStr, endDateStr }: DateProps): ValidateDatesResponse => {
  const startDate = new Date(startDateStr);
  if (!startDate.getTime()) {
    return {
      code: 400,
      message: "Invalid start date",
      isoStartDate: "null",
      isoEndDate: "null",
    };
  }
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(endDateStr);
  if (!endDate.getTime()) {
    return {
      code: 400,
      message: "Invalid end date",
      isoStartDate: "null",
      isoEndDate: "null",
    };
  }
  endDate.setHours(23, 59, 59);

  const isoStartDate = `${startDate.toISOString().substring(0, 19)}Z`;
  const isoEndDate = `${endDate.toISOString().substring(0, 19)}Z`;
  return {
    code: 200,
    message: "",
    isoStartDate,
    isoEndDate,
  };
};

export const handleApiError = ({ responseType, err }: ApiErrorProps): ApiErrorResponseBody => {
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
      logError(`Unknown error with code ${errCode} while fetching ${responseType} data from api`);
    }
    return { code: errCode, message: errMsg };
  }

  logError(`Unknown non-Axios error while fetching ${responseType} data from api`);
  return { code: 400, message: "Unknown server error" };
};
