import React from "react";
import { Bar, getElementAtEvent } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { useRef } from "react";
import { colors } from "@mui/material";
const { shell } = window;

ChartJS.register(
  BarElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

const BarChart = () => {
  const data = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "sales numbers",
        data: [12, 19, 3, 5.2, 2, 3, 10],
        borderColor: "black",
        backgroundColor: [
          "rgba(25, 20, 255, 0.9)",
          "green",
          "peru",
        ],
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

  const chartRef = useRef(null);
  const options = {
    scales: {
      x: {
        title: {
            display: true,
            text: 'days of the week',
            color: 'red'
        }
      },
      y: {
        title: {
            display: true,
            text: 'sales numbers',
            color: 'red'
        }
      },
    },
  };
  const onClick = (event) => {
    if (getElementAtEvent(chartRef.current, event).length < 1) return;
    console.log(getElementAtEvent(chartRef.current, event));
    const clickedDatasetIndex = getElementAtEvent(chartRef.current, event)[0]
      .datasetIndex;
    const dataPointIndex = getElementAtEvent(chartRef.current, event)[0].index;
    console.log(clickedDatasetIndex, dataPointIndex);
    const url = data.datasets[clickedDatasetIndex].links[dataPointIndex];
    shell.openExternal(url);
  };

  const segmentHighlighter = {
    id: "segmentHighlighter",
    beforeDraw: (chart, args, options) => {
        const {ctx, chartArea: {left, top, width, height}, tooltip, scales:{x,y}} = chart;
        ctx.save();
        if(tooltip._active[0]) {
            console.log(tooltip._active[0].index);
            const xCoord = x.getPixelForValue(tooltip._active[0].index);
            const width1 = chart.getDatasetMeta(0).data[0].width;
            const segmentWidth = x.width / data.labels.length;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.fillRect(xCoord-segmentWidth/2, top, segmentWidth, height);
        };
    }
  }
  return (
    <div>
      <Bar data={data} options={options} onClick={onClick} ref={chartRef} plugins={[segmentHighlighter]}></Bar>
    </div>
  );
};

export default BarChart;
