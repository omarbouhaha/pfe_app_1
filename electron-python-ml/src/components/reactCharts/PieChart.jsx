import React from 'react'
import { Pie } from 'react-chartjs-2'
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend,
);



const PieChart = () => {
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

  return (
    <div style={{width:'500px'}}>
      <Pie data={data} options={options}/>
    </div>
  )
}

export default PieChart
