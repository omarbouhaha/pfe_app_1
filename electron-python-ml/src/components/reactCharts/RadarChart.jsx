import React from "react";
import { Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  RadialLinearScale,
  Filler,
} from "chart.js";

ChartJS.register(
    LineElement,
    PointElement,
    Tooltip,
    Legend,
    RadialLinearScale,
    Filler,
);


const RadarChart = () => {
    const data = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        datasets: [
            {
                label:'week days'  ,
                data: [60, 100, 80, 40, 20],
                borderColor: 'black',
                tension: 0,

            },

        ],
    };
    const options = {
        scales: {
            r: {
                angleLines: {
                    display: true
                },
                suggestedMin: 0,
                suggestedMax: 100,
            }
        }
    }
  return <div style={{width:'500px'}}>
        <Radar data={data} options={options}/>
  </div>;
};

export default RadarChart;
