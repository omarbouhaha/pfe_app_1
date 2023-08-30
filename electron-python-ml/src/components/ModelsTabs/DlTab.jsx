import React from 'react'
import DlDynamicForm from './Forms/DlDynamicForm'
import { useSelector } from 'react-redux'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { fetchDlModels, fetchScalers } from '../../reduxToolkit/dlModelsSlice';

const DlTab = () => {
    const dispatch = useDispatch()
    const dlModels = useSelector(state => state.dlModels.dl_models)
    useEffect(() => {
        dispatch(fetchDlModels())
        dispatch(fetchScalers())
    }, [dispatch])

  return (
    <div>
      <DlDynamicForm/>
    </div>
  )
}

export default DlTab
