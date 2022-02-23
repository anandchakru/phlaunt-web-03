import React, { useEffect } from 'react'
import {
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
import { authInitAsync, authStateChange, setAuthCredentials, fireauth, selectAuthCredential, selectAuthInitStatus, AUTH_CREDENTIAL, AppCredential, selectAuthUser } from './features/auth/AuthSlice'
import { onAuthStateChanged } from "firebase/auth"
import { Backdrop, Box, CircularProgress } from '@mui/material'
import NewAlbum from './features/album/NewAlbum'
import ResponsiveAppBar from './features/utils/ResponsiveAppBar'
import Profile from './features/profile/Profile'
import { fetchGalleryAsync } from './features/gallery/GallerySlice'

function App() {
  const authUser = useAppSelector(selectAuthUser)
  const authInitStatus = useAppSelector(selectAuthInitStatus)
  const authCredential = useAppSelector(selectAuthCredential)
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

  useEffect(() => {
    if (authCredential) {
      const tmp = localStorage.getItem(AUTH_CREDENTIAL)
      if (!tmp || (authUser && (JSON.parse(tmp) as AppCredential).uid !== authUser.uid)) {
        localStorage.setItem(AUTH_CREDENTIAL, JSON.stringify(authCredential))
      }
    } else {
      const tmp = localStorage.getItem(AUTH_CREDENTIAL)
      if (tmp) {
        dispatch(setAuthCredentials(JSON.parse(tmp)))
      }
    }
    dispatch(fetchGalleryAsync(''))
  }, [authCredential, authUser, dispatch])
  return (<Box sx={{ flexGrow: 1 }}>
    <ResponsiveAppBar />
    <Container sx={{ textAlign: 'center' }}>
      <Routes>
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute redirectTo="/login" />}> {/* https://stackoverflow.com/a/69592617 */}
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/album" element={<Navigate to="/gallery" />} />
          <Route path="/album/new" element={<NewAlbum />} />
          <Route path="/album/:albumId" element={<Album />} />
        </Route>
        <Route path="*" element={<h1>404</h1>} />
      </Routes>
      <Backdrop
        sx={{ backgroundColor: '#ffffffee', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={authInitStatus === 'loading'}>
        <CircularProgress />
      </Backdrop>
    </Container>
  </Box>
  )
}

export default App
