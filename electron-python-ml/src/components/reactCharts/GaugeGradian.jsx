import React from 'react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, } from 'chart.js';
import { Doughnut } from 'react-chartjs-2'
import { create } from '@mui/material/styles/createTransitions';
ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
);


const GaugeGradian = () => {
    const data = {
        labels: ['Yes', 'No'],
        datasets: [
            {
                label:'Poll'  ,
                data: [8, 1],
                backgroundColor: (context) => {
                    // console.log(context)
                    const chart = context.chart; 
                    const {ctx, chartArea} = chart;
                    if (!chartArea) {
                        // This case happens on initial chart load
                        return null;
                    }
                    console.log(chartArea)
                    if(context.dataIndex===0){
                        return createGradient(chart);
                    }
                    return 'black';
                    
                },
                circumference:180,
                rotation:270,
            },

        ],
    };

    function createGradient(chart) {
        const {ctx, chartArea:{top, bottom, left, right}} = chart;
        const gradient = ctx.createLinearGradient(left, 0, right, 0); 
        gradient.addColorStop(0, 'red');
        gradient.addColorStop(0.5, 'yellow');
        gradient.addColorStop(1, 'green');
        return gradient;

    }

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
    const text = {
        id: 'text',
        beforeDraw: (chart, args, options) => {
            const {ctx, chartArea: {left, top, width, height}, data} = chart;
            ctx.save();
            ctx.fillStyle = 'gray';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = 'italic 20px Arial';
            ctx.fillText('Doughnut Chart', left + width/2, top + height/1.32);

        }
    }


  return (
    <div style={{width:'500px'}}>
      <Doughnut data={data} options={options} plugins={[text]}/>
    </div>
  )
}

export default GaugeGradian
