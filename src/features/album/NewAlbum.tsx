import React, { useState } from 'react'
import { Backdrop, Box, Button, CircularProgress, TextField } from '@mui/material'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { AppImageBlob, createAlbumAsync, selectAlbum } from './AlbumSlice'
import { compress } from './compress'
import PreviewPickedImgsForUpload from './PreviewPickedImgsForUpload'
import { useNavigate } from 'react-router-dom'


function NewAlbum() {
  const genNewAlbumName = (len: number = 5, charSet: string = 'bcdfghjkmnpqrstvwxyzBCDFGHJKMNPQRSTVWXYZ') => {
    // https://stackoverflow.com/a/19964557/234110
    const charlen = charSet.length
    return Array.apply(null, Array(len)).map(() => charSet.charAt(Math.floor(Math.random() * charlen))).join('')
  }
  const genRepoName = () => {
    const dt = new Date()
    if (/^\d/.test(albumName)) { // https://stackoverflow.com/a/39736204/234110
      return `pk-${albumName.toLocaleLowerCase()}`
    } else {
      return `pk-${dt.getFullYear()}${("0" + (dt.getMonth() + 1)).slice(-2)}${("0" + dt.getDate()).slice(-2)}${albumName.toLocaleLowerCase().replace(/[^a-z0-9]+/g, '_')}`
    }
  }

  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const album = useAppSelector(selectAlbum)
  const [images, setImages] = useState<{ [x: number]: AppImageBlob }>({})
  const [compressing, setCompressing] = useState<boolean>(false)
  const [albumName, setAlbumName] = useState<string>(album?.albumGhInfo?.data?.name ? album?.albumGhInfo?.data?.name : genNewAlbumName())

  return (
    <>
      <Box mb={10}>
        <TextField fullWidth id="standard-basic" variant="standard" defaultValue={albumName} inputProps={{ maxLength: 80 }} onChange={(e) => {
          setAlbumName(e.target.value)
        }} onFocus={event => event.target.select()} />
      </Box>
      <Box mt={10}>
        <Backdrop sx={{ backgroundColor: '#ffffffee', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={compressing}>
          {compressing && <CircularProgress />}
        </Backdrop>
        <PreviewPickedImgsForUpload files={images} />
      </Box>
      <Box mt={10}>
        <input
          accept="image/jpeg"
          style={{ display: 'none' }}
          id="raised-button-file"
          multiple
          type="file"
          onChange={async (event) => {
            const elem = event.target as HTMLInputElement
            if (elem && elem.files) {
              const files = Array.from(elem.files)
              setCompressing(true)
              setImages(await compress(files))
              setCompressing(false)
            }
          }} />
        <label htmlFor="raised-button-file">
          <Button component="span" onClick={() => { }}>
            Pick
          </Button>
        </label>
        {images && Object.keys(images).length > 0 && <Button sx={{}} variant="contained" color="primary" onClick={async () => {
          await dispatch(createAlbumAsync({ repoName: genRepoName(), albumName, images }))
          setImages({})
          alert('Album created, it will take about a minute to see changes.')
          navigate('/gallery')
        }} disabled={!albumName || albumName.length === 0}>Upload</Button>}
      </Box>
    </>
  )
}

export default NewAlbum