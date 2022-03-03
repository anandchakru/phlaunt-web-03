import { Octokit } from "@octokit/core"
import axios, { AxiosResponse } from 'axios'
import { AppImageBlob } from "../features/album/AlbumSlice"
import { createPullRequest } from "../createPullRequest"
// const { createPullRequest } = require("octokit-plugin-create-pull-request")

const AppOctokit = Octokit.plugin(createPullRequest)
const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
const DEFAULT_GALLERY_REPO = 'pk-meta'

interface CreateGalleryResponse {
  galleryGhInfo?: any,
  pullReqGhInfo?: any,
  mergeGhInfo?: any,
  ghPagesGhInfo?: any,
  error?: any,
  data: []
}
export interface CreateAlbumResponse {
  albumGhInfo?: any,
  pullReqGhInfo?: any,
  mergeGhInfo?: any,
  updateGalleryGhInfo?: any,
  ghPagesGhInfo?: any,
  error?: any,
}
interface AddImagesToAlbumResponse {
  pullReqGhInfo?: any,
  mergeGhInfo?: any,
  error?: any,
}

interface UpdateGalleryResponse {
  galleryGhInfo?: any,
}
/**
 * Get content of phlaunt-meta/meta/gallery.json
 * If it doesn't exists, create it and return []
 * 
 * @param ghUser The logged in github user
 * @param accessToken The access token for the logged in user on github
 * @returns Response from the github api.
 */

const getGalleryMeta = (ghUser: string, accessToken: string) => new Promise<AxiosResponse | CreateGalleryResponse>(async (resolve, reject) => {
  try {
    const response = await axios.get(`https://${ghUser}.github.io/${DEFAULT_GALLERY_REPO}/meta/gallery.json`)
    resolve({ data: response.data })
  } catch (errorOnGet) {
    try {
      resolve(await createGalleryMeta(ghUser, accessToken))
    } catch (errorOnCreate) {
      reject({ errorOnGet, errorOnCreate })
    }
  }
})

const updateGalleryMeta = (ghUser: string, accessToken: string, repoName: string, cover: string, name: string, count: number, uri: string) => new Promise<UpdateGalleryResponse>(async (resolve, reject) => {
  let response = {}
  try {
    const octokit = new AppOctokit({ auth: accessToken })
    const galleryMeta = await getGalleryMeta(ghUser, accessToken)
    const gallery = galleryMeta.data as Array<{ name: string, cover: string, count: number, uri: string }>

    const existing = gallery.findIndex(album => album.uri === uri)

    const updatedGallery = gallery.map((album, index) => {
      if (existing === index) {
        return album
      } else {
        return { ...album, cover, name, count: (Number(album.count) + Number(count)) }
      }
    })
    const { data: { sha } } = await octokit.request(`GET /repos/${ghUser}/${DEFAULT_GALLERY_REPO}/contents/meta/gallery.json`);
    const galleryGhInfo = await octokit.request(`PUT /repos/${ghUser}/${DEFAULT_GALLERY_REPO}/contents/meta/gallery.json`, {
      message: `Adding ${repoName} to gallery.json`,
      content: btoa(JSON.stringify(updatedGallery)),
      sha,
    })
    response = { ...response, galleryGhInfo }
    resolve(response)
  } catch (error) {
    reject(error)
  }
})

/**
 * Checks if a repo exists, retruns true if it does
 * 
 * @param ghUser The logged in github user
 * @param accessToken The access token for the logged in user on github
 * @param repoName Name of the repo to check
 * @returns 
 */
const isRepoExists = (ghUser: string, accessToken: string, repoName: string) => new Promise<boolean>(async (resolve, reject) => {
  try {
    const octokit = new AppOctokit({ auth: accessToken })
    const existsGhInfo = await octokit.request(`GET /repos/${ghUser}/${repoName}`)
    if (existsGhInfo.data && existsGhInfo.data.id) {
      resolve(true)
    } else {
      resolve(false)
    }
  } catch (error) {
    resolve(false)
  }
})


/**
 * Create repo with phlaunt-meta/meta/gallery.json
 * If it already exists throws error `GalleryMeta exists`
 * 
 * @param ghUser The logged in github user
 * @param accessToken The access token for the logged in user on github
 * @returns Response from the github api on with {galleryGhInfo, pullReqGhInfo, mergeGhInfo, ghPagesGhInfo}.
 */
const createGalleryMeta = (ghUser: string, accessToken: string) => new Promise<CreateGalleryResponse>(async (resolve, reject) => {
  let response = {}
  if (await isRepoExists(ghUser, accessToken, DEFAULT_GALLERY_REPO)) reject({ code: `repo exists`, description: `GalleryMeta exists` })
  try {
    const octokit = new AppOctokit({ auth: accessToken })
    // Create phlaunt-meta repo
    const galleryGhInfo = await octokit.request("POST /user/repos", {
      name: DEFAULT_GALLERY_REPO,
      auto_init: true,
      description: `This repo holds all the required meta-data for phlaunt gallery`,
      homepage: `https://${ghUser}.github.io/${DEFAULT_GALLERY_REPO}/`,
    })
    await waitFor(1000)
    response = { ...response, galleryGhInfo }

    // Add empty gallery.json file
    const pullReqGhInfo = await octokit.createPullRequest({
      owner: ghUser,
      repo: DEFAULT_GALLERY_REPO,
      title: `Add empty gallery.json`,
      body: `Add  first time gallery.json`,
      head: `my-branch-${Date.now()}`,
      changes: [{
        files: {
          "meta/gallery.json": {
            content: btoa(`[]`),
            encoding: 'base64',
          }
        },
        commit: `gallery.json`,
      }]
    })
    response = { ...response, pullReqGhInfo }

    // Merge Pull Request
    let mergeGhInfo = {}
    if (pullReqGhInfo?.data && pullReqGhInfo.data.number) {
      const approvePrUrl = `PUT /repos/${ghUser}/${DEFAULT_GALLERY_REPO}/pulls/${pullReqGhInfo.data.number}/merge`
      mergeGhInfo = await octokit.request(approvePrUrl, {
        merge_method: 'squash',
      })
    }
    response = { ...response, mergeGhInfo }

    // Enable gh-pages on main branch
    const ghPagesGhInfo = await octokit.request(`POST /repos/${ghUser}/${DEFAULT_GALLERY_REPO}/pages`, {
      source: { branch: 'main', }
    })
    response = { ...response, ghPagesGhInfo }
    resolve({ ...response, data: [] })
  } catch (error) {
    console.log(error)
    reject({ ...response, error })
  }
})

