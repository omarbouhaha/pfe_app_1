import * as React from "react";
import PropTypes from "prop-types";
import Slider, { SliderThumb } from "@mui/material/Slider";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";
import { useState } from "react";
import { Fullscreen } from "@mui/icons-material";

function ValueLabelComponent(props) {
  const { children, value } = props;

  return (
    <Tooltip enterTouchDelay={0} placement="top" title={value}>
      {children}
    </Tooltip>
  );
}

ValueLabelComponent.propTypes = {
  children: PropTypes.element.isRequired,
  value: PropTypes.number.isRequired,
};

const AirbnbSlider = styled(Slider)(({ theme }) => ({
  color: "#3a8589",
  height: 3,
  padding: "13px 0",
  "& .MuiSlider-thumb": {
    height: 27,
    width: 27,
    backgroundColor: "#fff",
    border: "1px solid currentColor",
    "&:hover": {
      boxShadow: "0 0 0 8px rgba(58, 133, 137, 0.16)",
    },
    "& .airbnb-bar": {
      height: 9,
      width: 1,
      backgroundColor: "currentColor",
      marginLeft: 1,
      marginRight: 1,
    },
  },
  "& .MuiSlider-track": {
    height: 3,
  },
  "& .MuiSlider-rail": {
    color: theme.palette.mode === "dark" ? "#bfbfbf" : "#d8d8d8",
    opacity: theme.palette.mode === "dark" ? undefined : 1,
    height: 3,
  },
}));

function AirbnbThumbComponent(props) {
  const { children, ...other } = props;
  return (
    <SliderThumb {...other}>
      {children}
      <span className="airbnb-bar" />
      <span className="airbnb-bar" />
      <span className="airbnb-bar" />
    </SliderThumb>
  );
}

AirbnbThumbComponent.propTypes = {
  children: PropTypes.node,
};

export default function CustomizedSlider({ min, max, step, onSlideEnd }) {
  const [value, setValue] = useState([0, 1000]);
  const maxDifference = 5000;
  const handleSliderChange = (event, newValue) => {
    const difference = newValue[1] - newValue[0];

    if (difference > maxDifference) {
      if (newValue[1] > value[1]) {
        newValue[0] = newValue[1] - maxDifference;
      } else {
        newValue[1] = newValue[0] + maxDifference;
      }
    }

    setValue(newValue);
  };

  const handleSliderChangeCommitted = (event, newValue) => {
    if (onSlideEnd) {
      onSlideEnd(newValue); // Notify parent only after sliding is done
    }
  };

  return (
    <Box>
      {/* <Typography gutterBottom>Airbnb</Typography> */}
      <AirbnbSlider
        slots={{ thumb: AirbnbThumbComponent }}
        value={value}
        onChange={handleSliderChange}
        onChangeCommitted={handleSliderChangeCommitted}
        min={min} // set the minimum value
        max={max} // set the maximum value
        step={step} // set the step
        // other props...
      />
    </Box>
  );
}
