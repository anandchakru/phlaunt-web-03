import React, { useEffect } from 'react'
import { Button } from '@mui/material'
import { useLocation } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '../../app/hooks'
import { signInAsync, selectIsAuth } from './AuthSlice'
import { useNavigate } from "react-router-dom"

export type ProtectedRedirectState = {
  from: Location
}

function Login() {
  const isAuth = useAppSelector(selectIsAuth)
  const location = useLocation()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const redirectTo = (location && location.state) ? (location.state as ProtectedRedirectState).from.pathname : '/gallery'
  useEffect(() => {
    if (isAuth) {
      navigate({ 'pathname': redirectTo, 'search': (location.state as any)?.from?.search, })
    }
  }, [isAuth, redirectTo, navigate, location.state])
  return (
    <div>
      Login
      <Button onClick={() => { dispatch(signInAsync({ redirectTo })) }}>Login</Button>
    </div>
  )
}

export default Login