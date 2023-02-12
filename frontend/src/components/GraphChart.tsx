import React from "react";
import {
  Chart as ChartJS, ChartData, CategoryScale, Legend, LinearScale, LineElement,
  PointElement, Title, Tooltip, ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { JsonData } from "../utils/types";
import "react-datepicker/dist/react-datepicker.css";
import "../styles/GraphChart.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

interface GraphChartProps {
  consumedData: Array<JsonData>,
}

const GraphChart = ({ consumedData }: GraphChartProps) => {
  const generateDateLabels = (dates: Array<string>): Array<string> => {
    let previousDay: number = -1;
    return dates.map((rawDate) => {
      const date = new Date(rawDate);
      if (previousDay !== date.getDate()) {
        previousDay = date.getDate();
        return date.toLocaleDateString("default", {
          day: "2-digit",
          month: "short",
        });
      }
      return date.toLocaleTimeString("default", {
        hour: "2-digit",
        minute: "2-digit",
      });
    });
  };
  const options: ChartOptions<"line"> = {
    responsive: true,
    scales: {
      y: {
        afterDataLimits(scale) {
          // eslint-disable-next-line no-param-reassign
          scale.max += 5;
        },
      },
    },
    plugins: {
      legend: {
        position: "top" as const,
      },
      /* title: {
        display: true,
        text: "Test title",
      }, */
    },
  };

  const chartData: ChartData<"line"> = {
    labels: generateDateLabels(consumedData.map((itr) => itr.start_time)),
    datasets: [
      {
        label: "Emission factor for electricity consumed in Finland",
        data: consumedData.map((itr) => itr.value),
        borderColor: "rgb(255, 99, 132)",
      },
    ],
  };

  return (
    <div className="graphContainer">
      <div className="graphLabelLegend">
        g CO
        <sub>2</sub>
        {" / kWh"}
      </div>
      <Line options={options} data={chartData} />
    </div>
  );
};

export default GraphChart;
