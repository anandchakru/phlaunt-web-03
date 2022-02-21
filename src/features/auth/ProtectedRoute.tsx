import React from 'react'
import { useAppSelector, useAppDispatch } from '../../app/hooks'
import { selectIsAuth, selectAuthUser, signOutAsync } from './AuthSlice'
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
  // const credential = useAppSelector(selectAuthCredential)
  const user = useAppSelector(selectAuthUser)
  const dispatch = useAppDispatch()
  let location = useLocation()

  if (isAuth) {
    return <>
      {isAuth && <Button onClick={() => {
        dispatch(signOutAsync({}))
        navigate('/home')
      }}>[{user?.displayName}] Signout</Button>}
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