import React from "react";
import {
  Chart as ChartJS, ChartData, CategoryScale, Legend, LinearScale, LineElement,
  PointElement, Title, Tooltip, ChartOptions, TimeScale, Plugin,
} from "chart.js";
import { AnyObject } from "chart.js/dist/types/basic";
import "chartjs-adapter-date-fns";
import { Line } from "react-chartjs-2";
import Modal from "@mui/material/Modal";
import CircularProgress from "@mui/material/CircularProgress";
import DatePickers from "./DatePickers";
import localeHelper from "../util/localeHelper";
import { GraphDatasets, GraphDates, Locales } from "../types";
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

interface GraphChartProps {
  graphEmissions: GraphDatasets,
  dates: GraphDates,
  datesFunc: (val: GraphDates) => void,
  errorText: string,
  isLoading: boolean,
  language: Locales,
}

const GraphChart = ({
  graphEmissions, dates, datesFunc, errorText, isLoading, language,
}: GraphChartProps) => {
  const options: ChartOptions<"line"> = {
    responsive: true,
    animation: false,
    interaction: {
      intersect: false,
      mode: "index",
    },
    scales: {
      y: {
        // Begin at zero
        min: 0,
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
          scale.max += 10;
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
            const { tick, index } = ctx;
            if (tick) {
              const date = new Date(tick.value);
              if (index === 0 && (dates.startDate.getDate() === dates.endDate.getDate()
                  && dates.startDate.getMonth() === dates.endDate.getMonth()
                  && dates.startDate.getFullYear() === dates.endDate.getFullYear())) {
                // Always show first tick for current day
                tick.major = true;
                tick.label = date.toLocaleDateString(language, {
                  day: "2-digit",
                  month: "short",
                });
              } else if ((tick.major && date.getHours() === 0)
                || (date.getHours() === 0 && date.getMinutes() === 0)) {
                tick.label = date.toLocaleDateString(language, {
                  day: "2-digit",
                  month: "short",
                });
              } else {
                tick.label = date.toLocaleTimeString(language, {
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
            `${localeHelper.getLocalizedString(language, "graphChartLabel")} ${label.datasetIndex === 0
              ? localeHelper.getLocalizedString(language, "consumedEmission")
              : localeHelper.getLocalizedString(language, "productionEmission")
            }: ${label.formattedValue} g CO2 / kWh`
          ),
          title(tooltipItems) {
            const rawTime = tooltipItems.at(0)?.parsed.x;
            if (!rawTime) {
              return localeHelper.getLocalizedString(language, "graphChartUnknownDate");
            }
            return new Date(rawTime).toLocaleDateString(language, {
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
    labels: graphEmissions.consumed.map((itr) => itr.start_time),
    datasets: [
      {
        label: localeHelper.getLocalizedString(language, "graphChartConsumedDatasetLabel"),
        data: graphEmissions.consumed.map((itr) => itr.value),
        borderColor: "rgb(255, 99, 132)",
        pointRadius: 0,
      },
      {
        label: localeHelper.getLocalizedString(language, "graphChartProductionDatasetLabel"),
        data: graphEmissions.production.map((itr) => itr.value),
        borderColor: "rgb(99, 255, 132)",
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

  return (
    <>
      <Modal
        open={isLoading}
        onClose={() => null}
        hideBackdrop
      >
        <div className="graphLoadingModal">
          <CircularProgress style={{ color: "darkgray" }} />
        </div>
      </Modal>
      <DatePickers
        dates={dates}
        changeDatesFnc={datesFunc}
        language={language}
      />
      <br />
      {errorText && errorText.length > 0 && (
        <span className="errorText">{`Error: ${errorText}`}</span>
      )}
      <div className="graphContainer">
        <Line options={options} data={chartData} plugins={chartPlugins} />
      </div>
    </>
  );
};

export default GraphChart;
