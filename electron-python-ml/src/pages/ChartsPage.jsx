import React from 'react'
import ChartForm from '../components/ChartForm/ChartForm'
import ZoomableTimeSeriesApex from '../components/apexCharts/ZoomableTimeSeriesApex'
import { useSelector } from 'react-redux'
import BrushChartApex from '../components/apexCharts/BrushChartApex'
import SyncingChartApex from '../components/apexCharts/SyncingChartApex'
import SplineAreaApex from '../components/apexCharts/SplineAreaApex'

const { ipcRenderer } = window

const ChartsPage = () => {
    const {userCharts} = useSelector((state) => state.charts)

    const loadChartData = (filePath) => {
      ipcRenderer.send("get-chart-data", filePath);
    };
    const CHART_COMPONENTS = {
        "ZoomableTimeSeriesApex": (chart, index) => <ZoomableTimeSeriesApex key={index} loadData={loadChartData} chart={chart} />,
        "BrushChartApex":(chart, index) => <BrushChartApex key={index} loadData={loadChartData} chart={chart}/>,
        "SyncingChartApex": (chart, index) => <SyncingChartApex key={index} loadData={loadChartData} chart={chart} />,
        "SplineAreaApex": (chart, index) => <SplineAreaApex key={index} loadData={loadChartData} chart={chart} />,
        // ... other mappings
    };

  return (
    <div>
        <ChartForm />
        {userCharts.map((chart, index) => {
            return CHART_COMPONENTS[chart.component] ? CHART_COMPONENTS[chart.component](chart, index) : null;
        })}
    </div>
  )
}

export default ChartsPage