const createAlbumWithImages = (ghUser: string, accessToken: string, repoName: string, albumName: string, images: { [x: number]: AppImageBlob }) => new Promise<CreateAlbumResponse>(async (resolve, reject) => {
  let response = {}
  if (await isRepoExists(ghUser, accessToken, repoName)) reject({ code: `repo exists`, description: `GalleryMeta exists` })
  try {
    const octokit = new AppOctokit({ auth: accessToken })
    // Create phlaunt-meta repo
    const albumGhInfo = await octokit.request("POST /user/repos", {
      name: repoName,
      auto_init: true,
      description: albumName,
      homepage: `https://${ghUser}.github.io/${repoName}/`,
    })
    await waitFor(500)
    response = { ...response, albumGhInfo }

    // Add images
    const keys = images ? Object.keys(images) : []
    if (keys.length > 0) {
      const pullReqGhInfo = await octokit.createPullRequest({
        owner: ghUser,
        repo: repoName,
        title: "Adding album images",
        body: `Adding ${keys.length} images to album`,
        head: `my-branch-${Date.now()}`,
        changes: [{
          files: keys.reduce((acc, key) => ({ ...acc, [`public/img/${images[key].name}`]: { content: images[key].b64, encoding: 'base64' } }), {}),
          commit: `Adding ${keys.length} images to album`,
        }]
      })
      response = { ...response, pullReqGhInfo }

      // Merge Pull Request
      let mergeGhInfo = {}
      if (pullReqGhInfo?.data && pullReqGhInfo.data.number) {
        const approvePrUrl = `PUT /repos/${ghUser}/${repoName}/pulls/${pullReqGhInfo.data.number}/merge`
        mergeGhInfo = await octokit.request(approvePrUrl, {
          merge_method: 'squash',
        })
      }
      response = { ...response, mergeGhInfo }

      // Update gallery.json
      const cover = `https://${ghUser}.github.io/${repoName}/public/img/${images[keys[0]].name}`
      const uri = `/album/${repoName}`
      const count = keys.length
      const updateGalleryGhInfo = await updateGalleryMeta(ghUser, accessToken, repoName, cover, albumName, count, uri)
      response = { ...response, updateGalleryGhInfo }
    }
    // Enable gh-pages on main branch
    const ghPagesGhInfo = await octokit.request(`POST /repos/${ghUser}/${repoName}/pages`, {
      source: { branch: 'main', }
    })
    response = { ...response, ghPagesGhInfo }

    resolve({ ...response })
  } catch (error) {
    console.log(error)
    reject({ ...response, error })
  }
})

const addImagesToAlbum = (ghUser: string, accessToken: string, repoName: string, albumName: string, images: { [x: number]: AppImageBlob }, owner?: string) => new Promise<AddImagesToAlbumResponse>(async (resolve, reject) => {
  let response = {}
  try {
    const octokit = new AppOctokit({ auth: accessToken })
    // Add images
    const keys = images ? Object.keys(images) : []
    if (keys.length > 0) {
      const pullReqGhInfo = await octokit.createPullRequest({
        owner: owner ? owner : ghUser,
        repo: repoName,
        title: "Adding album images",
        body: `Adding ${keys.length} images to album`,
        head: `my-branch-${Date.now()}`,
        changes: [{
          files: keys.reduce((acc, key) => ({ ...acc, [`public/img/${images[key].name}`]: { content: images[key].b64, encoding: 'base64' } }), {}),
          commit: `Adding ${keys.length} images to album`,
        }]
      })
      response = { ...response, pullReqGhInfo }

      if (!owner || ghUser === owner) {
        // Merge Pull Request
        let mergeGhInfo = {}
        if (pullReqGhInfo?.data && pullReqGhInfo.data.number) {
          const approvePrUrl = `PUT /repos/${ghUser}/${repoName}/pulls/${pullReqGhInfo.data.number}/merge`
          mergeGhInfo = await octokit.request(approvePrUrl, {
            merge_method: 'squash',
          })
        }
        response = { ...response, mergeGhInfo }

        // Update gallery.json
        const cover = `https://${ghUser}.github.io/${repoName}/public/img/${images[keys[0]].name}`
        const uri = `/album/${repoName}`
        const count = keys.length
        const updateGalleryGhInfo = await updateGalleryMeta(ghUser, accessToken, repoName, cover, albumName, count, uri)
        response = { ...response, updateGalleryGhInfo }
      }
    }
    resolve(response)
  } catch (error) {
    console.log(error)
    reject({ ...response, error })
  }
})
export {
  getGalleryMeta, createGalleryMeta, createAlbumWithImages, addImagesToAlbum,
  AppOctokit, waitFor, DEFAULT_GALLERY_REPO
}