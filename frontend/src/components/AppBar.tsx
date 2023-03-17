import React from "react";
import IconButton from "@mui/material/IconButton";
import localeHelper from "../util/localeHelper";
import { CurrentEmissionData, CurrentEmissions, Locales } from "../types";
import RefreshIcon from "../assets/refresh.png";
import EnglishFlag from "../assets/locales/gb.png";
import FinnishFlag from "../assets/locales/fi.png";
import "../styles/AppBar.css";

interface BuildEmissionsProps {
  data: CurrentEmissionData,
  language: Locales,
}
const BuildCurrentEmissionValue = ({ data, language }: BuildEmissionsProps): JSX.Element => {
  const isConsumed: boolean = data.variable_id === 265;
  const fontClass: string = data.variable_id === 265
    ? "appBarConsumedFont"
    : "appBarProductionFont";

  return (
    <div className="appBarContainerBox">
      <span>
        {localeHelper.getLocalizedString(language, "appBarCurrentEmissionVal")}
        {" "}
        {isConsumed
          ? localeHelper.getLocalizedString(language, "consumedEmission")
          : localeHelper.getLocalizedString(language, "productionEmission")}
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
  language: Locales,
  languageFunc: (val: Locales) => void,
}
const AppBar = ({
  currentEmissions, refreshFunc, language, languageFunc,
}: AppBarProps) => {
  const dateValue = new Date(currentEmissions.consumed.start_time).toLocaleTimeString(
    language,
    {
      hour: "2-digit",
      minute: "2-digit",
    },
  );

  return (
    <div className="appBar">
      <div className="appBarContainer">
        <BuildCurrentEmissionValue data={currentEmissions.consumed} language={language} />
        <BuildCurrentEmissionValue data={currentEmissions.production} language={language} />
        <div className="appBarRightContainer">
          <div className="appBarFlagContainer">
            <IconButton onClick={() => languageFunc("en-gb")}>
              <img
                src={EnglishFlag}
                alt="In English"
                title="In English"
                className={language === "en-gb"
                  ? "appBarLocaleIcon appBarLocaleSelected"
                  : "appBarLocaleIcon"}
              />
            </IconButton>
            <IconButton onClick={() => languageFunc("fi-fi")}>
              <img
                src={FinnishFlag}
                alt="Suomeksi"
                title="Suomeksi"
                className={language === "fi-fi"
                  ? "appBarLocaleIcon appBarLocaleSelected"
                  : "appBarLocaleIcon"}
              />
            </IconButton>
          </div>
          <div className="appBarContainerText">
            <span style={{ marginBottom: "8px" }}>
              {localeHelper.getLocalizedString(language, "appBarUpdatedAt")}
              {" "}
              {dateValue}
            </span>
            <IconButton onClick={refreshFunc}>
              <img
                src={RefreshIcon}
                alt={localeHelper.getLocalizedString(language, "appBarRefresh")}
                title={localeHelper.getLocalizedString(language, "appBarRefresh")}
                className="appBarRefreshIcon"
              />
            </IconButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppBar;
