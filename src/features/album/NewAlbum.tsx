import React, { useState } from 'react'
import { Backdrop, Box, Button, Card, CardActionArea, CardContent, CardMedia, CircularProgress, Grid, Typography } from '@mui/material'
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
  const dispatch = useAppDispatch()
  const album = useAppSelector(selectAlbum)
  // const [rawFiles, setRawFiles] = useState<File[]>([])
  const [images, setImages] = useState<{ [x: number]: AppImageBlob }>({})
  const [compressing, setCompressing] = useState<boolean>(false)
  return (
    <div>
      <Box mb={10}>
        <Typography variant="h3" component="div">
          {album ? album?.repo?.data?.name : 'New Album'}
        </Typography>
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
            // elem && elem.files && setRawFiles([...rawFiles, ...Array.from(elem.files)])
            // elem && elem.files && setImages(await compress([...Array.from(elem.files)]))
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
          dispatch(upsertAlbumAsync({ repoName: `pk_${Math.random().toString(36).slice(2)}`, images }))
        }}>Upload</Button>}
      </Box>
    </div>
  )
}

export default NewAlbum