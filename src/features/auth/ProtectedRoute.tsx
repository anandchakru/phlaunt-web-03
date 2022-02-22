import React from 'react'
import { useAppSelector, useAppDispatch } from '../../app/hooks'
import { selectIsAuth, selectAuthUser, signOutAsync, AUTH_CREDENTIAL } from './AuthSlice'
import {
  Navigate,
  useLocation,
  Outlet,
  useNavigate
} from 'react-router-dom'

import { Button, Typography } from '@mui/material'

const ProtectedRoute = ({ redirectTo, ...props }) => {
  const navigate = useNavigate()
  const isAuth = useAppSelector(selectIsAuth)
  // const credential = useAppSelector(selectAuthCredential)
  const user = useAppSelector(selectAuthUser)
  const dispatch = useAppDispatch()
  let location = useLocation()

  if (isAuth) {
    return <>
      {isAuth && <>
        <Button onClick={() => {
          dispatch(signOutAsync({}))
          navigate('/home')
        }}>Signout</Button>
        <div style={{ float: 'right', padding: '6px 8px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Typography color="text.secondary" mr={1}>{user?.email}</Typography>
          <img style={{ marginLeft: '5px', width: '20px', borderRadius: '50%' }} src={user?.photoURL as string} alt="" />
        </div>
      </>}
      <Button onClick={() => {
        navigate('/home')
      }}>Home</Button>
      {!localStorage.getItem(AUTH_CREDENTIAL) && <span>Are you on a private/incognito browser? Signout and try again.</span>}
      <Outlet />
    </>
  } else {
    return (<Navigate to={redirectTo} state={{ from: location }} />)
  }
}

export default ProtectedRoute