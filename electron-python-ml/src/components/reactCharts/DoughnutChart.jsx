import React from 'react'
import { Doughnut } from 'react-chartjs-2'
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';


const DoughnutChart = () => {
    const data = {
        labels: ['Mon', 'Tue', 'Wed'],
        datasets: [
            {
                label:'week days'  ,
                data: [12, 19, 3],
                tension: 0.4,
                borderColor: 'white',
                backgroundColor: ['magenta','cyan','yellow'],

            },

        ],
    };
    const options = {
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Chart.js Pie Chart'
            }
        }
    }

    const chartBg = {
        id: 'chartBg',
        beforeDraw: (chart, args, options) => {
            const {ctx, chartArea: {left, top, width, height}} = chart;
            ctx.save();
            ctx.fillStyle = 'rgba(205, 205, 205, 0.5)';
            ctx.fillRect(left, top, width, height);
            //ctx.restore();
        }
    }

    const textInside = {
        id: 'textInside',
        beforeDraw: (chart, args, options) => {
            const {ctx, chartArea: {left, top, width, height}} = chart;
            ctx.save();
            ctx.fillStyle = 'gray';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = 'italic 20px Arial';
            ctx.fillText('Doughnut Chart', left + width/2, top + height/2);

        }
    }




  return (
    <div style={{width:'500px'}}>
      <Doughnut data={data} options={options} plugins={[chartBg, textInside]}/>
    </div>
  )
}

export default DoughnutChart
