import React from 'react'
import { useAppSelector } from '../../app/hooks'
import { selectIsAuth } from './AuthSlice'
import {
  Navigate,
  useLocation,
  Outlet,
} from 'react-router-dom'

import { Box } from '@mui/material'

const ProtectedRoute = ({ redirectTo, ...props }) => {
  const isAuth = useAppSelector(selectIsAuth)
  let location = useLocation()
  return isAuth ? (<Box mt={4}> <Outlet /> </Box>)
    : (<Navigate to={redirectTo} state={{ from: location }} />)
}

export default ProtectedRoute