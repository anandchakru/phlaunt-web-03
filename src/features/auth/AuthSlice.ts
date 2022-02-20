import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { signOut } from 'firebase/auth'
// import { OAuthCredential } from 'firebase/auth'
import { RootState } from '../../app/store'

import { getAuth, signInWithPopup, GithubAuthProvider } from "firebase/auth"
import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'

export interface AppUser {
  uid: string
  displayName: string | null
  email: string | null
  photoURL: string | null
  providerId: string
  emailVerified: boolean
}
export interface AuthState {
  isAuthenticated: boolean
  status: 'idle' | 'loading' | 'failed'
  initStatus: 'idle' | 'loading' | 'failed'
  user?: AppUser,
  // credential?: OAuthCredential | null
}

const initialState: AuthState = {
  isAuthenticated: false,
  status: 'idle',
  initStatus: 'loading',
}

// Initialize Firebase
export const fireapp = initializeApp({
  apiKey: 'AIzaSyBVFnbdQBDsIoPLOOsyfzcyzlhGXASH3TA',
  authDomain: 'phlaunt-001.firebaseapp.com',
  projectId: 'phlaunt-001',
  storageBucket: 'phlaunt-001.appspot.com',
  messagingSenderId: '1055780262369',
  appId: '1:1055780262369:web:0a218a90c28f75d3e9c2a0',
  measurementId: 'G-M2EY5FNN5M'
})
export const analytics = getAnalytics(fireapp)
export const fireauth = getAuth(fireapp)
// https://firebase.google.com/docs/auth/web/github-auth
export const provider = new GithubAuthProvider()
// https://docs.github.com/en/developers/apps/building-oauth-apps/scopes-for-oauth-apps#available-scopes
provider.addScope('read:user,user:email,user:follow')

export const authInitAsync = createAsyncThunk('auth/init', async (args: any, { getState }) => new Promise<{}>((resolve) => setTimeout(() => resolve({}), 200)))
export const signOutAsync = createAsyncThunk('auth/signOut', async (args: any, { getState }) => signOut(fireauth))

export const signInAsync = createAsyncThunk(
  'auth/signInWithPopup',
  async ({ redirectTo }: { redirectTo: string }, { getState }) => {
    const state = getState() as RootState
    if (!state.auth.isAuthenticated) {
      provider.setCustomParameters({ redirectTo })
      const result = await signInWithPopup(fireauth, provider)
      // const credential = GithubAuthProvider.credentialFromResult(result)
      return {
        user: {
          uid: result.user.uid,
          displayName: result.user.displayName,
          email: result.user.email,
          photoURL: result.user.photoURL,
          providerId: result.user.providerId,
          emailVerified: result.user.emailVerified,
        },
        // credential
      }
    }
  }
)


export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authStateChange: (state, action: PayloadAction<{ user: AppUser }>) => {
      state.isAuthenticated = !!action.payload.user
      if (action.payload.user) {
        state.user = action.payload.user
      }
    }
  }, extraReducers: (builder) => {
    builder
      .addCase(signInAsync.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(signInAsync.fulfilled, (state, action) => {
        state.status = 'idle'
        if (action.payload) {
          state.isAuthenticated = !!action.payload.user
          // state.credential = action.payload.credential
          state.user = action.payload.user
        }
        // if (action.payload) {
        //   state.user = action.payload.user
        //   if (action.payload.credential) {
        //     state.credential = action.payload.credential
        //   }
        // }
      })
      .addCase(signInAsync.rejected, (state) => {
        state.status = 'failed'
        // state.isAuthenticated = false
        // state.user = null
      }).addCase(authInitAsync.pending, (state, action) => {
        state.initStatus = 'loading'
      }).addCase(authInitAsync.fulfilled, (state, action) => {
        state.initStatus = 'idle'
      }).addCase(authInitAsync.rejected, (state, action) => {
        state.initStatus = 'failed'
      }).addCase(signOutAsync.pending, (state, action) => {
        state.status = 'loading'
      }).addCase(signOutAsync.fulfilled, (state, action) => {
        state.status = 'idle'
      }).addCase(signOutAsync.rejected, (state, action) => {
        state.status = 'failed'
      })
  },
})
export const selectAuthUser = (state: RootState) => state.auth.user
export const selectIsAuth = (state: RootState) => state.auth.isAuthenticated
export const selectAuthInitStatus = (state: RootState) => state.auth.initStatus
export const { authStateChange } = authSlice.actions
export default authSlice.reducer