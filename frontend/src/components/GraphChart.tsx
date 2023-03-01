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
import { GraphDates, GraphDatasets, JsonData } from "../types";
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

const GraphChart = () => {
  const [dates, setDates] = useState<GraphDates>({
    startDate: new Date(),
    endDate: new Date(),
  });
  const [graphEmissions, setGraphEmissions] = useState<GraphDatasets>({
    consumed: new Array<JsonData>(),
    production: new Array<JsonData>(),
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const isoStartDate = dates.startDate.toISOString();
        const isoEndDate = dates.endDate.toISOString();
        const consumedResult = await axios.get(`http://localhost:3001/consumed/${isoStartDate}/${isoEndDate}`);
        const productionResult = await axios.get(`http://localhost:3001/production/${isoStartDate}/${isoEndDate}`);
        setGraphEmissions({ consumed: consumedResult.data, production: productionResult.data });
      } catch (err) {
        if (err instanceof AxiosError) {
          console.log(err.response?.data);
          console.log(err.response?.status);
        }
      }
    };

    loadData();
  }, [dates]);

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
              if (tick.major && date.getHours() === 0) {
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
            `Emission factor ${label.datasetIndex === 0
              ? "for electricity consumed"
              : "of electricity production"
            }: ${label.formattedValue} g CO2 / kWh`
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
    labels: graphEmissions.consumed.map((itr) => itr.start_time),
    datasets: [
      {
        label: "Emission factor for electricity consumed in Finland",
        data: graphEmissions.consumed.map((itr) => itr.value),
        borderColor: "rgb(255, 99, 132)",
        pointRadius: 0,
      },
      {
        label: "Emission factor of electricity production in Finland",
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
      <DatePickers
        dates={dates}
        changeDatesFnc={setDates}
      />
      <br />
      <div className="graphContainer">
        <Line options={options} data={chartData} plugins={chartPlugins} />
      </div>
    </>
  );
};

export default GraphChart;
