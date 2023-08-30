import React, { useState } from "react";
import ReactApexChart from "react-apexcharts"; // Assuming you've imported this
import { useSelector } from "react-redux";
import Papa from "papaparse";
import { useEffect } from "react";
import ChartSlider from "../ChartSlider/ChartSlider";
import { useDispatch } from "react-redux";
import { deleteUserChart } from "../../reduxToolkit/chartSlice";
const { ipcRenderer, dialog } = window;
const ZoomableTimeSeriesApex = ({ data, loadData, chart }) => {
  const dispatch = useDispatch();
  const chartId = chart.id;
  const deleteSVG = `
  <svg style="width:20px;height:20px;" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM8 9H16V19H8V9ZM15.5 4L14.5 3H9.5L8.5 4H5V6H19V4H15.5Z" fill="currentColor"></path>
  </svg>`;
  const chartTypes = useSelector((state) => state.charts.chartTypes);
  const chartTypeEntry = chartTypes.find(type => type.components.includes(chart.component));
  const componentIndex = chartTypeEntry.components.indexOf(chart.component);
  const isMultiLines = chartTypeEntry.isMultiLines[componentIndex];
  const fileId = chart.datasetId;
  const file = useSelector((state) =>
    state.importStep.importedFiles.find((file) => file.id === fileId)
  );
  const [rows, setRows] = useState([]);
  const [sliderValue, setSliderValue] = useState([0, 1000]);
  const handleSliderValueChange = (newValue) => {
    setSliderValue(newValue);
    // Other operations if necessary
  };

  const [chartState, setChartState] = useState({
    series: [
      {
        name: chart.column,
        data: rows,
      },
    ],
    options: {
      chart: {
        type: "area",
        stacked: false,
        height: 350,
        zoom: {
          type: "x",
          enabled: true,
          autoScaleYaxis: true,
        },
        toolbar: {
          autoSelected: "zoom",
          tools: {
            customIcons: [
              {
                icon: deleteSVG,
                title: "Delete Chart",
                class: "custom-icon",
                index: -1,
                click: function (chart, options, e) {
                  const choice = dialog.showMessageBoxSync({
                    type: "question",
                    buttons: ["Yes", "No"],
                    title: "Confirm",
                    message: "Are you sure you want to delete this chart?",
                  });
                  if (choice === 0) {
                    // if 'Yes' was clicked
                    dispatch(deleteUserChart(chartId));
                    }
                  }
                },
            ],
          },
        },
      },
      dataLabels: {
        enabled: false,
      },
      markers: {
        size: 0,
      },
      title: {
        text: chart.column,
        align: "left",
      },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          inverseColors: false,
          opacityFrom: 0.5,
          opacityTo: 0,
          stops: [0, 90, 100],
        },
      },
      yaxis: {
        labels: {
          formatter: function (val) {
            return (val / 1).toFixed(3);
          },
        },
        title: {
          text: chart.column,
        },
      },
      xaxis: {
        type: "datetime",
      },
      tooltip: {
        shared: false,
        y: {
          formatter: function (val) {
            return (val / 1).toFixed(3);
          },
        },
      },
    },
  });

  useEffect(() => {
    if (!file) return;
    const filePath = file.path;
    loadData(filePath);

    ipcRenderer.on("chart-data", (event, fileData) => {
      if (filePath.endsWith(".csv")) {
        Papa.parse(fileData, {
          header: true,
          complete: (results) => {
            const data = results.data;
            
            let seriesData = isMultiLines 
              ? chart.column.map(column => ({ name: column, data: [] }))
              : [{ name: chart.column[0], data: [] }];

            data.forEach(row => {
              let timeValue;
              for (let key in row) {
                if (key.toLowerCase().includes("time") || key.toLowerCase().includes("date")) {
                  let date = new Date(row[key]);
                  if (!isNaN(date)) {
                    timeValue = date.getTime();
                  }
                }
              }

              if (isMultiLines) {
                chart.column.forEach((column, index) => {
                  let yValue = parseFloat(row[column]);
                  seriesData[index].data.push({ x: timeValue, y: yValue });
                });
              } else {
                let yValue = parseFloat(row[chart.column[0]]);
                seriesData[0].data.push({ x: timeValue, y: yValue });
              }
            });

            setRows(seriesData);
          },
        });
      }
      // Similar processing for JSON data if needed...
    });

    return () => {
      ipcRenderer.removeAllListeners("chart-data");
    };
  }, [file]);

  useEffect(() => {
    if (rows.length === 0 || !Array.isArray(rows)) return;

    const updatedSeries = rows.map(series => ({
      ...series,
      data: series.data
        .filter(row => row.x !== undefined && row.y !== undefined)
        .slice(sliderValue[0], sliderValue[1]),
    }));

    setChartState(prevState => ({
      ...prevState,
      series: updatedSeries,
    }));
  }, [rows, sliderValue]);


  return (
    <div id="chart">
      <ReactApexChart
        options={chartState.options}
        series={chartState.series}
        type="area"
        height={350}
      />
      <ChartSlider min={0} max={rows.length ? rows[0].data.length : 0} step={10} onSlideEnd={handleSliderValueChange} />
    </div>
  );
};

export default ZoomableTimeSeriesApex;
