import { Card, CardActionArea, CardContent, CardMedia, Grid, Typography } from '@mui/material'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '../../app/hooks'
import { selectGalleryMeta } from './GallerySlice'

function Gallery() {
  const navigate = useNavigate()
  const galleryMeta = useAppSelector(selectGalleryMeta)
  return (
    <>
      <Typography variant="h3" component="div">
        Gallery
      </Typography>
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