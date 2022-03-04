import { RootState } from '../../app/store'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { AppCredential } from '../auth/AuthSlice'
import { addImagesToAlbum, AppOctokit, CreateAlbumResponse, createAlbumWithImages } from '../../app/github'

export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
export interface AppImageBlob {
  key: number
  name: string
  blob: Blob
  b64: string
  index: number
  selected: boolean
}
export interface PullRequestInfo {
  data?: any
}
export interface CreateRepoInfo {
  data?: any
  // id: number
  // name: string
  // description: string | null
  // url: string
  // html_url: string
  // contents_url: string
}

export interface PullRequestInfo {
  data?: any
}
export interface GhPagesInfo {
  data?: any
}

export interface MetaInfo {
  data?: any
}
export interface AlbumRemoteInfo { // https://docs.github.com/en/rest/reference/repos
  pr?: PullRequestInfo
  repo?: CreateRepoInfo
  merge?: PullRequestInfo
  ghPages?: GhPagesInfo
  meta?: MetaInfo
}

export interface ImgInfo {
  name: string
  path: string
  sha: string
  size: number
  url: string
  html_url: string
  git_url: string
  download_url: string
  type: string
}
export interface GhPageImageInfo {
  img: ImgInfo[]
  repoInfo: CreateRepoInfo
}
export interface AlbumState {
  status: 'idle' | 'loading' | 'failed'
  albumRemoteInfo?: CreateAlbumResponse
  albumGhPageImages?: GhPageImageInfo
}

const initialState: AlbumState = {
  status: 'idle',
}

export const createAlbumAsync = createAsyncThunk(
  'album/create', async ({ repoName, albumName, images }: { repoName: string, albumName: string, images: { [x: number]: AppImageBlob } }, { getState }) => {
    const state = getState() as RootState
    const { accessToken, ghuser } = state.auth.credential as AppCredential
    if (state.auth.isAuthenticated && accessToken && ghuser) {
      return createAlbumWithImages(ghuser, accessToken, repoName, albumName, images)
    }
  }
)

export const fetchAlbumAsync = createAsyncThunk(
  'album/fetch', async ({ name, owner }: { name: string, owner: string }, { getState }) => {
    const state = getState() as RootState
    if (state.auth.isAuthenticated) {
      const { accessToken } = state.auth.credential as AppCredential
      const octokit = new AppOctokit({ auth: accessToken })
      const repo = await octokit.request(`GET /repos/${owner}/${name}`)
      const result = await octokit.request(`GET /repos/${owner}/${name}/contents/public/img`)
      return { img: result.data, repoInfo: repo }
    }
  }
)

export const addImagesToAlbumAsync = createAsyncThunk(
  'album/addImg', async ({ repoName, images, owner, albumName }: { repoName: string, images: { [x: number]: AppImageBlob }, albumName: string, owner: string }, { getState }) => {
    const state = getState() as RootState
    if (state.auth.isAuthenticated) {
      const { accessToken, ghuser } = state.auth.credential as AppCredential
      if (accessToken) {
        return await addImagesToAlbum(ghuser, accessToken, repoName, albumName, images, owner)
      }
    }
  }
)
export const albumSlice = createSlice({
  name: 'album',
  initialState,
  reducers: {
  }, extraReducers: (builder) => {
    builder
      .addCase(createAlbumAsync.pending, (state) => {
        state.status = 'loading'
      }).addCase(createAlbumAsync.fulfilled, (state, action) => {
        state.status = 'idle'
        if (action.payload) {
          state.albumRemoteInfo = action.payload as any
        }
      }).addCase(createAlbumAsync.rejected, (state) => {
        state.status = 'idle'
      }).addCase(fetchAlbumAsync.pending, (state) => {
        state.status = 'loading'
      }).addCase(fetchAlbumAsync.fulfilled, (state, action) => {
        state.status = 'idle'
        state.albumGhPageImages = action.payload
      }).addCase(fetchAlbumAsync.rejected, (state) => {
        state.status = 'idle'
      }).addCase(addImagesToAlbumAsync.pending, (state) => {
        state.status = 'loading'
      }).addCase(addImagesToAlbumAsync.fulfilled, (state, action) => {
        state.status = 'idle'
        if (action.payload) {
          // TODO: Update state.albumRemoteInfo
          // state.albumRemoteInfo = action.payload
        }
      }).addCase(addImagesToAlbumAsync.rejected, (state) => {
        state.status = 'idle'
      })
  }
})

export default albumSlice.reducer
export const selectAlbum = (state: RootState) => state.album.albumRemoteInfo
export const selectAlbumStatus = (state: RootState) => state.album.status
export const selectAlbumGhPageImages = (state: RootState) => state.album.albumGhPageImages
