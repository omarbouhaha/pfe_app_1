import React from 'react'
import { useSelector } from 'react-redux'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { fetchMlModels, fetchScalers } from '../../reduxToolkit/mlModelsSlice';
import MlDynamicForm from './Forms/MlDynamicForm';

const MlTab = () => {
    const dispatch = useDispatch()
    const mlModels = useSelector(state => state.mlModels.ml_models)
    useEffect(() => {
        dispatch(fetchMlModels())
        dispatch(fetchScalers())
    }, [dispatch])

  return (
    <div>
      <MlDynamicForm/>
    </div>
  )
}

export default MlTab
