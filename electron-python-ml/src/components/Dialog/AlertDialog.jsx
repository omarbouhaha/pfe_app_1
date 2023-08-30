import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { useSelector, useDispatch } from 'react-redux';
import { closeDialog } from '../../reduxToolkit/dialogSlice';

export default function AlertDialog() {
    const { open, title, message,status  } = useSelector(state => state.dialog);
    const colorMapping = {
      default: 'inherit',
      success: '#e8f5e9',
      error: '#ffebee'
    };
    const dispatch = useDispatch();
    const handleClose = () => {
        dispatch(closeDialog());
      };
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      sx={{ '& .MuiPaper-root': { backgroundColor: colorMapping[status] } }}
    >
      <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
      <DialogContent sx={{width: "500px", height: "80px", overflow: "auto"}}>
        <DialogContentText id="alert-dialog-description">
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
