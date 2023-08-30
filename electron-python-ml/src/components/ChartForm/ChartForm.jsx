import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchChartTypes } from "../../reduxToolkit/chartSlice";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  TextField,
  Button,
  ButtonGroup,
  FormHelperText,
  Grid,
} from "@mui/material";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { addUserChart } from "../../reduxToolkit/chartSlice";
import { fetchUserCharts, postUserChart } from "../../reduxToolkit/chartSlice";

const ChartForm = () => {
  const dispatch = useDispatch();
  const chartTypes = useSelector((state) => state.charts.chartTypes);
  const datasets = useSelector((state) => state.importStep.importedFiles);
  const [selectedChart, setSelectedChart] = useState("");
  const [selectedDatasetId, setSelectedDatasetId] = useState("");
  const [selectedDataset, setSelectedDataset] = useState("");
  const [selectedColumn, setSelectedColumn] = useState([]);
  const [datasetColumns, setDatasetColumns] = useState([]);
  const [xAxisLabel, setXAxisLabel] = useState("Date Time");
  const [yAxisLabel, setYAxisLabel] = useState([]);
  const [isMultiSelectColumn, setIsMultiSelectColumn] = useState(false);

  const [errors, setErrors] = useState({});

  const resetForm = () => {
    setSelectedChart("");
    setSelectedDatasetId("");
    setSelectedDataset("");
    setSelectedColumn([]);
    setXAxisLabel("Date Time");
    setYAxisLabel([]);
    setErrors({});
  };

  const validateField = (field, value) => {
    if (field === "selectedChart" && !value) return "Chart type is required";
    if (field === "selectedDataset" && !value) return "Dataset is required";
    if (field === "selectedColumn" && !value) return "Column is required";
    if (field === "xAxisLabel" && !value) return "X-axis label is required";
    if (field === "yAxisLabel" && !value) return "Y-axis label is required";
    return null;
  };

  const handleBlur = (field) => {
    const errorMessage = validateField(field, eval(field));
    setErrors((prevErrors) => ({
      ...prevErrors,
      [field]: errorMessage,
    }));
  };

  function getComponentByOption(option) {
    for (let chart of chartTypes) {
      const index = chart.options.indexOf(option);
      if (index !== -1) {
        return chart.components[index];
      }
    }
    return null; // return null if the option is not found
  }

  const handleColumnChange = (e) => {
    setSelectedColumn(Array.isArray(e.target.value) ? e.target.value : [e.target.value]);
  };

  const handleChangeChart = (e) => {
    setSelectedChart(e.target.value);

    // Find the selected chart type
    for (const chart of chartTypes) {
      const index = chart.options.indexOf(e.target.value);
      if (index !== -1) {
        setIsMultiSelectColumn(chart.isMultiLines[index]);
        break;
      }
    }
  };

  const handleAddChart = () => {
    const newErrors = {};
    if (!selectedChart) newErrors.selectedChart = "Chart type is required";
    if (!selectedDataset) newErrors.selectedDataset = "Dataset is required";
    if (!selectedColumn) newErrors.selectedColumn = "Column is required";
    if (!xAxisLabel) newErrors.xAxisLabel = "X-axis label is required";
    if (!yAxisLabel) newErrors.yAxisLabel = "Y-axis label is required";

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    const chartData = {
      id: uuidv4(),
      type: selectedChart,
      component: getComponentByOption(selectedChart),
      dataset: selectedDataset,
      datasetId: selectedDatasetId,
      column: selectedColumn,
      xAxisLabel,
      yAxisLabel: yAxisLabel || selectedColumn,
    };

    dispatch(postUserChart(chartData));

    console.log(chartData);
    resetForm();
  };

  useEffect(() => {
    dispatch(fetchUserCharts()); // fetch user charts on component mount
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchChartTypes());
  }, [dispatch]);

  useEffect(() => {
    if (selectedDataset) {
      const dataset = datasets.find(
        (dataset) => dataset.name === selectedDataset
      );
      if (dataset && dataset.columns) {
        setDatasetColumns(dataset.columns);
      }
    } else {
      setDatasetColumns([]);
    }

    // Set the y-axis label as the name of the selected column
    setYAxisLabel(selectedColumn);
  }, [selectedDataset, datasets, selectedColumn]);

  return (
    <Box sx={{ width: 900, margin: "2rem auto" }} onSubmit={handleAddChart}>
      <Typography variant="h5" gutterBottom>
        Chart Selection
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth variant="outlined" sx={{ mb: 3 }}>
            <InputLabel required>Chart Type</InputLabel>
            <Select
              value={selectedChart}
              onChange={handleChangeChart}
              onBlur={() => handleBlur("selectedChart")}
              label="Chart Type"
              error={!!errors.selectedChart}
            >
              {chartTypes.map((chart) =>
                chart.options.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))
              )}
            </Select>
            {errors.selectedChart && (
              <FormHelperText error>{errors.selectedChart}</FormHelperText>
            )}
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth variant="outlined" sx={{ mb: 3 }}>
            <InputLabel required>Dataset</InputLabel>
            <Select
              value={selectedDataset}
              onChange={(e) => {
                setSelectedDataset(e.target.value);
                setSelectedDatasetId(
                  datasets.find((dataset) => dataset.name === e.target.value).id
                );
              }}
              onBlur={() => handleBlur("selectedDataset")}
              label="Dataset"
              error={!!errors.selectedDataset}
            >
              {datasets.map((dataset) => (
                <MenuItem key={dataset.id} value={dataset.name}>
                  {dataset.name}
                </MenuItem>
              ))}
            </Select>
            {errors.selectedDataset && (
              <FormHelperText error>{errors.selectedDataset}</FormHelperText>
            )}
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <FormControl
            fullWidth
            variant="outlined"
            disabled={!selectedDataset}
            sx={{ mb: 3 }}
          >
            <InputLabel required>Column</InputLabel>
            <Select
              value={selectedColumn}
              onChange={handleColumnChange}
              label="Column"
              error={!!errors.selectedColumn}
              onBlur={() => handleBlur("selectedColumn")}
              multiple={isMultiSelectColumn}
            >
              {datasetColumns.map((column) => (
                <MenuItem key={column} value={column}>
                  {column}
                </MenuItem>
              ))}
            </Select>
            {errors.selectedColumn && (
              <FormHelperText error>{errors.selectedColumn}</FormHelperText>
            )}
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth variant="outlined" sx={{ mb: 3 }}>
            <TextField
              label="X-Axis Label"
              variant="outlined"
              required
              value={xAxisLabel}
              onChange={(e) => setXAxisLabel(e.target.value)}
              onBlur={() => handleBlur("xAxisLabel")}
              error={!!errors.xAxisLabel}
              helperText={errors.xAxisLabel}
            />
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <FormControl fullWidth variant="outlined" sx={{ mb: 3 }}>
            <TextField
              label="Y-Axis Label"
              variant="outlined"
              required
              value={yAxisLabel}
              onChange={(e) => setYAxisLabel(e.target.value)}
              onBlur={() => handleBlur("yAxisLabel")}
              error={!!errors.yAxisLabel}
              helperText={errors.yAxisLabel}
            />
          </FormControl>
        </Grid>
        <ButtonGroup fullWidth sx={{ mt: 3, marginX: "100px" }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Button
                variant="contained"
                color="primary"
                type="submit"
                onClick={handleAddChart}
              >
                Add Chart
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button variant="contained" color="secondary" onClick={resetForm}>
                Reset
              </Button>
            </Grid>
          </Grid>
        </ButtonGroup>
      </Grid>
    </Box>
  );
};

export default ChartForm;
