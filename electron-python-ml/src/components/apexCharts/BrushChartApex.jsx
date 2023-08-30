import React, { useState } from "react";
import ReactApexChart from "react-apexcharts"; // Assuming you're using this import
import { useSelector } from "react-redux";
import Papa from "papaparse";
import { useEffect } from "react";
import ChartSlider from "../ChartSlider/ChartSlider";
import { useDispatch } from "react-redux";
import { deleteUserChart } from "../../reduxToolkit/chartSlice";
const { ipcRenderer, dialog } = window;


const BrushChartApex = ({ data, loadData, chart }) => {
  const dispatch = useDispatch();
  const chartId = chart.id;
  const deleteSVG = `
  <svg style="width:20px;height:20px;" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM8 9H16V19H8V9ZM15.5 4L14.5 3H9.5L8.5 4H5V6H19V4H15.5Z" fill="currentColor"></path>
  </svg>`;
  const chartTypes = useSelector((state) => state.charts.chartTypes);
  const chartTypeEntry = chartTypes.find((type) =>
    type.components.includes(chart.component)
  );
  const componentIndex = chartTypeEntry.components.indexOf(chart.component);
  const isMultiLines = chartTypeEntry.isMultiLines[componentIndex];

  const fileId = chart.datasetId;
  const file = useSelector((state) =>
    state.importStep.importedFiles.find((file) => file.id === fileId)
  );
  const [rows, setRows] = useState([]);

  const [chartState, setChartState] = useState({
    series: [
      {
        name: chart.column,
        data: rows,
      },
    ],
    options: {
      chart: {
        id: "chart2",
        type: "line",
        height: 230,
        toolbar: {
          autoSelected: "pan",
          show: true,
        },
        toolbar: {
          tools: {
            customIcons: [
              {
                icon: deleteSVG,
                title: "Delete Chart",
                class: "custom-icon",
                index: -1,
                click: function (chart, options, e) {
                  // Your delete logic here
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
      colors: ["#546E7A"],
      stroke: {
        width: 3,
      },
      dataLabels: {
        enabled: false,
      },
      fill: {
        opacity: 1,
      },
      markers: {
        size: 0,
      },
      xaxis: {
        type: "datetime",
      },
    },
    seriesLine: [
      {
        data: rows,
      },
    ],
    optionsLine: {
      chart: {
        id: "chart1",
        height: 130,
        type: "area",
        brush: {
          target: "chart2",
          enabled: true,
        },
        selection: {
          enabled: true,
          xaxis: {
            min: new Date(rows[0]?.x).getTime(),
            max: new Date(rows[rows.length - 1]?.x).getTime(),
          },
        },
      },
      colors: ["#008FFB"],
      fill: {
        type: "gradient",
        gradient: {
          opacityFrom: 0.91,
          opacityTo: 0.1,
        },
      },
      xaxis: {
        type: "datetime",
        tooltip: {
          enabled: false,
        },
      },
      yaxis: {
        tickAmount: 2,
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
              ? chart.column.map((column) => ({ name: column, data: [] }))
              : [{ name: chart.column[0], data: [] }];

            seriesData.forEach((seriesEntry) => {
              seriesEntry.data = data.map((row) => {
                let timeValue, yValue;
                for (let key in row) {
                  if (
                    key.toLowerCase().includes("time") ||
                    key.toLowerCase().includes("date")
                  ) {
                    let date = new Date(row[key]);
                    if (!isNaN(date)) {
                      timeValue = date.getTime();
                    }
                  } else if (key === seriesEntry.name) {
                    yValue = parseFloat(row[key]);
                  }
                }
                return { x: timeValue, y: yValue };
              });
            });

            setRows(seriesData[0].data); // Store the main series' data in the component state
          },
        });
      }
      // Similar processing for JSON data if needed...
    });

    // Clean up the listener when the component unmounts
    return () => {
      ipcRenderer.removeAllListeners("chart-data");
    };
  }, [file]);

  useEffect(() => {
    if (rows.length === 0) return;

    const validRows = rows.filter(
      (row) => row.x !== undefined && row.y !== undefined
    );

    setChartState((prevState) => ({
      ...prevState,
      series: [
        {
          ...prevState.series[0],
          data: validRows,
        },
      ],
      seriesLine: [
        {
          data: validRows,
        },
      ],
      optionsLine: {
        ...prevState.optionsLine,
        chart: {
          ...prevState.optionsLine.chart,
          selection: {
            ...prevState.optionsLine.chart.selection,
            xaxis: {
              min: new Date(validRows[0]?.x).getTime(),
              max: new Date(validRows[validRows.length - 1]?.x).getTime(),
            },
          },
        },
      },
    }));
  }, [rows]);

  return (
    <div id="wrapper">
      <div id="chart-line2">
        <ReactApexChart
          options={chartState.options}
          series={chartState.series}
          type="line"
          height={230}
        />
      </div>
      <div id="chart-line">
        <ReactApexChart
          options={chartState.optionsLine}
          series={chartState.seriesLine}
          type="area"
          height={130}
        />
      </div>
    </div>
  );
};

export default BrushChartApex;
