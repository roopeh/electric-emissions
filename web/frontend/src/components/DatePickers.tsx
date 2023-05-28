import React, { ButtonHTMLAttributes } from "react";
import Button from "@mui/material/Button";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import localeHelper from "../util/localeHelper";
import { GraphDates, Locales } from "../types";

const GraphButtonStyle: React.CSSProperties = {
  marginBottom: "0.5em",
  backgroundColor: "#4d525678",
  borderTop: "0",
  fontSize: "0.7rem",
};

const CustomDatePickerNode = (
  props: React.DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ref: React.Ref<HTMLButtonElement>,
) => {
  // eslint-disable-next-line react/prop-types
  const { onClick, value } = props;
  return (
    <Button
      variant="contained"
      size="small"
      onClick={onClick}
      style={GraphButtonStyle}
    >
      {value}
    </Button>
  );
};

interface PickerProps {
  selectedValue: Date,
  onChange: (date: Date) => void,
  language: Locales,
}

const CustomizedPickerInput = ({ selectedValue, onChange, language }: PickerProps) => (
  <ReactDatePicker
    selected={selectedValue}
    dateFormat={language === "fi-fi" ? "dd.MM.yyyy" : "MM/dd/yyyy"}
    locale={language}
    onChange={onChange}
    customInput={React.createElement(React.forwardRef(CustomDatePickerNode))}
  />
);

interface DateButtonProps {
  onClick: () => void,
  text: string,
}
const DateButton = ({ onClick, text }: DateButtonProps) => (
  <Button
    variant="contained"
    size="small"
    onClick={onClick}
    style={{
      marginRight: "20px",
      borderTopLeftRadius: "0",
      borderTopRightRadius: "0",
      ...GraphButtonStyle,
    }}
  >
    {text}
  </Button>
);

interface DatePickerProps {
  dates: GraphDates,
  changeDatesFnc: (dates: GraphDates) => void,
  language: Locales,
}
const DatePickers = ({ dates, changeDatesFnc, language }: DatePickerProps) => {
  const validateStartDate = (date: Date): void => {
    const validDate = date > dates.endDate ? dates.endDate : date;
    if (validDate.getFullYear() === dates.startDate.getFullYear()
      && validDate.getMonth() === dates.startDate.getMonth()
      && validDate.getDate() === dates.startDate.getDate()) {
      // Do not update state hook if the day didn't change
      return;
    }
    changeDatesFnc({ ...dates, startDate: validDate });
  };
  const validateEndDate = (date: Date): void => {
    const validDate = date < dates.startDate ? dates.startDate : date;
    if (validDate.getFullYear() === dates.endDate.getFullYear()
      && validDate.getMonth() === dates.endDate.getMonth()
      && validDate.getDate() === dates.endDate.getDate()) {
      // Do not update state hook if the day didn't change
      return;
    }
    changeDatesFnc({ ...dates, endDate: validDate });
  };

  const chooseFixedLastDays = (days: number): void => {
    const now = new Date();
    const newStartDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
    changeDatesFnc({ startDate: newStartDate, endDate: now });
  };

  return (
    <div className="graphDateContainer">
      <div className="graphFixedDateContainer">
        <DateButton
          onClick={() => chooseFixedLastDays(0)}
          text={localeHelper.getLocalizedString(language, "datePickerToday")}
        />
        <DateButton
          onClick={() => chooseFixedLastDays(3)}
          text={localeHelper.getLocalizedString(language, "datePicker3days")}
        />
        <DateButton
          onClick={() => chooseFixedLastDays(7)}
          text={localeHelper.getLocalizedString(language, "datePicker7days")}
        />
        <DateButton
          onClick={() => chooseFixedLastDays(14)}
          text={localeHelper.getLocalizedString(language, "datePicker14days")}
        />
        <DateButton
          onClick={() => chooseFixedLastDays(30)}
          text={localeHelper.getLocalizedString(language, "datePicker30days")}
        />
        <DateButton
          onClick={() => chooseFixedLastDays(90)}
          text={localeHelper.getLocalizedString(language, "datePicker3months")}
        />
      </div>
      <div className="graphDatePickerContainer">
        <span>{`${localeHelper.getLocalizedString(language, "datePickerCustom")}:`}</span>
        <div className="graphDatePicker">
          <CustomizedPickerInput
            selectedValue={dates.startDate}
            onChange={validateStartDate}
            language={language}
          />
        </div>
        -
        <div className="graphDatePicker">
          <CustomizedPickerInput
            selectedValue={dates.endDate}
            onChange={validateEndDate}
            language={language}
          />
        </div>
      </div>
    </div>
  );
};

export default DatePickers;
