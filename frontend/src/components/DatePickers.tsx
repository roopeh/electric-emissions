import React from "react";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import localeHelper from "../util/localeHelper";
import { GraphDates, Locales } from "../types";

interface DatePickerProps {
  dates: GraphDates,
  changeDatesFnc: (dates: GraphDates) => void,
  language: Locales,
}

interface PickerProps {
  selectedValue: Date,
  onChange: (date: Date) => void,
}

const DateStartPicker = ({ selectedValue, onChange }: PickerProps) => (
  <ReactDatePicker selected={selectedValue} onChange={onChange}>
    <div>start</div>
  </ReactDatePicker>
);

const DateEndPicker = ({ selectedValue, onChange }: PickerProps) => (
  <ReactDatePicker selected={selectedValue} onChange={onChange}>
    <div>end</div>
  </ReactDatePicker>
);

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
      <div className="graphDatePickers">
        <div><DateStartPicker selectedValue={dates.startDate} onChange={validateStartDate} /></div>
        <div><DateEndPicker selectedValue={dates.endDate} onChange={validateEndDate} /></div>
      </div>
      <div className="graphFixedDateContainer">
        <button type="button" onClick={() => chooseFixedLastDays(0)}>
          {localeHelper.getLocalizedString(language, "datePickerToday")}
        </button>
        <button type="button" onClick={() => chooseFixedLastDays(3)}>
          {localeHelper.getLocalizedString(language, "datePicker3days")}
        </button>
        <button type="button" onClick={() => chooseFixedLastDays(7)}>
          {localeHelper.getLocalizedString(language, "datePicker7days")}
        </button>
        <button type="button" onClick={() => chooseFixedLastDays(14)}>
          {localeHelper.getLocalizedString(language, "datePicker14days")}
        </button>
        <button type="button" onClick={() => chooseFixedLastDays(30)}>
          {localeHelper.getLocalizedString(language, "datePicker30days")}
        </button>
        <button type="button" onClick={() => chooseFixedLastDays(90)}>
          {localeHelper.getLocalizedString(language, "datePicker3months")}
        </button>
      </div>
    </div>
  );
};

export default DatePickers;
