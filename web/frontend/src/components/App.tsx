import React, { useState, useEffect } from "react";
import { AxiosError } from "axios";
import AppBar from "./AppBar";
import GraphChart from "./GraphChart";
import emissionService from "../services/emissions";
import {
  CurrentEmissions, GraphDatasets, GraphDates, JsonData, Locales,
} from "../types";
import "../styles/main.css";
import Footer from "./Footer";

const App = () => {
  const [currentEmissions, setCurrentEmissions] = useState<CurrentEmissions>({
    consumed: { value: 0, variable_id: 265, start_time: "0" },
    production: { value: 0, variable_id: 266, start_time: "0" },
    cached: false,
  });
  const [graphEmissions, setGraphEmissions] = useState<GraphDatasets>({
    consumed: new Array<JsonData>(),
    production: new Array<JsonData>(),
  });
  const [dates, setDates] = useState<GraphDates>({
    startDate: new Date(),
    endDate: new Date(),
  });
  const [errorText, setErrorText] = useState<string>("");
  const [loadingData, setLoadingData] = useState<boolean>(false);
  const [language, setLanguage] = useState<Locales>("en-gb");

  const loadGraphData = async (): Promise<void> => {
    setLoadingData(true);
    setErrorText("");
    try {
      dates.startDate.setHours(0, 0, 0, 0);
      dates.endDate.setHours(23, 59, 59);
      const consumedResult = await emissionService.getConsumedEmissions(dates);
      const productionResult = await emissionService.getProductionEmissions(dates);
      setGraphEmissions({ consumed: consumedResult, production: productionResult });
    } catch (err) {
      if (err instanceof AxiosError) {
        if (err.response) {
          setErrorText(err.response.data.error);
        } else {
          setErrorText("Could not connect to server");
        }
      }
    }
    setLoadingData(false);
  };

  const getCurrentEmissions = async (initialLoad: boolean): Promise<void> => {
    try {
      const emissions = await emissionService.getCurrentEmissions();
      setCurrentEmissions(emissions);

      // Refresh graph datasets only if last selected day matches current day
      // and if new values were fetched
      // Also, prevent double API fetch on initial load
      if (!emissions.cached && !initialLoad) {
        const curDate = new Date();
        if (curDate.getDate() === dates.endDate.getDate()
        && curDate.getMonth() === dates.endDate.getMonth()
        && curDate.getFullYear() === dates.endDate.getFullYear()) {
          loadGraphData();
        }
      }
    } catch (err) {
      if (err instanceof AxiosError) {
        if (err.response) {
          setErrorText(err.response.data.error);
        } else {
          setErrorText("Could not connect to server");
        }
      }
    }
  };

  // Get current emissions only on first render
  useEffect(() => {
    getCurrentEmissions(true);
  }, []);

  // Get consumed and production emissions when dates change
  useEffect(() => {
    loadGraphData();
  }, [dates]);

  return (
    <div className="main">
      <AppBar
        currentEmissions={currentEmissions}
        refreshFunc={() => getCurrentEmissions(false)}
        language={language}
        languageFunc={setLanguage}
      />
      <GraphChart
        graphEmissions={graphEmissions}
        dates={dates}
        datesFunc={setDates}
        errorText={errorText}
        isLoading={loadingData}
        language={language}
      />
      <Footer language={language} />
    </div>
  );
};

export default App;
