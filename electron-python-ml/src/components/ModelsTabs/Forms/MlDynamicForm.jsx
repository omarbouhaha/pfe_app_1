import React, { usCheckboxeEffect, useState } from "react";
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
} from "@mui/material";
import { useSelector } from "react-redux";
import Autocomplete from "@mui/material/Autocomplete";
import { Checkbox, FormControlLabel } from "@mui/material";
import { Grid } from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import Slide from "@mui/material/Slide";
import { pythonPath, machineLearningScript } from "../../../constants";
import Switch from "@mui/material/Switch";

const { spawn } = window;
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const MlDynamicForm = () => {
  const mlModels = useSelector((state) => state.mlModels.models);
  const [selectedModel, setSelectedModel] = useState("");
  const [formModelData, setFormModelData] = useState({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  const { scalers } = useSelector((state) => state.mlModels);
  const [selectedScaler, setSelectedScaler] = useState({
    name: "",
    parameters: {},
  });

  const importedFiles = useSelector((state) => state.importStep.importedFiles);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedOutputColumn, setSelectedOutputColumn] = useState("");
  const [selectedInputColumns, setSelectedInputColumns] = useState({});

  const [open, setOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  // useEffect(() => {
  //   console.log("Selected File: ", selectedFile);
  //   console.log("Selected Output Column: ", selectedOutputColumn);
  //   console.log("Selected Input Columns: ", selectedInputColumns);
  // }, [selectedFile, selectedOutputColumn, selectedInputColumns]);

  const handleModelChange = (selectedValue) => {
    setSelectedModel(selectedValue);

    // Initialize formData with default values of the selected model
    let initialData = {};
    ["basic", "advanced"].forEach((category) => {
      if (mlModels[selectedValue] && mlModels[selectedValue][category]) {
        Object.entries(mlModels[selectedValue][category]).forEach(
          ([paramName, paramDetails]) => {
            initialData[paramName] = paramDetails.default;
          }
        );
      }
    });
    setFormModelData(initialData);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormModelData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = () => {
    if (!selectedModel) {
      setSnackbarMessage("Please select a model");
      setOpen(true);
      return;
    }
    if (!selectedFile) {
      setSnackbarMessage("Please select a file");
      setOpen(true);
      return;
    }
    if (!selectedOutputColumn) {
      setSnackbarMessage("Please select an output column");
      setOpen(true);
      return;
    }
    if (Object.keys(selectedInputColumns).length === 0) {
      setSnackbarMessage("Please select at least one input column");
      setOpen(true);
      return;
    }

    const data = {
      selectedModel,
      formModelData,
      selectedFile,
      selectedOutputColumn,
      selectedInputColumns,
      selectedScaler,
    };

    // console.log("Form Data: ", data);

    executuePythonScript(data);

    // Submit your form data to wherever you need
  };

  function executuePythonScript(formData) {
    // serialize data to be sent to the python script
    const dataToSend = JSON.stringify(formData);

    // Spawn the Python process
    const pythonProcess = spawn(pythonPath, [
      machineLearningScript,
      dataToSend,
    ]);

    pythonProcess.stdout.on("data", (data) => {
      console.log(`stdout: ${data}`);
    });

    pythonProcess.stderr.on("data", (data) => {
      console.error(`stderr: ${data}`);
    });

    pythonProcess.on("close", (code) => {
      console.log(`preprocessScript.py exited with code ${code}`);
    });
  }

  // useEffect(() => {
  //   console.log("Form Data: ", formModelData);
  // }, [formModelData]);

  const handleFileChange = (event, newValue) => {
    setSelectedFile(importedFiles.find((file) => file.name === newValue));
  };

  const handleOutputColumnChange = (event, newValue) => {
    setSelectedOutputColumn(newValue);
  };

  const handleInputChangeColumn = (
    columnName,
    prevValue = 1,
    shiftValue = 1
  ) => {
    setSelectedInputColumns((prevData) => ({
      ...prevData,
      [columnName]: { prevValue, shiftValue },
    }));
  };

  const handleUnselectInputChangeColumn = (columnName) => {
    setSelectedInputColumns((prevData) => {
      const { [columnName]: _, ...rest } = prevData;
      return rest;
    });
  };

  function SlideTransition(props) {
    return <Slide {...props} direction="up" />;
  }

  function handleScalerChange(event, newValue) {
    setSelectedScaler({
      name: newValue,
      parameters: scalers[newValue], // this will set default values from db.json
    });
  }

  function handleScalerParameterChange(key, newValue) {
    setSelectedScaler((prevScaler) => ({
      ...prevScaler,
      parameters: {
        ...prevScaler.parameters,
        [key]: {
          ...prevScaler.parameters[key],
          default: newValue,
        },
      },
    }));
  }

  const handleScalerListParameterChange = (key, index, newValue) => {
    setSelectedScaler(prevState => {
      const updatedParameters = { ...prevState.parameters };
      if (updatedParameters[key]) {
        const values = [...updatedParameters[key].default];
        values[index] = Number(newValue);  // Assuming you want to store them as numbers
        updatedParameters[key].default = values;
      }
      return { ...prevState, parameters: updatedParameters };
    });
  };

  // useEffect(() => {
  //   console.log("Selected Scaler: ", selectedScaler);
  // }, [selectedScaler]);
  

  return (
    <div style={{ margin: "40px" }}>
      <Grid container columnSpacing={3}>
        <Grid item xs={12} md={6}>
          <Autocomplete
            id="model-selection"
            options={Object.keys(mlModels)}
            getOptionLabel={(option) => option}
            sx={{ marginTop: "16px", marginBottom: "16px" }}
            fullWidth
            onChange={(event, newValue) => handleModelChange(newValue)}
            renderInput={(params) => (
              <TextField {...params} label="Choose Model" variant="outlined" />
            )}
          />

          {selectedModel &&
            mlModels[selectedModel]["basic"] &&
            Object.entries(mlModels[selectedModel]["basic"]).map(
              ([paramName, paramDetails]) => {
                if (paramDetails.type === "select") {
                  return (
                    <Autocomplete
                      key={paramName}
                      options={paramDetails.options}
                      getOptionLabel={(option) => option}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={paramName}
                          fullWidth
                          variant="outlined"
                        />
                      )}
                      sx={{ marginTop: "16px", marginBottom: "16px" }}
                      value={
                        formModelData[paramName] !== undefined
                          ? formModelData[paramName]
                          : paramDetails.default
                      }
                      onChange={(event, newValue) => {
                        handleInputChange({
                          target: { name: paramName, value: newValue },
                        });
                      }}
                      onBlur={() => {
                        if (
                          !paramDetails.options.includes(
                            formModelData[paramName]
                          )
                        ) {
                          handleInputChange({
                            target: {
                              name: paramName,
                              value: paramDetails.default,
                            },
                          });
                        }
                      }}
                    />
                  );
                } else if (paramDetails.type === "boolean") {
                  return (
                    <Autocomplete
                      key={paramName}
                      options={[true, false]}
                      getOptionLabel={(option) => (option ? "True" : "False")}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={paramName}
                          fullWidth
                          variant="outlined"
                          required
                        />
                      )}
                      sx={{ marginTop: "16px", marginBottom: "16px" }}
                      value={
                        formModelData[paramName] !== undefined
                          ? formModelData[paramName]
                          : paramDetails.default
                      }
                      onChange={(event, newValue) => {
                        handleInputChange({
                          target: { name: paramName, value: newValue },
                        });
                      }}
                      onBlur={() => {
                        if (
                          formModelData[paramName] !== true &&
                          formModelData[paramName] !== false
                        ) {
                          handleInputChange({
                            target: {
                              name: paramName,
                              value: paramDetails.default,
                            },
                          });
                        }
                      }}
                    />
                  );
                } else {
                  return (
                    <TextField
                      key={paramName}
                      label={paramName}
                      name={paramName}
                      type={paramDetails.type}
                      fullWidth
                      variant="outlined"
                      sx={{ marginTop: "16px", marginBottom: "16px" }}
                      onChange={handleInputChange}
                      value={formModelData[paramName] || ""}
                      onBlur={() => {
                        const inputValue = formModelData[paramName];
                        if (
                          isNaN(inputValue) ||
                          !inputValue ||
                          inputValue < paramDetails.min ||
                          inputValue > paramDetails.max
                        ) {
                          handleInputChange({
                            target: {
                              name: paramName,
                              value: paramDetails.default,
                            },
                          });
                        }
                      }}
                      inputProps={{
                        min: paramDetails.min,
                        max: paramDetails.max,
                      }}
                    />
                  );
                }
              }
            )}

          {selectedModel && (
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
          )}

          {selectedModel &&
            showAdvanced &&
            mlModels[selectedModel]["advanced"] &&
            Object.entries(mlModels[selectedModel]["advanced"]).map(
              ([paramName, paramDetails]) => {
                if (paramDetails.type === "select") {
                  return (
                    <Autocomplete
                      key={paramName}
                      options={paramDetails.options}
                      getOptionLabel={(option) => option}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={paramName}
                          fullWidth
                          variant="outlined"
                        />
                      )}
                      sx={{ marginTop: "16px", marginBottom: "16px" }}
                      value={
                        formModelData[paramName] !== undefined
                          ? formModelData[paramName]
                          : paramDetails.default
                      }
                      onChange={(event, newValue) => {
                        handleInputChange({
                          target: { name: paramName, value: newValue },
                        });
                      }}
                      onBlur={() => {
                        if (
                          !paramDetails.options.includes(
                            formModelData[paramName]
                          )
                        ) {
                          handleInputChange({
                            target: {
                              name: paramName,
                              value: paramDetails.default,
                            },
                          });
                        }
                      }}
                    />
                  );
                } else if (paramDetails.type === "boolean") {
                  return (
                    <Autocomplete
                      key={paramName}
                      options={[true, false]}
                      getOptionLabel={(option) => (option ? "True" : "False")}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={paramName}
                          fullWidth
                          variant="outlined"
                          required
                        />
                      )}
                      sx={{ marginTop: "16px", marginBottom: "16px" }}
                      value={
                        formModelData[paramName] !== undefined
                          ? formModelData[paramName]
                          : paramDetails.default
                      }
                      onChange={(event, newValue) => {
                        handleInputChange({
                          target: { name: paramName, value: newValue },
                        });
                      }}
                      onBlur={() => {
                        if (
                          formModelData[paramName] !== true &&
                          formModelData[paramName] !== false
                        ) {
                          handleInputChange({
                            target: {
                              name: paramName,
                              value: paramDetails.default,
                            },
                          });
                        }
                      }}
                    />
                  );
                } else {
                  return (
                    <TextField
                      key={paramName}
                      label={paramName}
                      name={paramName}
                      type={paramDetails.type}
                      fullWidth
                      variant="outlined"
                      sx={{ marginTop: "16px", marginBottom: "16px" }}
                      onChange={handleInputChange}
                      value={formModelData[paramName] || ""}
                      onBlur={() => {
                        const inputValue = formModelData[paramName];
                        if (
                          isNaN(inputValue) ||
                          !inputValue ||
                          inputValue < paramDetails.min ||
                          inputValue > paramDetails.max
                        ) {
                          handleInputChange({
                            target: {
                              name: paramName,
                              value: paramDetails.default,
                            },
                          });
                        }
                      }}
                      inputProps={{
                        min: paramDetails.min,
                        max: paramDetails.max,
                      }}
                    />
                  );
                }
              }
            )}
        </Grid>

        <Grid item xs={12} md={6}>
          <Autocomplete
            id="file-selection"
            options={importedFiles.map((file) => file.name)}
            getOptionLabel={(option) => option}
            fullWidth
            sx={{ marginTop: "16px", marginBottom: "16px" }}
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

          {selectedFile &&
            selectedFile.columns.map((column) => (
              <div key={column}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={!!selectedInputColumns[column]}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleInputChangeColumn(column);
                        } else {
                          handleUnselectInputChangeColumn(column);
                        }
                      }}
                      color="primary"
                    />
                  }
                  label={column}
                />
                {selectedInputColumns[column] && (
                  <div>
                    <TextField
                      label={`Prev Values for ${column}`}
                      type="number"
                      fullWidth
                      variant="outlined"
                      sx={{ marginTop: "8px", marginRight: "8px" }}
                      inputProps={{ min: 1 }}
                      value={selectedInputColumns[column].prevValue}
                      onChange={(e) =>
                        handleInputChangeColumn(
                          column,
                          e.target.value,
                          selectedInputColumns[column].shiftValue
                        )
                      }
                    />
                    <TextField
                      label={`Shift value for ${column}`}
                      type="number"
                      fullWidth
                      variant="outlined"
                      sx={{ marginTop: "8px" }}
                      inputProps={{ min: 0 }}
                      value={selectedInputColumns[column].shiftValue}
                      onChange={(e) =>
                        handleInputChangeColumn(
                          column,
                          selectedInputColumns[column].prevValue,
                          e.target.value
                        )
                      }
                    />
                  </div>
                )}
              </div>
            ))}
        </Grid>

        <Grid item xs={12} md={6}>
          <Autocomplete
            id="scaler-selection"
            sx={{ marginTop: "16px", marginBottom: "16px" }}
            options={Object.keys(scalers)}
            getOptionLabel={(option) => option}
            fullWidth
            onChange={handleScalerChange}
            renderInput={(params) => (
              <TextField {...params} label="Choose Scaler" variant="outlined" />
            )}
          />

          {selectedScaler &&
            selectedScaler.parameters &&
            Object.entries(selectedScaler.parameters).map(([key, value]) => {
              if (value.type === "boolean") {
                return (
                    <FormControlLabel
                      key={key}
                    sx={{ marginTop: "16px", marginBottom: "16px" }}
                      control={
                        <Switch
                          checked={value.default}
                          onChange={(event) =>
                            handleScalerParameterChange(
                              key,
                              event.target.checked
                            )
                          }
                          color="primary"
                        />
                      }
                      label={key}
                    />
                );
              } else if (value.type === "list") {
                return value.default.map((item, index) => (
                    <TextField
                    key={`${key}-${index}`}
                    sx={{ marginTop: "16px", marginBottom: "16px" }}
                      fullWidth
                      variant="outlined"
                      label={value.labels[index]}
                      defaultValue={item}
                      onChange={(event) =>
                        handleScalerListParameterChange(
                          key,
                          index,
                          event.target.value
                        )
                      }
                    />
                ));
              }
              return null;
            })}
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

export default MlDynamicForm;
