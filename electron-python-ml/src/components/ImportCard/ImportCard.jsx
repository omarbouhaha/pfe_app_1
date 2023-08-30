import React, { useRef } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import AddCircle from "@mui/icons-material/AddCircle";
import { styled } from "@mui/system";
import { useDispatch } from "react-redux";
import { openDialog } from "../../reduxToolkit/dialogSlice";
import { useEffect } from "react";

const Input = styled("input")({
  display: "none",
});

const {ipcRenderer} = window;

export default function ImportCard({ importFrom, onClick }) {
  const fileInputRef = useRef();
  const dispatch = useDispatch();
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    console.log(file);
    const fileType = file.type.split("/").pop();
    if (fileType.toLowerCase() === importFrom.toLowerCase()) {
        ipcRenderer.send('save-file', file.path);
    //   dispatch(
    //     openDialog({
    //       title: "File Imported",
    //       message: `The ${fileType} file has been imported successfully.`,
    //       status: "success",
    //     })
    //   );
    } else {
      dispatch(
        openDialog({
          title: "Incorrect File Type",
          message: `The selected file is a ${fileType} file. Please import a ${importFrom} file.`,
          status: "error",
        })
      );
    }
  };
  const handleCardClick = (e) => {
    e.stopPropagation();
    fileInputRef.current.click();
  };

  useEffect(() => {
    ipcRenderer.on('save-file-reply', (event, arg) => {
      dispatch(
        openDialog({
          open: true,
          title: arg.success ? "Success" : "Error",
          message: arg.message,
          status: arg.success ? "success" : "error",
        })
      );
    });
  
    // Cleanup
    return () => {
      ipcRenderer.removeAllListeners('save-file-reply');
    };
  }, []);

  return (
    <Card sx={{ minWidth: 275 }} onClick={onClick}>
      <CardActionArea onClick={handleCardClick}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "gray",
            height: 200,
          }}
        >
          <AddCircle sx={{ fontSize: 100, color: "white" }} />
        </Box>
        <CardContent>
          <Typography variant="h5" component="div" align="center">
            Import from {importFrom}
          </Typography>
          <Input
            accept={`.${importFrom}`}
            id="contained-button-file"
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
