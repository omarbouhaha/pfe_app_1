import React from "react";
import {
  Checkbox,
  FormControlLabel,
  Button,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Grid,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useSelector, useDispatch } from "react-redux";
import { setApply, setMethod } from "../../reduxToolkit/dataPreprocessingSlice"; // import the actions from your slice
import { fetchData } from "../../reduxToolkit/dataPreprocessingSlice";
import { useEffect } from "react";
import RecursiveOptions from "../RecursiveOptions/RecursiveOptions";
import { useParams } from "react-router-dom";
import { addOrModifyOption } from "../../reduxToolkit/dataPreprocessingSlice"; 
import { AI_APP_STORAGE, pythonPath, preprocessingScriptPath } from "../../constants";
const {spawn} = window;

function DataPreprocessingForm() {
  const dispatch = useDispatch();
  const { data } = useSelector((state) => state.dataPreprocessing); // access the state of the form
  const { fileId } = useParams();
  const { importedFiles } = useSelector((state) => state.importStep);
    const selectedOptions = useSelector(
    (state) => state.dataPreprocessing.selectedOptions
    );
  const handlePreprocessing = () => {
    // Sort selectedOptions based on the operation order
    const selectedOptionsCopy = [...selectedOptions];  // Create a copy of selectedOptions
    console.log("Selected options before sort: ", selectedOptionsCopy);

    const getOrder = (operationName) => {
        for (let key in data) {
          for (let operation of data[key].operations) {
            if (operation.name === operationName) {
              return operation.order;
            }
          }
        }
        return -1; // default value if not found
      };
  
    // Sort the copy based on order
    selectedOptionsCopy.sort((a, b) => getOrder(a.operationName) - getOrder(b.operationName));
    console.log("Selected options after sort: ", selectedOptionsCopy);
    dispatch(addOrModifyOption({selectedOptionsCopy}));
    const filePath = getFilePathById(fileId);
    if (filePath) {
      console.log(`File path for ${fileId} is: ${filePath}`);
        executePreprocessing(filePath, selectedOptionsCopy);
    } else {
      console.log(`No file found for the ID ${fileId}`);
    }
  };
  useEffect(() => {
    dispatch(fetchData());
  }, [dispatch]);

  const getFilePathById = (fileId) => {
    const file = importedFiles.find((file) => file.id === fileId);
    return file ? file.path : null;
  };

  function executePreprocessing(filePath, selectedOptions) {
    // Serialize selectedOptions to a JSON string
    const serializedOptions = JSON.stringify(selectedOptions);

    // Spawn the Python process
    const pythonProcess = spawn(pythonPath, [preprocessingScriptPath, filePath, serializedOptions]);

    pythonProcess.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        console.log(`preprocessScript.py exited with code ${code}`);
    });
}

  return (
    <div>
      {Object.keys(data).map((key, index) => {
        return (
          <Accordion key={key}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography>{data[key].title}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                {data[key].operations.map((operation) => {
                  return (
                    <Grid item xs={3} key={operation.name}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={operation.apply}
                            onChange={(event) =>
                              dispatch(
                                setApply({
                                  operationName: operation.name,
                                  apply: event.target.checked,
                                })
                              )
                            }
                          />
                        }
                        label={operation.name}
                      />
                      {operation.apply &&
                        operation.options &&
                        operation.options.length > 0 && (
                          <>
                            {/* Remove the Autocomplete here, and let RecursiveOptions handle it */}
                            <RecursiveOptions
                              options={operation.options}
                              operationName={operation.name}
                            />
                          </>
                        )}
                    </Grid>
                  );
                })}
              </Grid>
            </AccordionDetails>
          </Accordion>
        );
      })}

      <div style={{ marginTop: "20px" }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handlePreprocessing()}
        >
          Preprocess Data
        </Button>
      </div>
    </div>
  );
}

export default DataPreprocessingForm;
