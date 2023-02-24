import React, { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";
import {
  Chart as ChartJS, ChartData, CategoryScale, Legend, LinearScale, LineElement,
  PointElement, Title, Tooltip, ChartOptions, TimeScale, Plugin,
} from "chart.js";
import { AnyObject } from "chart.js/dist/types/basic";
import "chartjs-adapter-date-fns";
import { Line } from "react-chartjs-2";
import DatePickers from "./DatePickers";
import { JsonData } from "../utils/types";
import "../styles/GraphChart.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

const canToggleMajorHourLabels = (initDate: Date | null): boolean => {
  const start = !initDate || !initDate.getTime() ? new Date() : initDate;
  start.setHours(0, 0, 0, 0);
  const hourDiff = (new Date().getTime() - start.getTime()) / 1000 / 3600;
  // Show hours in major ticks only if current time is less than 6 hours after midnight
  return hourDiff <= 6;
};

// Declare outside of TSX element, otherwise i.e. chart re-render resets it
let toggleMajorHourLabels = canToggleMajorHourLabels(null);

const updateMajorLabels = (start: Date, end: Date): void => {
  if (start.getDate() === end.getDate()) {
    toggleMajorHourLabels = canToggleMajorHourLabels(start);
  } else {
    toggleMajorHourLabels = false;
  }
};

const GraphChart = () => {
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [consumedEmissions, setConsumedEmissions] = useState<Array<JsonData>>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const isoStartDate = startDate.toISOString();
        const isoEndDate = endDate.toISOString();
        const consumedResult = await axios.get(`http://localhost:3001/consumed/${isoStartDate}/${isoEndDate}`);
        setConsumedEmissions(consumedResult.data);
      } catch (err) {
        if (err instanceof AxiosError) {
          console.log(err.response?.data);
          console.log(err.response?.status);
        }
      }
    };

    loadData();
  }, [startDate, endDate]);

  const options: ChartOptions<"line"> = {
    responsive: true,
    interaction: {
      intersect: false,
      mode: "index",
    },
    // spanGaps: true,
    scales: {
      y: {
        title: {
          display: true,
          text: "g CO2 / kWh",
          font: {
            lineHeight: 2,
            size: 14,
            style: "normal",
          },
          padding: {
            top: 0,
            y: 0,
            bottom: 10,
          },
        },
        position: "left",
        afterDataLimits(scale) {
          // eslint-disable-next-line no-param-reassign
          scale.max += 5;
          if (scale.min >= 5) {
            // eslint-disable-next-line no-param-reassign
            scale.min -= 5;
          }
        },
      },
      y1: {
        title: {
          display: true,
          text: "g CO2 / kWh",
          font: {
            lineHeight: 2,
            size: 14,
            style: "normal",
          },
          padding: {
            top: 0,
            y: 0,
            bottom: 10,
          },
        },
        position: "right",
        afterBuildTicks: (axis) => {
          // eslint-disable-next-line no-param-reassign
          axis.ticks = [...axis.chart.scales.y.ticks];
          // eslint-disable-next-line no-param-reassign
          axis.min = axis.chart.scales.y.min;
          // eslint-disable-next-line no-param-reassign
          axis.max = axis.chart.scales.y.max;
        },
      },
      x: {
        type: "time",
        bounds: "ticks",
        ticks: {
          major: {
            enabled: true,
          },
          font: ((ctx) => {
            const { tick } = ctx;
            if (tick) {
              const date = new Date(tick.value);
              if (tick.major && !toggleMajorHourLabels) {
                tick.label = date.toLocaleDateString("default", {
                  day: "2-digit",
                  month: "short",
                });
              } else {
                tick.label = date.toLocaleTimeString("default", {
                  hour: "2-digit",
                  minute: "2-digit",
                });
              }
            }
            return { weight: tick && tick.major ? "bold" : "" };
          }),
        },
      },
    },
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        callbacks: {
          label: (label) => (
            `Emission factor for electricity consumed: ${label.formattedValue} g CO2 / kWh`
          ),
          title(tooltipItems) {
            const rawTime = tooltipItems.at(0)?.parsed.x;
            if (!rawTime) {
              return "Unknown date";
            }
            return new Date(rawTime).toLocaleDateString("default", {
              weekday: "long",
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            });
          },
        },
      },
      /* title: {
        display: true,
        text: "Test title",
      }, */
    },
  };

  const chartData: ChartData<"line"> = {
    labels: consumedEmissions.map((itr) => itr.start_time),
    datasets: [
      {
        label: "Emission factor for electricity consumed in Finland",
        data: consumedEmissions.map((itr) => itr.value),
        borderColor: "rgb(255, 99, 132)",
        pointRadius: 0,
      },
    ],
  };

  const chartPlugins: Plugin<"line", AnyObject>[] = [{
    id: "customStrokeLinePlugin",
    afterDraw(chart) {
      const firstElement = chart.tooltip?.getActiveElements().at(0);
      if (firstElement) {
        const { x } = firstElement.element;
        const yAxis = chart.scales.y;
        const context = chart.ctx;
        context.save();
        context.beginPath();
        context.moveTo(x, yAxis.top);
        context.lineTo(x, yAxis.bottom);
        context.lineWidth = 2;
        context.strokeStyle = "rgba(255, 0, 0, 0.4)";
        context.stroke();
        context.restore();
      }
    },
  }];

  const changeStartDate = (date: Date): void => {
    if (date.getFullYear() === startDate.getFullYear()
      && date.getMonth() === startDate.getMonth()
      && date.getDate() === startDate.getDate()) {
      // Do not update state hook if the day didn't change
      return;
    }
    updateMajorLabels(date, endDate);
    setStartDate(date);
  };

  const changeEndDate = (date: Date): void => {
    if (date.getFullYear() === endDate.getFullYear()
      && date.getMonth() === endDate.getMonth()
      && date.getDate() === endDate.getDate()) {
      // Do not update state hook if the day didn't change
      return;
    }
    updateMajorLabels(startDate, date);
    setEndDate(date);
  };

  return (
    <>
      <DatePickers
        startDate={startDate}
        endDate={endDate}
        startChangeFunc={changeStartDate}
        endChangeFunc={changeEndDate}
      />
      <br />
      <div className="graphContainer">
        <Line options={options} data={chartData} plugins={chartPlugins} />
      </div>
    </>
  );
};

export default GraphChart;
