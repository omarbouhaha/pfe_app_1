import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

const DoughnutChartBg = () => {
  const data = {
    labels: ["Mon", "Tue", "Wed"],
    datasets: [
      {
        label: "week days",
        data: [12, 19, 3],
        borderColor: "white",
        backgroundColor: ["blue", "green", "red"],
      circumference: 270,
      },
    ],
  };
  const options = {
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Chart.js Pie Chart",
      },
    },
  };

  const chartBg = {
    id: "chartBg",
    beforeDraw: (chart, args, options) => {
      const {
        ctx,
        chartArea: { left, top, width, height },
      } = chart;
      ctx.save();
      ctx.fillStyle = "rgba(205, 205, 205, 0.5)";
      ctx.fillRect(left, top, width, height);
      //ctx.restore();
    },
  };

  const textInside = {
    id: "textInside",
    beforeDraw: (chart, args, options) => {
      const {
        ctx,
        chartArea: { left, top, width, height },
      } = chart;
      ctx.save();
      ctx.fillStyle = "gray";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "italic 20px Arial";
      ctx.fillText("Doughnut Chart", left + width / 2, top + height / 2);
    },
  };

  const backgroundCircle = {
    id: "backgroundCircle",
    beforeDraw: (chart, args, options) => {
      const { ctx } = chart;
      ctx.save();
      const xCenter = chart.getDatasetMeta(0).data[0].x;
      const yCenter = chart.getDatasetMeta(0).data[0].y;
      const outerRadius = chart.getDatasetMeta(0).data[0].outerRadius;
      const innerRadius = chart.getDatasetMeta(0).data[0].innerRadius;
      const thickness = outerRadius - innerRadius;
      ctx.beginPath();
      ctx.lineWidth = thickness;
      ctx.arc(xCenter,yCenter,outerRadius-thickness/2,0,360,false);
      ctx.strokeStyle = "gray"
      ctx.stroke();
    },
  };
  return (
    <div style={{ width: "500px" }}>
      <Doughnut
        data={data}
        options={options}
        plugins={[ textInside, backgroundCircle]}
      />
    </div>
  );
};

export default DoughnutChartBg;
