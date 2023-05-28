export type ApiErrorResponseBody = {
  code: number,
  message: string,
};

type ApiDates = {
  isoStartDate: string,
  isoEndDate: string,
};

export type ValidateDatesResponse = ApiErrorResponseBody & ApiDates;

export type CurrentEmissionData = {
  value: number,
  variable_id: number,
  start_time: string,
};

export type CurrentEmissions = {
  consumed: CurrentEmissionData | undefined,
  production: CurrentEmissionData | undefined,
  cached: boolean,
};
