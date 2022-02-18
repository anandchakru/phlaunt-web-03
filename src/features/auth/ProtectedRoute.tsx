import React from 'react'
import { useAppSelector, useAppDispatch } from '../../app/hooks'
import { selectIsAuth, signOutAsync } from './AuthSlice'
import {
  Navigate,
  useLocation,
  Outlet,
  useNavigate
} from 'react-router-dom'

import { Button } from '@mui/material'

const ProtectedRoute = ({ redirectTo, ...props }) => {
  const navigate = useNavigate()
  const isAuth = useAppSelector(selectIsAuth)
  const dispatch = useAppDispatch()
  let location = useLocation()

  if (isAuth) {
    return <>
      {isAuth && <Button onClick={() => {
        dispatch(signOutAsync({}))
        navigate('/home')
      }}>Signout</Button>}
      <Button onClick={() => {
        navigate('/home')
      }}>Home</Button>
      <Outlet />
    </>
  } else {
    return (<Navigate to={redirectTo} state={{ from: location }} />)
  }
}

export default ProtectedRoute