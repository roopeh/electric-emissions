export type ApiErrorResponseBody = {
  code: number,
  message: string,
};

type ApiDates = {
  isoStartDate: string,
  isoEndDate: string,
};

export type ValidateDatesResponse = ApiErrorResponseBody & ApiDates;
