import React from "react";
import IconButton from "@mui/material/IconButton";
import { CurrentEmissionData, CurrentEmissions } from "../types";
import RefreshIcon from "../assets/refresh.png";
import "../styles/AppBar.css";

interface BuildEmissionsProps {
  data: CurrentEmissionData,
}
const BuildCurrentEmissionValue = ({ data }: BuildEmissionsProps): JSX.Element => {
  const isConsumed: boolean = data.variable_id === 265;
  const fontClass: string = data.variable_id === 265
    ? "appBarConsumedFont"
    : "appBarProductionFont";

  return (
    <div className="appBarContainerBox">
      <span>
        Current emission value
        {" "}
        {isConsumed
          ? "for electricity consumed"
          : "of electricity production"}
      </span>
      <div>
        <span className={`appBarEmissionValue ${fontClass}`}>
          {data.value}
        </span>
        <span>
          {" "}
          g CO
          <sub>2</sub>
          {" "}
          / kWh
        </span>
      </div>
    </div>
  );
};

interface AppBarProps {
  currentEmissions: CurrentEmissions,
  refreshFunc: () => void,
}
const AppBar = ({ currentEmissions, refreshFunc }: AppBarProps) => {
  const dateValue = new Date(currentEmissions.consumed.start_time).toLocaleTimeString(
    "default",
    {
      hour: "2-digit",
      minute: "2-digit",
    },
  );

  return (
    <div className="appBar">
      <div className="appBarContainer">
        <BuildCurrentEmissionValue data={currentEmissions.consumed} />
        <BuildCurrentEmissionValue data={currentEmissions.production} />
        <div className="appBarContainerText">
          <span style={{ marginBottom: "8px" }}>
            Updated at
            {" "}
            {dateValue}
          </span>
          <IconButton onClick={refreshFunc}>
            <img
              src={RefreshIcon}
              alt="Refresh"
              className="appBarRefreshIcon"
            />
          </IconButton>
        </div>
      </div>
    </div>
  );
};

export default AppBar;
