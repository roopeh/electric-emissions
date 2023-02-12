import React, { useState, useEffect } from "react";
import axios from "axios";
import AppBar from "./AppBar";
import GraphChart from "./GraphChart";
import { JsonData } from "../utils/types";
import "../styles/main.css";

const App = () => {
  const [consumedEmissions, setConsumedEmissions] = useState<Array<JsonData>>([]);

  useEffect(() => {
    const loadData = async () => {
      const consumedResult = await axios.get("http://localhost:3001/consumed");
      if (consumedResult.status === 200) {
        setConsumedEmissions(consumedResult.data);
      }
    };

    loadData();
  }, []);

  console.log(consumedEmissions);

  return (
    <div>
      <AppBar />
      <GraphChart consumedData={consumedEmissions} />
    </div>
  );
};

export default App;
