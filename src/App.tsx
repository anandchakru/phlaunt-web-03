import React, { useEffect } from 'react'
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom'
import Home from './features/home/Home'
import Gallery from './features/gallery/Gallery'
import Album from './features/album/Album'
import Container from '@mui/material/Container'
import ProtectedRoute from './features/auth/ProtectedRoute'
import Login from './features/auth/Login'
import './App.scss'
import { useAppDispatch, useAppSelector } from './app/hooks'
import { authInitAsync, authStateChange, fireauth, selectAuthInitStatus } from './features/auth/AuthSlice'
import { onAuthStateChanged } from "firebase/auth"
import { Backdrop, CircularProgress } from '@mui/material'
import NewAlbum from './features/album/NewAlbum'


function App() {
  const authInitStatus = useAppSelector(selectAuthInitStatus)

  const dispatch = useAppDispatch()
  useEffect(() => {
    onAuthStateChanged(fireauth, (usr) => {
      if (usr) {
        dispatch(authStateChange({
          user: {
            uid: usr.uid,
            displayName: usr.displayName,
            email: usr.email,
            photoURL: usr.photoURL,
            providerId: usr.providerId,
            emailVerified: usr.emailVerified,
          }
        }))
      }
    })
  }, [dispatch])
  useEffect(() => {
    dispatch(authInitAsync({}))
  }, [dispatch])
  return (
    <Container sx={{ textAlign: 'center' }}>
      <BrowserRouter basename='/phlaunt-web-03'>
        <Routes>
          <Route path="/" element={<Navigate to="/home" />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute redirectTo="/login" />}> {/* https://stackoverflow.com/a/69592617 */}
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/album" element={<Navigate to="/gallery" />} />
            <Route path="/album/new" element={<NewAlbum />} />
            <Route path="/album/:albumId" element={<Album />} />
          </Route>
          <Route path="*" element={<h1>404</h1>} />
        </Routes>
      </BrowserRouter>
      <Backdrop
        sx={{ backgroundColor: '#ffffffee', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={authInitStatus === 'loading'}>
        <CircularProgress />
      </Backdrop>
    </Container>
  )
}

export default App
