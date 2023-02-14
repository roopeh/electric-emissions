import React from "react";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface DatePickerProps {
  startDate: Date,
  endDate: Date,
  startChangeFunc: (date: Date) => void,
  endChangeFunc: (date: Date) => void,
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

const DatePickers = ({
  startDate, endDate, startChangeFunc, endChangeFunc,
}: DatePickerProps) => {
  const validateStartDate = (date: Date): void => startChangeFunc(date > endDate ? endDate : date);
  const validateEndDate = (date: Date): void => endChangeFunc(date < startDate ? startDate : date);

  return (
    <div className="graphDateContainer">
      <div><DateStartPicker selectedValue={startDate} onChange={validateStartDate} /></div>
      <div><DateEndPicker selectedValue={endDate} onChange={validateEndDate} /></div>
    </div>
  );
};

export default DatePickers;
