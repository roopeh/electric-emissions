import React from "react";
import AppBar from "./AppBar";
import GraphChart from "./GraphChart";
import "../styles/main.css";

// eslint-disable-next-line arrow-body-style
const App = () => {
  return (
    <div>
      <AppBar />
      <GraphChart />
    </div>
  );
};

export default App;
