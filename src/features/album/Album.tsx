import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
// import { Box } from '@mui/material'
import { fetchAlbumAsync, GhPageImageInfo, selectAlbumGhPageImages } from './AlbumSlice'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { Card, CardActionArea, CardContent, CardMedia, Grid, Typography } from '@mui/material'

function PreviewImgs(props: any) {
  const images: any = props.files
  const base: string = props.base
  return (
    <Grid container rowSpacing={4} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
      {images.map((image, index) => <Grid key={index} item xs={6} sm={4} md={3} lg={2}><Card sx={{ maxWidth: 100, }}>
        <CardActionArea>
          <CardMedia component="img" height="100" sx={{ objectFit: 'cover' }} image={base + image.path} alt={image.name} />
          <CardContent>
            <Typography variant="h5" component="span" sx={{ fontSize: `0.5rem` }}>
              {image.name}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card></Grid>)}
    </Grid>
  )
}

function Album() {
  const albumGhPageImages = useAppSelector(selectAlbumGhPageImages)
  const { albumId } = useParams()
  const dispatch = useAppDispatch()
  useEffect(() => {
    if (albumId) {
      dispatch(fetchAlbumAsync({ owner: 'anandchakru', name: albumId }))
      console.log(`Album component loaded with albumid:${albumId}`)
    }
  }, [albumId, dispatch])
  return (
    <div>
      Album
      <pre>{albumId}</pre>
      <PreviewImgs files={albumGhPageImages?.img} base={albumGhPageImages?.repoInfo.data.homepage} />
    </div>
  )
}

export default Album