import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
// import { Box } from '@mui/material'
import { fetchAlbumAsync, selectAlbumGhPageImages } from './AlbumSlice'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { Card, CardActionArea, CardContent, CardMedia, Grid, Typography } from '@mui/material'

function PreviewImgs(props: any) {
  const images: any = props.files
  const base: string = props.base
  return (
    <Grid container rowSpacing={4} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
      {images && images.map((image, index) => <Grid key={index} item xs={6} sm={4} md={3} lg={2}><Card sx={{ maxWidth: 250, }}>
        <CardActionArea>
          <CardMedia component="img" height="250" sx={{ objectFit: 'cover' }} image={base + image.path} alt={image.name} />
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              {image.name}
            </Typography>
            <Typography variant="caption" display="block" color="text.secondary">
              {Math.floor(image.size / 1000)} KB
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
    }
  }, [albumId, dispatch])
  return (
    <div>
      <Typography variant="h4">
        {albumId}
      </Typography>
      <Typography mb={5} variant="caption" display="block" color="text.secondary">
        <a href={albumGhPageImages?.repoInfo.data?.owner.html_url}>
          By {albumGhPageImages?.repoInfo.data?.owner.login}
        </a>
      </Typography>
      <PreviewImgs files={albumGhPageImages?.img} base={albumGhPageImages?.repoInfo.data.homepage} />
    </div>
  )
}

export default Album