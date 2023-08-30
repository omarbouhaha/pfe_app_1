import React from "react";
import { Button, Toolbar, Typography, IconButton } from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { styled } from "@mui/material/styles";
import MuiAppBar from "@mui/material/AppBar";
import HomeIcon from "@mui/icons-material/Home";
import BarChartIcon from "@mui/icons-material/BarChart";
import { absoluteRoutes } from "../routes";
import { Memory } from "@mui/icons-material";

const drawerWidth = 350;
const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

function AppNavbar({ open, handleDrawerOpen }) {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;
  return (
    <AppBar position="fixed" open={open}>
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={handleDrawerOpen}
          edge="start"
          sx={{
            marginRight: 5,
            ...(open && { display: "none" }),
          }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          SDML
        </Typography>
        <Button
          component={RouterLink}
          to={absoluteRoutes.HOME}
          color={isActive(absoluteRoutes.HOME) ? "primary" : "inherit"}
          variant={isActive(absoluteRoutes.HOME) ? "contained" : "text"}
          sx={{ 
            marginRight: 2 ,
            fontWeight: isActive(absoluteRoutes.HOME) ? 'bold' : 'normal',
            borderBottom: isActive(absoluteRoutes.HOME) ? '2px solid currentColor' : 'none'
          }}
        >
          <HomeIcon sx={{ marginRight: 1 }} /> {/* Icon */}
          Home
        </Button>
        <Button
          component={RouterLink}
          to={absoluteRoutes.CHARTS}
          color={isActive(absoluteRoutes.CHARTS) ? "primary" : "inherit"}
          variant={isActive(absoluteRoutes.CHARTS) ? "contained" : "text"}
          sx={{ 
            marginRight: 2 ,
            fontWeight: isActive(absoluteRoutes.CHARTS) ? 'bold' : 'normal',
            borderBottom: isActive(absoluteRoutes.CHARTS) ? '2px solid currentColor' : 'none'
          }}
        >
          <BarChartIcon sx={{ marginRight: 1 }} /> {/* Icon */}
          Charts
        </Button>
        <Button
          component={RouterLink}
          to={absoluteRoutes.AIMODELS}
          color={isActive(absoluteRoutes.AIMODELS) ? "primary" : "inherit"}
          variant={isActive(absoluteRoutes.AIMODELS) ? "contained" : "text"}
          sx={{ 
            marginRight: 2 ,
            fontWeight: isActive(absoluteRoutes.AIMODELS) ? 'bold' : 'normal',
            borderBottom: isActive(absoluteRoutes.AIMODELS) ? '2px solid currentColor' : 'none'
          }}
        >
          <Memory sx={{ marginRight: 1 }}/>
          AI Models
        </Button>
      </Toolbar>
    </AppBar>
  );
}

export default AppNavbar;
