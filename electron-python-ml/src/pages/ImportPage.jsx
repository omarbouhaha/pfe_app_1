import React from 'react'
import ImportCard from '../components/ImportCard/ImportCard'
import { useSelector } from 'react-redux';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';

const ImportPage = () => {

  const importStepList = useSelector((state) => state.importStep.list);
  const handleClick = (item) => {
    console.log('Card clicked: ', item);
    // Here you can dispatch actions based on the clicked card
    // For example, to remove an item when a card is clicked:
    // dispatch(removeImportFrom(item));
  };
  return (
    <Container>
      <Grid container spacing={12}>
        {importStepList.map((importStep, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
            <ImportCard importFrom={importStep} onClick={() => handleClick(importStep)} />
          </Grid>
        ))}
      </Grid>
    </Container>
  )
}

export default ImportPage
