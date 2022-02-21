import { RootState } from '../../app/store'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { AppCredential } from '../auth/AuthSlice'
import { Octokit } from '@octokit/core'
const { createPullRequest } = require("octokit-plugin-create-pull-request");

export interface AppImageBlob {
  key: number
  name: string
  blob: Blob
  b64: string
  index: number
  selected: boolean
}
export interface PullRequestInfo {
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

export interface Album { // https://docs.github.com/en/rest/reference/repos
  pr?: PullRequestInfo
  repo?: CreateRepoInfo
}
export interface AlbumState {
  status: 'idle' | 'loading' | 'failed'
  album?: Album
}

const initialState: AlbumState = {
  status: 'idle',
}

export const createAlbumAsync = createAsyncThunk(
  'album/create',
  async ({ name, description, images }: { name: string, description?: string, images: { [x: number]: AppImageBlob } }, { getState }) => {
    const state = getState() as RootState
    if (state.auth.isAuthenticated) {
      const { accessToken } = state.auth.credential as AppCredential
      const album = state.album.album as Album
      const AppOctokit = Octokit.plugin(createPullRequest)
      const octokit = new AppOctokit({ auth: accessToken })
      console.log(`creating repo with: ${name}`)
      let result = album && album.repo as any
      if (!result) {
        result = await octokit.request("POST /user/repos", {
          name,
          ...description && { description },
          auto_init: true,
          // delete_branch_on_merge: true,
          // has_downloads: false,
          // private: false,
        })
      }
      if (result && result.data && result.data.name && result.data.owner && result.data.owner.login && images) {
        const keys = Object.keys(images)
        const req = {
          owner: result.data.owner.login,
          repo: result.data.name,
          title: "Adding album images",
          body: `Adding ${keys.length} images to album`,
          head: `my-branch-${Date.now()}`,
          changes: [{
            files: keys.reduce((acc, key) => ({ ...acc, [images[key].name]: { content: images[key].b64, encoding: 'base64' } }), {}),
            commit: `Adding ${keys.length} images to album`,
          }]
        }
        const pullRequest = await octokit.createPullRequest(req)// https://github.com/gr2m/octokit-plugin-create-pull-request
        return { pr: { ...pullRequest }, repo: { ...result } }
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
          state.album = action.payload
        }
      }).addCase(createAlbumAsync.rejected, (state) => {
        state.status = 'idle'
      })
  }
})

export default albumSlice.reducer
export const selectAlbum = (state: RootState) => state.album.album
