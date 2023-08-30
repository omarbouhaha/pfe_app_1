import * as React from "react";
import { Link, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  styled,
  useTheme,
  Box,
  Drawer as MuiDrawer,
  AppBar as MuiAppBar,
  Toolbar,
  List,
  CssBaseline,
  Typography,
  Divider,
  IconButton,
} from "@mui/material";
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from "@mui/icons-material";
import AlertDialog from "./Dialog/AlertDialog";
import "./Navbar.css";
import { AI_APP_STORAGE, pythonPath, getColumnsScriptPath } from "../constants";
import { setImportedFiles } from "../reduxToolkit/importStepSlice";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import SideBarItem from "./SideBarItem/SideBarItem";
import AppNavbar from "./AppNavbar";
import Button from "@mui/material/Button";
import { Link as RouterLink, useLocation } from "react-router-dom";
const { os, pathModule, fs, ipcRenderer, dialog, spawn } = window;

const drawerWidth = 350;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

export default function MiniDrawer() {
  const theme = useTheme();
  const dispatch = useDispatch();
 

  // console.log(theme.palette);
  const [open, setOpen] = React.useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const importedFiles = useSelector((state) => state.importStep.importedFiles);

  function getFiles() {
    const appDirectory = pathModule.join(os.homedir(), AI_APP_STORAGE);

    fs.readdir(appDirectory, (err, files) => {
      if (err) {
        console.log(err);
        return;
      }

      const detailedFilesPromises = files.map((filename) => {
        const filePath = pathModule.join(appDirectory, filename);
        const stats = fs.statSync(filePath);
        const fileDetail = {
          name: filename,
          path: filePath,
          size: stats.size, // size in bytes
          type: pathModule.extname(filename).slice(1), // file extension without the dot
        };

        return new Promise((resolve, reject) => {
          const pythonProcess = spawn(pythonPath, [
            getColumnsScriptPath,
            filePath,
          ]);
          let output = "";
          pythonProcess.stderr.on("data", (data) => {
            console.error(`stderr: ${data}`);
          });
          pythonProcess.stdout.on("data", (data) => {
            output += data.toString();
          });
          pythonProcess.on("close", (code) => {
            if (code !== 0) {
              return reject(
                new Error(`getColumnsScript.py exited with code ${code}`)
              );
            }
            fileDetail.columns = JSON.parse(output);
            resolve(fileDetail);
          });
        });
      });

      Promise.all(detailedFilesPromises)
        .then((detailedFiles) => {
          dispatch(setImportedFiles(detailedFiles));
        })
        .catch((error) => console.log(error));
    });
  }

  function deleteFile(filename) {
    const appDirectory = pathModule.join(os.homedir(), AI_APP_STORAGE);
    const filePath = pathModule.join(appDirectory, filename);

    // Show a confirmation dialog before deletion
    const choice = dialog.showMessageBoxSync({
      type: "question",
      buttons: ["Yes", "No"],
      title: "Confirm",
      message: "Are you sure you want to delete this file?",
    });

    if (choice === 0) {
      // if 'Yes' was clicked
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(`Failed to delete file: ${err}`);
        } else {
          getFiles(); // Update the file list
        }
      });
    }
  }

  useEffect(() => {
    getFiles();
  }, []);
  useEffect(() => {
    const directoryChangedHandler = (event, { eventType, filename }) => {
      getFiles();
    };

    ipcRenderer.on("directory-changed", directoryChangedHandler);

    return () => {
      ipcRenderer.removeListener("directory-changed", directoryChangedHandler);
    };
  }, []);

  // Helper function to determine if a link is active
  

  return (
    <>
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <AppNavbar 
                open={open} 
                handleDrawerOpen={handleDrawerOpen} 
            />
        <Drawer variant="permanent" open={open}>
          <DrawerHeader>
            <IconButton onClick={handleDrawerClose}>
              {theme.direction === "rtl" ? (
                <ChevronRightIcon />
              ) : (
                <ChevronLeftIcon />
              )}
            </IconButton>
          </DrawerHeader>
          <Divider />
          <List>
            {importedFiles.map((file, index) => (
              <SideBarItem
                key={file.name}
                file={file}
                open={open}
                onDelete={() => deleteFile(file.name)}
              />
            ))}
          </List>
          {/* <Divider />
          <List>
            {["All mail", "Trash", "Spam"].map((text, index) => (
              <ListItem key={text} disablePadding sx={{ display: "block" }}>
                <ListItemButton
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? "initial" : "center",
                    px: 2.5,
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 3 : "auto",
                      justifyContent: "center",
                    }}
                  >
                    {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                  </ListItemIcon>
                  <ListItemText primary={text} sx={{ opacity: open ? 1 : 0 }} />
                </ListItemButton>
              </ListItem>
            ))}
          </List> */}
        </Drawer>
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <DrawerHeader />
          <Outlet />
        </Box>
      </Box>

      <AlertDialog />
    </>
  );
}
