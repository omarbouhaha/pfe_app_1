import React from "react";
import { Bar, getElementAtEvent } from "react-chartjs-2";
import { useRef } from "react";
import {
  Chart as ChartJS,
  BarElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  BarElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

const { shell } = window;
const BarChartKeepBG = () => {
    const getBarColor = (chart) => {
        // console.log(chart);
        const {
          ctx,
          chartArea: { top, bottom, left, right },
          scales: { x, y },
        } = chart;
        // console.log(
        //   x,
        //   y,
        //   "top",
        //   top,
        //   "bottom",
        //   bottom,
        //   "left",
        //   left,
        //   "right",
        //   right
        // );
        // vertical gradient from top to bottom
        const gradient = ctx.createLinearGradient(0, top, 0, bottom);
        // console.log(y.getPixelForValue(9));
        // the border is the percentage of the threshold value, we can declare multiple thresholds
        let border = (bottom - y.getPixelForValue(9)) / (bottom - top);
        if (border < 0) border = 0;
        if (border > 1) border = 1;
        gradient.addColorStop(0, "red");
        gradient.addColorStop(border, "red");
        gradient.addColorStop(border, "green");
        gradient.addColorStop(1, "green");
        return gradient;
      };
      const data = {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
          {
            label: "sales numbers",
            data: [12, 19, 3, 5.2, 2, 3, 10],
            borderColor: "black",
            backgroundColor: (context) => {
              const { ctx, chartArea, scales } = context.chart;
              if (!chartArea) return null;
              return getBarColor(context.chart);
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
    
      const chartRef = useRef(null);
      const options = {};
      const barPattern = {
        id: "barPattern",
        beforeDatasetDraw: (chart, args, pluginOptions) => {
            const { ctx, chartArea:{top,bottom,height}, scales:{x,y} } = chart;
            ctx.save();
            const width = chart.getDatasetMeta(0).data[0].width;
            chart.getDatasetMeta(0).data.forEach((bar, index) => {
                ctx.fillRect(x.getPixelForValue(index)-width/2, top, width, height-0.5);
                // change the color of the rectangle to gray
                ctx.fillStyle = "gray";
                // console.log(bar);
            });

        }
      }
    
      const onClick = (event) => {
        // if (getElementAtEvent(chartRef.current, event).length < 1) return;
        // console.log(getElementAtEvent(chartRef.current, event));
        // const clickedDatasetIndex = getElementAtEvent(chartRef.current, event)[0]
        //   .datasetIndex;
        // const dataPointIndex = getElementAtEvent(chartRef.current, event)[0].index;
        // console.log(clickedDatasetIndex, dataPointIndex);
        // const url = data.datasets[clickedDatasetIndex].links[dataPointIndex];
        // shell.openExternal(url);
        // console.log(event);
      };
      return (
        <div>
          <Bar data={data} options={options} onClick={onClick} ref={chartRef} plugins={[barPattern]}></Bar>
        </div>
      );
}

export default BarChartKeepBG





