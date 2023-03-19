import React from "react";
import IconButton from "@mui/material/IconButton";
import localeHelper from "../util/localeHelper";
import { CurrentEmissionData, CurrentEmissions, Locales } from "../types";
import RefreshIcon from "../assets/refresh.png";
import EnglishFlag from "../assets/locales/gb.png";
import FinnishFlag from "../assets/locales/fi.png";
import "../styles/AppBar.css";

interface BuildEmissionsProps {
  data: CurrentEmissionData | undefined,
  isConsumedEmissions: boolean,
  language: Locales,
}
const BuildCurrentEmissionValue = ({
  data, isConsumedEmissions, language,
}: BuildEmissionsProps): JSX.Element => {
  const fontClass: string = isConsumedEmissions
    ? "appBarConsumedFont"
    : "appBarProductionFont";

  return (
    <div className="appBarContainerBox">
      <span>
        {localeHelper.getLocalizedString(language, "appBarCurrentEmissionVal")}
        {" "}
        {isConsumedEmissions
          ? localeHelper.getLocalizedString(language, "consumedEmission")
          : localeHelper.getLocalizedString(language, "productionEmission")}
      </span>
      <div>
        <span className={`appBarEmissionValue ${fontClass}`}>
          {data ? data.value : 0}
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
  currentEmissions: CurrentEmissions | undefined,
  refreshFunc: () => void,
  language: Locales,
  languageFunc: (val: Locales) => void,
}
const AppBar = ({
  currentEmissions, refreshFunc, language, languageFunc,
}: AppBarProps) => {
  const dateValue: string = !currentEmissions
    ? "N/A"
    : new Date(currentEmissions.consumed.start_time).toLocaleTimeString(
      language,
      {
        hour: "2-digit",
        minute: "2-digit",
      },
    );

  return (
    <div className="appBar">
      <div className="appBarContainer">
        <BuildCurrentEmissionValue
          data={currentEmissions?.consumed}
          isConsumedEmissions
          language={language}
        />
        <BuildCurrentEmissionValue
          data={currentEmissions?.production}
          isConsumedEmissions={false}
          language={language}
        />
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
