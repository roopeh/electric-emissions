import React from "react";
import localeHelper from "../util/localeHelper";
import { Locales } from "../types";
import "../styles/Footer.css";

interface FooterProps {
  language: Locales,
}

const Footer = ({ language }: FooterProps) => (
  <div className="footer">
    <div className="footerContent">
      <h2>{localeHelper.getLocalizedString(language, "footerAbout")}</h2>
      <p>{localeHelper.getLocalizedString(language, "footer1Par")}</p>
      <p>{localeHelper.getLocalizedString(language, "footer2Par")}</p>
      <p>{localeHelper.getLocalizedString(language, "footer3Par")}</p>
      <p>{localeHelper.getLocalizedString(language, "footer4Par")}</p>
    </div>
  </div>
);

export default Footer;
