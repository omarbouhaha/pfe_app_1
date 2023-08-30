import React, { useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";
import { useSelector } from "react-redux";
import Papa from "papaparse";
import ChartSlider from "../ChartSlider/ChartSlider";
import { useDispatch } from "react-redux";
import { deleteUserChart } from "../../reduxToolkit/chartSlice";

const { ipcRenderer, dialog } = window;

const SplineAreaApex = ({ chart, loadData }) => {
  const dispatch = useDispatch();
  const chartId = chart.id;

  const colors = [
    "#008FFB",
    "#FF4560",
    "#775DD0",
    "#3F51B5",
    "#546E7A",
    "#D4526E",
    "#8D5B4C",
    "#F86624",
    "#D7263D",
    "#1B998B",
    "#2E294E",
    "#F46036",
  ];
  const deleteSVG = `
  <svg style="width:20px;height:20px;" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM8 9H16V19H8V9ZM15.5 4L14.5 3H9.5L8.5 4H5V6H19V4H15.5Z" fill="currentColor"></path>
  </svg>`;

  const [sliderValue, setSliderValue] = useState([0, 10]);
  const [seriesData, setSeriesData] = useState([]);

  const handleSliderValueChange = (newValue) => {
    setSliderValue(newValue);
  };

  const fileId = chart.datasetId;
  const file = useSelector((state) =>
    state.importStep.importedFiles.find((file) => file.id === fileId)
  );

  const generateDefaultOptions = (columnName) => ({
    chart: {
      type: "area",
      height: 160,
      toolbar: {
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
    yaxis: {
      title: {
        show: false,
      },
    },
    xaxis: {
      type: "datetime",
      labels: {
        datetimeUTC: false,
        datetimeFormatter: {
          year: "yyyy",
          month: "MMM yy",
          day: "dd MMM",
          hour: "HH:mm",
        },
      },
    },
    dataLabels: {
      enabled: false, // This turns off data labels
    },
    stroke: {
      curve: "smooth", // This makes the chart a spline area chart
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.9,
        stops: [0, 100],
      },
    },
    // ... other options as needed
  });

  const defaultSeries = chart.column.map((columnName) => ({
    name: columnName,
    data: [],
  }));

  const defaultOptions = generateDefaultOptions("Column Name"); // Modify as needed
  const [chartData, setChartData] = useState({
    series: defaultSeries,
    options: defaultOptions,
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

            // Search for datetime column
            let datetimeColumnName = null;
            for (let key of Object.keys(data[0])) {
              if (
                key.toLowerCase().includes("time") ||
                key.toLowerCase().includes("date")
              ) {
                datetimeColumnName = key;
                break;
              }
            }

            if (!datetimeColumnName) {
              console.error("Datetime column not found!");
              return;
            }

            const dateTimeValues = data.map((row) =>
              new Date(row[datetimeColumnName]).getTime()
            );

            setSeriesData(
              chart.column
                .map((columnName, index) => {
                  if (columnName !== datetimeColumnName) {
                    return {
                      name: columnName,
                      data: data.map((row, idx) => ({
                        x: dateTimeValues[idx],
                        y: parseFloat(row[columnName]).toFixed(4),
                      })),
                      color: colors[index % colors.length], // Assign a color from the array, and wrap around if there are more series than colors
                    };
                  }
                  return null;
                })
                .filter((item) => item !== null)
            );
          },
        });
      }
    });

    return () => {
      ipcRenderer.removeAllListeners("chart-data");
    };
  }, [file]);

  useEffect(() => {
    if (seriesData.length === 0 || !Array.isArray(seriesData)) return;
    const updatedSeries = seriesData.map((series) => ({
      ...series,
      data: series.data.slice(sliderValue[0], sliderValue[1]),
    }));

    setChartData((prevState) => ({
      ...prevState,
      series: updatedSeries,
    }));
  }, [sliderValue, seriesData]);

  return (
    <div id="wrapper">
      <ReactApexChart
        options={defaultOptions}
        series={chartData.series}
        type="area" // This specifies that it's a spline area chart
        height={300}
      />
      <ChartSlider
        min={0}
        max={seriesData.length ? seriesData[0].data.length : 0}
        step={100}
        onSlideEnd={handleSliderValueChange}
      />
    </div>
  );
};

export default SplineAreaApex;
