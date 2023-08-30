import React from "react";
import { Line, getElementAtEvent } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { useRef } from "react";

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler
);
const { shell } = window;

const LineChart = () => {
  const data = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "week days",
        data: [12, 19, 3, 5, 2, 3, 10],
        borderColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return null;
          return getColor(chart);
        },
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return null;
          return getColor(chart);
        },
        tension: 0.4,
        links: [
          "http://www.google.com",
          "http://www.facebook.com",
          "http://www.google.com",
          "http://www.google.com",
          "http://www.google.com",
          "http://www.google.com",
          "http://www.google.com",
        ],
      },
    ],
  };

  const getColor = (chart) => {
    const {
      ctx,
      chartArea: { top, bottom, left, right },
      scales: { x, y },
    } = chart;
    const gradient = ctx.createLinearGradient(0, bottom, 0, top);
    let border = (bottom - y.getPixelForValue(10)) / (bottom - top);
    if (border < 0) border = 0;
    if (border > 1) border = 1;
    gradient.addColorStop(0, "rgba(0, 255, 0, 0.5)");
    gradient.addColorStop(border, "rgba(0, 255, 0, 0.5)");
    gradient.addColorStop(border, "rgba(255, 0, 0, 0.5)");
    gradient.addColorStop(1, "rgba(255, 0, 0, 0.5)");
    return gradient;
  };
  const options = {};

  const chartRef = useRef();

  const onClick = (event) => {
    //console.log(event);
    if (getElementAtEvent(chartRef.current, event).length < 1) return;
    console.log(getElementAtEvent(chartRef.current, event));
    const clickedDatasetIndex = getElementAtEvent(chartRef.current, event)[0]
      .datasetIndex;
    const dataPointIndex = getElementAtEvent(chartRef.current, event)[0].index;
    console.log(clickedDatasetIndex, dataPointIndex);
    const url = data.datasets[clickedDatasetIndex].links[dataPointIndex];
    shell.openExternal(url);
  };
  return (
    <div>
      <Line
        data={data}
        options={options}
        onClick={onClick}
        ref={chartRef}
      ></Line>
    </div>
  );
};

export default LineChart;
