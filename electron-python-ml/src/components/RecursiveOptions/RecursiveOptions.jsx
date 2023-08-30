import React from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { useDispatch, useSelector } from "react-redux";
import { addOrModifyOption, deleteOptionByOperationName } from "../../reduxToolkit/dataPreprocessingSlice";

function RecursiveOptions({ options, operationName }) {
  const dispatch = useDispatch();
  const [selectedOption, setSelectedOption] = React.useState(null);
  const [inputParameters, setInputParameters] = React.useState({});
  const selectedOptions = useSelector(
    (state) => state.dataPreprocessing.selectedOptions
  );

  const currentOption = options.find(
    (option) => option.name === selectedOption
  );

  const handleParameterChange = (optionName, parameterName, value) => {
    let modifiedOptions = [...selectedOptions];
    // Check and remove any option with the same operationName
    modifiedOptions = modifiedOptions.filter(
      (opt) => opt.operationName !== operationName
    );
    const optionIndex = modifiedOptions.findIndex(
      (opt) => opt.name === optionName
    );

    if (optionIndex > -1) {
      // Deep copy of the option
      const optionCopy = {
        ...modifiedOptions[optionIndex],
        parameters: [...modifiedOptions[optionIndex].parameters],
      };

      const parameterIndex = optionCopy.parameters.findIndex(
        (param) => param.name === parameterName
      );

      if (parameterIndex > -1) {
        // Create a new array with our modified parameter
        const updatedParameters = optionCopy.parameters.map((param, index) =>
          index === parameterIndex ? { ...param, value: value } : param
        );

        optionCopy.parameters = updatedParameters; // Replace the old parameters array with the new one
      } else {
        optionCopy.parameters.push({
          name: parameterName,
          value: value,
        });
      }

      modifiedOptions[optionIndex] = optionCopy; // Replace the old option with the modified copy
    } else {
      modifiedOptions.push({
        name: optionName,
        operationName: operationName,
        parameters: [{ name: parameterName, value: value }],
      });
    }

    console.log(modifiedOptions);

    dispatch(addOrModifyOption({ modifiedOptions }));
  };

  const handleOptionWithoutParametersChange = (optionName) => {
    let modifiedOptions = [...selectedOptions];
  
    // Remove any option with the same operationName
    modifiedOptions = modifiedOptions.filter(opt => opt.operationName !== operationName);
  
    const existingOptionIndex = modifiedOptions.findIndex(opt => opt.name === optionName);
  
    if (existingOptionIndex === -1) { // Only add if it's not already added
      const newOption = {
        name: optionName,
        operationName: operationName,
        parameters: []
      };
  
      modifiedOptions.push(newOption);
      dispatch(addOrModifyOption({modifiedOptions}));
    }
  }
  
  

  return (
    <div>
      <Autocomplete
        options={options.map((option) => option.name)}
        value={selectedOption}
        onChange={(event, newValue) => {
            setSelectedOption(newValue);
            setInputParameters({});
          
            if (newValue) {
              const currentOption = options.find(
                (option) => option.name === newValue
              );
          
              if ((!currentOption.parameters || currentOption.parameters.length === 0) && !currentOption.options) {
                // This option has no parameters
                handleOptionWithoutParametersChange(currentOption.name);
              }
            } else {
              // Handle clear action (as previously implemented)
              dispatch(deleteOptionByOperationName(operationName));
            }
          }}
        renderInput={(params) => (
          <TextField {...params} label="Choose an option" variant="outlined" />
        )}
        sx={{ marginBottom: "10px", marginTop: "10px" }}
      />

      {currentOption?.parameters &&
        currentOption.parameters.map((parameter, index) => (
          <div key={index} style={{ marginBottom: "10px", marginTop: "10px" }}>
            <TextField
              label={parameter.name}
              type={parameter.type}
              variant="outlined"
              fullWidth
              value={inputParameters[parameter.name] || ''}
              onChange={(e) => {
                handleParameterChange(
                  currentOption.name,
                  parameter.name,
                  e.target.value
                );
                setInputParameters(prev => ({ ...prev, [parameter.name]: e.target.value }));
              }}
            />
          </div>
        ))}

      {/* Only render nested options if they exist for the current option */}
      {currentOption?.options && (
        <RecursiveOptions options={currentOption.options} />
      )}
    </div>
  );
}

export default RecursiveOptions;
