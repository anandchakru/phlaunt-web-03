import { RootState } from '../../app/store'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { AppCredential } from '../auth/AuthSlice'
import { getGalleryMeta } from '../../app/github'

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
    if (state.auth.credential) {
      const { accessToken, ghuser } = state.auth.credential as AppCredential
      if (accessToken && ghuser && !state.gallery.gallery) {
        return getGalleryMeta(ghuser, accessToken)
      }
    }
  }
)

// export const upsertGalleryAsync = createAsyncThunk(
//   'gallery/upsert', async ({ owner }: { owner: string }, { getState }) => {
//     const state = getState() as RootState
//     if (state.auth.isAuthenticated) {
//       const { accessToken } = state.auth.credential as AppCredential
//       const octokit = new AppOctokit({ auth: accessToken })
//       const gallery = await octokit.request(`PUT /repos/${owner}/${DEFAULT_GALLERY_REPO}/contents/meta/gallery.json`)
//       return { galleryInfo: gallery.data }
//     }
//   }
// )

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
          state.meta = action.payload.data
        }
      }).addCase(fetchGalleryAsync.rejected, (state) => {
        state.status = 'idle'
      })/*.addCase(upsertGalleryAsync.pending, (state) => {
        state.status = 'loading'
      }).addCase(upsertGalleryAsync.fulfilled, (state, action) => {
        state.status = 'idle'
        state.gallery = action.payload
      }).addCase(upsertGalleryAsync.rejected, (state) => {
        state.status = 'idle'
      })*/
  }
})

export default gallerySlice.reducer
export const selectGalleryMeta = (state: RootState) => state.gallery.meta
export const selectGalleryStatus = (state: RootState) => state.gallery.status

// export const {  } = gallerySlice.actions