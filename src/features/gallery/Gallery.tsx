import { AppBar, Box, Card, CardActionArea, CardContent, CardMedia, Grid, IconButton, Toolbar, Typography } from '@mui/material'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '../../app/hooks'
import { fetchGalleryAsync, selectGalleryMeta } from './GallerySlice'
import RefreshIcon from '@mui/icons-material/Refresh'
import { useDispatch } from 'react-redux'

function Gallery() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const galleryMeta = useAppSelector(selectGalleryMeta)
  return (
    <>
      <AppBar position='relative' color="default" sx={{ marginBottom: '24px' }}>
        <Toolbar disableGutters>
          <IconButton size="large" aria-label="account of current user" aria-controls="gallery-appbar" aria-haspopup="true"
            onClick={() => dispatch(fetchGalleryAsync(''))} color="inherit" >
            <RefreshIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h5" component="div">
              Gallery
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>
      <Grid container rowSpacing={4} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
        {galleryMeta?.map((image, index) => <Grid key={index} item xs={6} sm={4} md={3} lg={2}>
          <Card sx={{ maxWidth: 250, }}>
            <CardActionArea onClick={() => navigate(image?.uri)}>
              <CardMedia component="img" height="250" sx={{ objectFit: 'cover' }} image={image.cover} alt={image.name} />
              <CardContent>
                <Typography variant="body2">
                  {image.name}
                </Typography>
                <Typography variant="caption" display="block" color="text.secondary">
                  {image.count} items
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>)}
      </Grid>
    </>
  )
}

export default Gallery