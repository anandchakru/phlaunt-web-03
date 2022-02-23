import { RootState } from '../../app/store'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { AppCredential } from '../auth/AuthSlice'
import { Octokit } from '@octokit/core'
const { createPullRequest } = require("octokit-plugin-create-pull-request")

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

export interface UpdateRepoHomepageInfo {
  data?: any
}
export interface AlbumRemoteInfo { // https://docs.github.com/en/rest/reference/repos
  pr?: PullRequestInfo
  repo?: CreateRepoInfo
  merge?: PullRequestInfo
  ghPages?: GhPagesInfo
  repoUpdateHomepage?: UpdateRepoHomepageInfo
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
  albumRemoteInfo?: AlbumRemoteInfo
  albumGhPageImages?: GhPageImageInfo
}

const initialState: AlbumState = {
  status: 'idle',
}

export const upsertAlbumAsync = createAsyncThunk(
  'album/upsert', async ({ repoName, description, images }: { repoName: string, description?: string, images: { [x: number]: AppImageBlob } }, { getState }) => {
    const state = getState() as RootState
    if (state.auth.isAuthenticated) {
      const { accessToken, ghuser } = state.auth.credential as AppCredential
      const album = state.album.albumRemoteInfo as AlbumRemoteInfo
      const octokit = new AppOctokit({ auth: accessToken })
      console.log(`creating repo with: ${repoName}`)
      let repo = album && album.repo as any
      if (!repo) {
        repo = await octokit.request("POST /user/repos", {
          repoName,
          ...description && { description },
          auto_init: true,
          // delete_branch_on_merge: true,
          // has_downloads: false,
          // private: false,
        })
        await waitFor(1000)
      }
      if (repo && repo.data && repo.data.name && ghuser
        && repo.data.owner && repo.data.owner.login
        && repo.data.owner.login === ghuser && images) {
        const keys = Object.keys(images)
        const req = {
          owner: ghuser,
          repo: repo.data.name,
          title: "Adding album images",
          body: `Adding ${keys.length} images to album`,
          head: `my-branch-${Date.now()}`,
          changes: [{
            files: keys.reduce((acc, key) => ({ ...acc, [`public/img/${images[key].name}`]: { content: images[key].b64, encoding: 'base64' } }), {}),
            commit: `Adding ${keys.length} images to album`,
          }]
        }
        const pr = await octokit.createPullRequest(req)// https://github.com/gr2m/octokit-plugin-create-pull-request
        // Merge PR 
        let merge = {}
        if (pr.data && pr.data.number) {
          const approvePrUrl = `PUT /repos/${ghuser}/${repoName}/pulls/${pr.data.number}/merge`
          merge = await octokit.request(approvePrUrl, {
            merge_method: 'squash',
          })
        }
        // enable gh-pages
        const ghPages = await octokit.request(`POST /repos/${ghuser}/${repoName}/pages`, {
          source: {
            branch: 'main',
          }
        })
        // update description
        let repoUpdateHomepage = {}
        if (ghPages && ghPages.data && ghPages.data.html_url) {
          repoUpdateHomepage = await octokit.request(`PATCH /repos/${ghuser}/${repoName}`, {
            homepage: ghPages.data.html_url
          })
        }
        // TODO: update DEFAULT_GALLERY_REPO with {cover, name, count, url}
        // const gallery = state.gallery.gallery?.galleryInfo as GalleryRepoInfo

        return { pr, repo, merge, ghPages, repoUpdateHomepage }
      }
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

export const albumSlice = createSlice({
  name: 'album',
  initialState,
  reducers: {
  }, extraReducers: (builder) => {
    builder
      .addCase(upsertAlbumAsync.pending, (state) => {
        state.status = 'loading'
      }).addCase(upsertAlbumAsync.fulfilled, (state, action) => {
        state.status = 'idle'
        if (action.payload) {
          state.albumRemoteInfo = action.payload
        }
      }).addCase(upsertAlbumAsync.rejected, (state) => {
        state.status = 'idle'
      }).addCase(fetchAlbumAsync.pending, (state) => {
        state.status = 'loading'
      }).addCase(fetchAlbumAsync.fulfilled, (state, action) => {
        state.status = 'idle'
        state.albumGhPageImages = action.payload
      }).addCase(fetchAlbumAsync.rejected, (state) => {
        state.status = 'idle'
      })
  }
})

export default albumSlice.reducer
export const selectAlbum = (state: RootState) => state.album.albumRemoteInfo
export const selectAlbumStatus = (state: RootState) => state.album.status
export const selectAlbumGhPageImages = (state: RootState) => state.album.albumGhPageImages
export const AppOctokit = Octokit.plugin(createPullRequest)
