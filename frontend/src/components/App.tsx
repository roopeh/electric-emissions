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

  const getCurrentEmissions = async (): Promise<void> => {
    try {
      const emissions = await emissionService.getCurrentEmissions();
      setCurrentEmissions(emissions);
    } catch (err) {
      if (err instanceof AxiosError) {
        setErrorText(err.response?.data.error);
      }
    }
  };

  // Get current emissions only on first render
  useEffect(() => {
    getCurrentEmissions();
  }, []);

  const loadGraphData = async (): Promise<void> => {
    setLoadingData(true);
    setErrorText("");
    try {
      const consumedResult = await emissionService.getConsumedEmissions(dates);
      const productionResult = await emissionService.getProductionEmissions(dates);
      setGraphEmissions({ consumed: consumedResult, production: productionResult });
    } catch (err) {
      if (err instanceof AxiosError) {
        setErrorText(err.response?.data.error);
      }
    }
    setLoadingData(false);
  };

  // Get consumed and production emissions when dates change
  useEffect(() => {
    loadGraphData();
  }, [dates]);

  const handleRefresh = (): void => {
    getCurrentEmissions();

    const curDate = new Date();

    // Refresh graph datasets only if user is viewing today's values
    if ((curDate.getDate() === dates.startDate.getDate()
    && curDate.getMonth() === dates.startDate.getMonth()
    && curDate.getFullYear() === dates.startDate.getFullYear())
    && (dates.startDate.getDate() === dates.endDate.getDate()
    && dates.startDate.getMonth() === dates.endDate.getMonth()
    && dates.startDate.getFullYear() === dates.endDate.getFullYear())) {
      loadGraphData();
    }
  };

  return (
    <div className="main">
      <AppBar
        currentEmissions={currentEmissions}
        refreshFunc={handleRefresh}
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
