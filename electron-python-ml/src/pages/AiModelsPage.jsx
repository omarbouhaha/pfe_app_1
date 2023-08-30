import React, { useState } from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import MlTab from '../components/ModelsTabs/MlTab';
import DlTab from '../components/ModelsTabs/DlTab';

const AiModelsPage = () => {
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <div>
      <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
        <Tabs
          value={value}
          onChange={handleChange}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
          aria-label="full width tabs"
        >
          <Tab label="ML Models" />
          <Tab label="DL Models" />
        </Tabs>
      </Box>
      {value === 0 && <MlTab />}
      {value === 1 && <DlTab />}
    </div>
  );
}

export default AiModelsPage;
