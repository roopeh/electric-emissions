export type JsonData = {
  value: number,
  start_time: string,
  end_time: string,
};

export type GraphDates = {
  startDate: Date,
  endDate: Date,
};

export type GraphDatasets = {
  consumed: Array<JsonData>,
  production: Array<JsonData>,
};

export type CurrentEmissionData = {
  value: number,
  variable_id: number,
  start_time: string,
};

export type CurrentEmissions = {
  consumed: CurrentEmissionData,
  production: CurrentEmissionData,
};
