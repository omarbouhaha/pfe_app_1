import * as React from "react";
import { useNavigate } from "react-router-dom";

import {
  useTheme,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  List,
  Tooltip
} from "@mui/material";
import {
  InsertDriveFile as InsertDriveFileIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import { absoluteRoutes } from "../../routes";

const SideBarItem = ({ file, open, onDelete }) => {
  const { name, columns, id } = file;
  const theme = useTheme();
  const navigate = useNavigate();

  const [showColumns, setShowColumns] = React.useState(false);

  const toggleColumns = () => {
    setShowColumns((prev) => !prev);
  };

  return (
    <>
      <ListItem
        key={name}
        disablePadding
        sx={{ display: "flex", justifyContent: "space-between" }}
      >
        <ListItemButton
          onClick={toggleColumns}
          sx={{
            minHeight: 48,
            justifyContent: open ? "initial" : "center",
            px: 2.5,
            display: "flex", // Added to align ListItemButton's children horizontally
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: open ? 3 : "auto",
              justifyContent: open ? "flex-start" : "center", // Center the icon when sidebar is closed
              color: "success.light",
            }}
          >
            <InsertDriveFileIcon />
          </ListItemIcon>
          <Tooltip title={name} placement="right">
          <ListItemText
            primary={name}
            sx={{
              opacity: open ? 1 : 0,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              position: "relative",
              "&:after": {
                content: '""',
                position: "absolute",
                top: 0,
                right: 0,
                width: "20%",
                height: "100%",
                // backgroundImage: `linear-gradient(to right, transparent, white 50%)`,
              },
            }}
          />
          </Tooltip>
          <IconButton
            edge="end"
            aria-label="edit"
            onClick={(event) => {
              event.stopPropagation(); // prevent triggering toggleColumns
              navigate(absoluteRoutes.EDIT(id));
            }}
            sx={{ opacity: open ? 1 : 0, display: open ? "" : "none" }} // Hide when sidebar is closed
          >
            <EditIcon sx={{ color: theme.palette.info.main }} />
          </IconButton>
          <IconButton
            edge="end"
            aria-label="delete"
            onClick={(event) => {
              event.stopPropagation(); // prevent triggering toggleColumns
              onDelete();
            }}
            sx={{ opacity: open ? 1 : 0, display: open ? "" : "none" }} // Hide when sidebar is closed
          >
            <DeleteIcon sx={{ color: theme.palette.error.main }} />
          </IconButton>
        </ListItemButton>
      </ListItem>
      <Collapse in={open && showColumns} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {columns.map((column) => (
            <ListItem key={column} sx={{ paddingLeft: 4 }}>
              <ListItemText primary={column} />
            </ListItem>
          ))}
        </List>
      </Collapse>
    </>
  );
};

export default SideBarItem;
