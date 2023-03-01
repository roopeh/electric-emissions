import React from "react";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { GraphDates } from "../types";

interface DatePickerProps {
  dates: GraphDates,
  changeDatesFnc: (dates: GraphDates) => void,
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

const DatePickers = ({ dates, changeDatesFnc }: DatePickerProps) => {
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
          Today
        </button>
        <button type="button" onClick={() => chooseFixedLastDays(3)}>
          Last 3 days
        </button>
        <button type="button" onClick={() => chooseFixedLastDays(7)}>
          Last 7 days
        </button>
        <button type="button" onClick={() => chooseFixedLastDays(14)}>
          Last 14 days
        </button>
        <button type="button" onClick={() => chooseFixedLastDays(30)}>
          Last 30 days
        </button>
        <button type="button" onClick={() => chooseFixedLastDays(90)}>
          Last 3 months
        </button>
      </div>
    </div>
  );
};

export default DatePickers;
