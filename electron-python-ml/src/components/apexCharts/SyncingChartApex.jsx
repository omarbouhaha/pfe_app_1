import React, { useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";
import { useSelector } from "react-redux";
import Papa from "papaparse";
import ChartSlider from "../ChartSlider/ChartSlider";
import { useDispatch } from "react-redux";
import { deleteUserChart } from "../../reduxToolkit/chartSlice";

const { ipcRenderer, dialog } = window;

const SyncingChartApex = ({ chart, loadData }) => {
  const dispatch = useDispatch();
  const chartId = chart.id;
  const deleteSVG = `
  <svg style="width:20px;height:20px;" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM8 9H16V19H8V9ZM15.5 4L14.5 3H9.5L8.5 4H5V6H19V4H15.5Z" fill="currentColor"></path>
  </svg>`;
  const [sliderValue, setSliderValue] = useState([0, 100]); // Assuming a default slice of [0,1000], adjust as needed
  const [seriesData, setSeriesData] = useState([]); // Add this line
  const handleSliderValueChange = (newValue) => {
    setSliderValue(newValue);
  };
  const fileId = chart.datasetId;
  const file = useSelector((state) =>
    state.importStep.importedFiles.find((file) => file.id === fileId)
  );

  const generateDefaultOptions = (id, columnName) => ({
    chart: {
      id: id,
      group: "social",
      type: "line",
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
    colors: ["#008FFB"],
    yaxis: {
      title: {
        text: columnName,
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
    tooltip: {
        x: {
          format: "dd/MM/yyyy HH:mm:ss" // Adjust format accordingly
        }
      },
    // ... other options
  });

  const defaultSeries = chart.column.map((columnName) => ({
    name: columnName,
    data: [],
  }));

  const defaultOptions = chart.column.map((columnName, index) =>
    generateDefaultOptions(index, columnName)
  );

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

            let timeToPrint = dateTimeValues.slice(0, 10)
            // update the format of the date time values
            timeToPrint = timeToPrint.map((value) => {
                let date = new Date(value);
                return date.toLocaleString();
            });

            setSeriesData(
              chart.column
                .map((columnName) => {
                  if (columnName !== datetimeColumnName) {
                    return {
                      name: columnName,
                      data: data.map((row, index) => ({
                        x: dateTimeValues[index],
                        y: parseFloat(row[columnName]).toFixed(4),
                      })),
                    };
                  }
                  return null;
                })
                .filter((item) => item !== null) // remove any null values from the series data array
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
      {chartData.series.map((seriesItem, index) => (
        <div key={index} id={`chart-${index}`}>
          <ReactApexChart
            options={chartData.options[index]}
            series={[seriesItem]}
            type="line"
            height={300}
          />
        </div>
      ))}
      <ChartSlider
        min={0}
        max={seriesData.length ? seriesData[0].data.length : 0}
        step={10}
        onSlideEnd={handleSliderValueChange}
      />
    </div>
  );
};

export default SyncingChartApex;
