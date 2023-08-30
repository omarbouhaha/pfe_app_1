import React from "react";
import {
  TextField,
  Button,
  Grid,
  Snackbar,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Checkbox,
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import Autocomplete from "@mui/material/Autocomplete";
import Tooltip from "@mui/material/Tooltip";
import Slide from "@mui/material/Slide";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { pythonPath, machineLearningScript } from "../../../constants";

const { spawn } = window;

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const DlDynamicForm = () => {
  const dispatch = useDispatch();
  const dlModels = useSelector((state) => state.dlModels.models);
  const scalers = useSelector((state) => state.dlModels.scalers);
  const [selectedModel, setSelectedModel] = useState("");
  const [open, setOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [hiddenLayerUnits, setHiddenLayerUnits] = useState([]);
  const [hiddenLayerActivation, setHiddenLayerActivation] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [formConfig, setFormConfig] = useState({});

  const importedFiles = useSelector((state) => state.importStep.importedFiles);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedOutputColumn, setSelectedOutputColumn] = useState("");
  const [selectedInputColumns, setSelectedInputColumns] = useState([]);

  const handleFileChange = (event, newValue) => {
    setSelectedFile(importedFiles.find((file) => file.name === newValue));
  };

  const handleOutputColumnChange = (event, newValue) => {
    setSelectedOutputColumn(newValue);
  };

  function SlideTransition(props) {
    return <Slide {...props} direction="up" />;
  }

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  const handleFieldChange = (key, value) => {
    setFormConfig((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };

  const handleSubmit = () => {
    if (!selectedModel) {
      setOpen(true);
      setSnackbarMessage("Please select a model");
      return;
    }
    if (!selectedFile) {
      setOpen(true);
      setSnackbarMessage("Please select a file");
      return;
    }
    if (!selectedOutputColumn) {
      setOpen(true);
      setSnackbarMessage("Please select an output column");
      return;
    }
    if (selectedInputColumns.length === 0) {
      setOpen(true);
      setSnackbarMessage("Please select at least one input column");
      return;
    }
    if (!formConfig) {
      setOpen(true);
      setSnackbarMessage("Please fill in the form");
      return;
    }

    const data = {
      model: selectedModel,
      formConfig: formConfig,
      selectedFile: selectedFile,
      selectedOutputColumn: selectedOutputColumn,
      selectedInputColumns: selectedInputColumns,
    };
    console.log("Form configuration: ", data);
    // ... rest of the logic
  };

  useEffect(() => {
    console.log("DL models: ", dlModels);
    console.log("Scalers: ", scalers);
  }, [dlModels, scalers]);
  useEffect(() => {
    setHiddenLayerUnits(
        dlModels[selectedModel]?.basic ? dlModels[selectedModel].basic.units_per_hidden_layer.default : []
    );
  }, [selectedModel]);
  useEffect(() => {
    console.log("Hidden layer units: ", hiddenLayerUnits);
  }, [hiddenLayerUnits]);

  useEffect(() => {
    if (dlModels[selectedModel]) {
      // loop through the basic and advanced params and set the default values
      let newFormConfig = {};
      Object.entries(dlModels[selectedModel].basic).forEach(
        ([paramKey, paramValue]) => {
          newFormConfig[paramKey] = paramValue.default;
        }
      );

      Object.entries(dlModels[selectedModel].advanced).forEach(
        ([paramKey, paramValue]) => {
          newFormConfig[paramKey] = paramValue.default;
        }
      );

      setFormConfig(newFormConfig);
      return;
    }
    setFormConfig({});
  }, [selectedModel]);

  return (
    <div style={{ margin: "40px" }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Autocomplete
            value={selectedModel}
            onChange={(event, newValue) => {
              setSelectedModel(newValue);
            }}
            options={Object.keys(dlModels)}
            getOptionLabel={(option) => option}
            renderInput={(params) => (
              <TextField {...params} label="Choose Model" variant="outlined" />
            )}
          />
        </Grid>
        {selectedModel &&
          dlModels[selectedModel]["basic"] &&
          Object.entries(dlModels[selectedModel].basic).map(
            ([paramKey, paramValue]) => (
              <>
                {/* ... Render the fields dynamically based on type */}
                {paramValue.type === "number" &&
                  paramKey !== "units_per_hidden_layer" && (
                    <Grid item xs={12} md={6} key={paramKey}>
                      <TextField
                        label={paramKey}
                        type="number"
                        fullWidth
                        variant="outlined"
                        defaultValue={paramValue.default}
                        // add min and max values
                        inputProps={{
                          min: paramValue.min,
                          max: paramValue.max,
                        }}
                        onChange={(e) => {
                          // if paramKey is hidden_layers then set hiddenLayerUnits
                          if (paramKey === "hidden_layers") {
                            setHiddenLayerUnits(
                              Array(Number(e.target.value)).fill(0)
                            );
                          }
                          handleFieldChange(paramKey, e.target.value);
                        }}
                      />
                    </Grid>
                  )}
                {paramValue.type === "select" && (
                  <Grid item xs={12} md={6} key={paramKey}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel id={`${paramKey}-select-label`}>
                        {paramKey}
                      </InputLabel>
                      <Select
                        labelId={`${paramKey}-select-label`}
                        defaultValue={paramValue.default}
                        label={paramKey}
                        onChange={(e) => {
                          handleFieldChange(paramKey, e.target.value);
                        }}
                      >
                        {paramValue.options.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                )}
                {/* Add other input types as needed */}
              </>
            )
          )}
        {selectedModel &&
          dlModels[selectedModel].basic.hidden_layers &&
          Array.from({
            length: hiddenLayerUnits.length,
          }).map((_, index) => (
            <Grid item xs={12} md={6} key={`hiddenLayer-${index}`}>
              <TextField
                label={`Units for Hidden Layer ${index + 1}`}
                type="number"
                fullWidth
                variant="outlined"
                value={
                  hiddenLayerUnits[index] ||
                  dlModels[selectedModel].basic.units_per_hidden_layer.default[index]
                }
                onChange={(e) => {
                  const newHiddenLayerUnits = [...hiddenLayerUnits];
                  newHiddenLayerUnits[index] = Number(e.target.value);
                  setHiddenLayerUnits(newHiddenLayerUnits);
                  handleFieldChange(
                    `units_per_hidden_layer`,
                    newHiddenLayerUnits
                  );
                }}
              />
            </Grid>
          ))}
        {selectedModel && (
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={showAdvanced}
                  onChange={(e) => setShowAdvanced(e.target.checked)}
                  color="primary"
                />
              }
              label="Advanced Options"
            />
          </Grid>
        )}
        {selectedModel &&
          showAdvanced &&
          dlModels[selectedModel]["advanced"] &&
          Object.entries(dlModels[selectedModel].advanced).map(
            ([paramKey, paramValue]) => (
              <>
                {/* ... Render the fields dynamically based on type */}
                {paramValue.type === "number" && (
                  <Grid item xs={12} md={6} key={paramKey}>
                    <TextField
                      label={paramKey}
                      type="number"
                      fullWidth
                      variant="outlined"
                      defaultValue={paramValue.default}
                      // add min and max values
                      inputProps={{
                        min: paramValue.min,
                        max: paramValue.max,
                      }}
                      onChange={(e) =>
                        handleFieldChange(paramKey, e.target.value)
                      }
                    />
                  </Grid>
                )}
                {paramValue.type === "select" && (
                  <Grid item xs={12} md={6} key={paramKey}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel id={`${paramKey}-select-label`}>
                        {paramKey}
                      </InputLabel>
                      <Select
                        labelId={`${paramKey}-select-label`}
                        defaultValue={paramValue.default}
                        label={paramKey}
                        onChange={(e) =>
                          handleFieldChange(paramKey, e.target.value)
                        }
                      >
                        {paramValue.options.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                )}
                {/* Add other input types as needed */}
              </>
            )
          )}
        <br />
        <Grid item xs={12} md={6}>
          <Autocomplete
            id="file-selection"
            options={importedFiles.map((file) => file.name)}
            getOptionLabel={(option) => option}
            fullWidth
            onChange={handleFileChange}
            renderInput={(params) => (
              <TextField {...params} label="Choose File" variant="outlined" />
            )}
            renderOption={(props, option, { selected }) => (
              <Tooltip title={option} arrow key={option}>
                <li {...props}>
                  <Checkbox style={{ marginRight: 8 }} checked={selected} />
                  {option}
                </li>
              </Tooltip>
            )}
          />

          {selectedFile && (
            <Autocomplete
              sx={{ marginTop: 3 }}
              id="output-column-selection"
              options={selectedFile.columns}
              getOptionLabel={(option) => option}
              fullWidth
              onChange={handleOutputColumnChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Choose Output Column"
                  variant="outlined"
                />
              )}
            />
          )}

          {selectedFile && (
            <Autocomplete
              sx={{ marginTop: 3 }}
              multiple
              id="columns-multi-select"
              options={selectedFile.columns}
              getOptionLabel={(option) => option}
              value={selectedInputColumns}
              onChange={(event, newValue) => {
                setSelectedInputColumns(newValue);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Columns"
                  variant="outlined"
                />
              )}
            />
          )}
        </Grid>
        <Grid item xs={12}>
          <Button variant="contained" color="primary" onClick={handleSubmit}>
            Submit
          </Button>
        </Grid>
      </Grid>
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        TransitionComponent={SlideTransition}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={handleClose} severity="error" sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default DlDynamicForm;
