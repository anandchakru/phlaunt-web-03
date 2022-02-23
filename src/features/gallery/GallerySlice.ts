import { RootState } from '../../app/store'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { AppCredential } from '../auth/AuthSlice'
import { AppOctokit } from '../album/AlbumSlice';
import axios from 'axios';

export const DEFAULT_GALLERY_REPO = 'phlaunt-meta'

export interface GalleryRepoInfo {
  data?: any
}

export interface GalleryInfo { // https://docs.github.com/en/rest/reference/repos
  galleryInfo?: GalleryRepoInfo
}

export interface GalleryMeta {
  cover: string
  name: string
  count: number
  uri: string
}
export interface GalleryState {
  status: 'idle' | 'loading' | 'failed'
  gallery?: GalleryInfo
  meta?: GalleryMeta[]
}

const initialState: GalleryState = {
  status: 'idle',
}

export const fetchGalleryAsync = createAsyncThunk(
  'gallery/fetch', async (nw: string, { getState }) => {
    const state = getState() as RootState
    const { accessToken, ghuser } = state.auth.credential as AppCredential
    if (accessToken && ghuser && !state.gallery.gallery) {
      const gallery = await axios.get(`https://${ghuser}.github.io/${DEFAULT_GALLERY_REPO}/meta/gallery.json`)
      // const octokit = new AppOctokit({ auth: accessToken })
      // const gallery = octokit.request(`GET /repos/${ghuser}/${DEFAULT_GALLERY_REPO}/contents/meta/gallery.json`)
      return gallery.data
    }
  }
)

export const upsertGalleryAsync = createAsyncThunk(
  'gallery/upsert', async ({ owner }: { owner: string }, { getState }) => {
    const state = getState() as RootState
    if (state.auth.isAuthenticated) {
      const { accessToken } = state.auth.credential as AppCredential
      const octokit = new AppOctokit({ auth: accessToken })
      const gallery = await octokit.request(`PUT /repos/${owner}/${DEFAULT_GALLERY_REPO}/contents/meta/gallery.json`)
      return { galleryInfo: gallery.data }
    }
  }
)

export const gallerySlice = createSlice({
  name: 'gallery',
  initialState,
  reducers: {
  }, extraReducers: (builder) => {
    builder
      .addCase(fetchGalleryAsync.pending, (state) => {
        state.status = 'loading'
      }).addCase(fetchGalleryAsync.fulfilled, (state, action) => {
        state.status = 'idle'
        if (action.payload) {
          state.meta = action.payload
        }
      }).addCase(fetchGalleryAsync.rejected, (state) => {
        state.status = 'idle'
      }).addCase(upsertGalleryAsync.pending, (state) => {
        state.status = 'loading'
      }).addCase(upsertGalleryAsync.fulfilled, (state, action) => {
        state.status = 'idle'
        state.gallery = action.payload
      }).addCase(upsertGalleryAsync.rejected, (state) => {
        state.status = 'idle'
      })
  }
})

export default gallerySlice.reducer
export const selectGalleryMeta = (state: RootState) => state.gallery.meta
// export const {  } = gallerySlice.actions