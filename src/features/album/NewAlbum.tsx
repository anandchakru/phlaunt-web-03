import React, { useState } from 'react'
import { Backdrop, Box, Button, Card, CardActionArea, CardContent, CardMedia, CircularProgress, Grid, TextField, Typography } from '@mui/material'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { AppImageBlob, upsertAlbumAsync, selectAlbum } from './AlbumSlice'
import { compress } from './compress'

function PreviewImgs(props: any) {
  const files: { [x: number]: AppImageBlob } = props.files
  return (
    <Grid container rowSpacing={4} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
      {Object.keys(files).map((file: string, index: number) => <Grid key={index} item xs={6} sm={4} md={3} lg={2}><Card sx={{ maxWidth: 100, }}>
        <CardActionArea>
          <CardMedia component="img" height="100" sx={{ objectFit: 'cover' }} image={URL.createObjectURL(files[file].blob)} alt={files[file].name} />
          <CardContent>
            <Typography variant="h5" component="span" sx={{ fontSize: `0.5rem` }}>
              {files[file].name}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card></Grid>)}
    </Grid>
  )
}
function NewAlbum() {
  const genNewAlbumName = (len: number = 5, charSet: string = 'bcdfghjkmnpqrstvwxyzBCDFGHJKMNPQRSTVWXYZ0123456789') => {
    // https://stackoverflow.com/a/19964557/234110
    const charlen = charSet.length
    return Array.apply(null, Array(len)).map(() => charSet.charAt(Math.floor(Math.random() * charlen))).join('')
  }
  const genRepoName = () => {
    const dt = new Date()
    return `pk${dt.getFullYear()}${("0" + (dt.getMonth() + 1)).slice(-2)}${("0" + dt.getDate()).slice(-2)}${albumName.toLocaleLowerCase().replace(/[^a-z0-9]+/g, '_')}`
  }

  const dispatch = useAppDispatch()
  const album = useAppSelector(selectAlbum)
  const [images, setImages] = useState<{ [x: number]: AppImageBlob }>({})
  const [compressing, setCompressing] = useState<boolean>(false)
  const [albumName, setAlbumName] = useState<string>(album?.repo?.data?.name ? album?.repo?.data?.name : genNewAlbumName())

  return (
    <div>
      <Box mb={10}>
        <TextField fullWidth id="standard-basic" variant="standard" defaultValue={albumName} onChange={(e) => {
          setAlbumName(e.target.value)
        }} onFocus={event => event.target.select()} />
      </Box>
      <Box mt={10}>
        <Backdrop sx={{ backgroundColor: '#ffffffee', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={compressing}>
          {compressing && <CircularProgress />}
        </Backdrop>
        <PreviewImgs files={images} />
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
        {images && Object.keys(images).length > 0 && <Button sx={{}} variant="contained" color="primary" onClick={() => {
          dispatch(upsertAlbumAsync({ repoName: genRepoName(), albumName, images }))
        }} disabled={!albumName || albumName.length === 0}>Upload</Button>}
      </Box>
    </div>
  )
}

export default NewAlbum