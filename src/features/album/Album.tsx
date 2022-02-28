import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { fetchAlbumAsync, selectAlbumGhPageImages } from './AlbumSlice'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { Box, Card, CardActionArea, CardContent, CardMedia, Grid, SxProps, Typography } from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import Dialog from '@mui/material/Dialog'
import AddAPhotoIcon from './add_photo_alternate_black_24dp.svg'
const opaqueOnBlur = {
  opacity: 0.5,
  transitionProperty: 'opacity',
  transitionDelay: '0.1s',
  '&:hover': {
    opacity: 1,
    backgroundColor: '#33333344',
  }
} as SxProps
const fsButtonStyles = {
  ...opaqueOnBlur,
  position: 'absolute',
  top: 0,
  width: '35vw',
  height: '100vh',
  display: 'flex',
  alignItems: 'center',
  transitionProperty: 'opacity',
  transitionDelay: '0.1s',
  '&:hover': {
    opacity: 1,
    backgroundColor: '#33333344',
  }
} as SxProps

const FullscreenImage = ({ currentImage, base, setCurrentImage, next, prev }) => <Dialog onClose={() => setCurrentImage(-1)}
  open={(currentImage && currentImage.path !== undefined) ? true : false} fullScreen
  sx={{ backgroundColor: '#ffffffee', zIndex: (theme) => theme.zIndex.drawer + 1 }}>
  {currentImage && <Card>
    {prev >= 0 && <Box sx={{
      ...fsButtonStyles,
      left: 0,
    }} onClick={() => { setCurrentImage(prev) }}><ChevronLeftIcon /></Box>}
    <CardMedia component="img" sx={{ objectFit: 'contain', width: '100%', height: '100vh' }}
      onClick={() => { setCurrentImage(-1) }}
      image={base + currentImage.path} alt={'__' + currentImage.name} />
    {next && <Box sx={{
      ...fsButtonStyles,
      right: 0,
      justifyContent: 'flex-end',
    }} onClick={() => { setCurrentImage(next) }}><ChevronRightIcon /></Box>}
  </Card>}
</Dialog>

function Album() {
  const albumGhPageImages = useAppSelector(selectAlbumGhPageImages)
  const { albumId } = useParams()
  const dispatch = useAppDispatch()
  const [searchParams] = useSearchParams()
  const [currentImage, setCurrentImage] = useState<number>(searchParams && searchParams.get("image") ? parseInt(searchParams.get("image") as string) : -1)
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
      <Grid container rowSpacing={4} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
        {albumGhPageImages?.img && albumGhPageImages?.img.map((image, index) => <Grid key={index} item xs={6} sm={4} md={3} lg={2}><Card sx={{ maxWidth: 250, }}>
          <CardActionArea>
            <CardMedia component="img" height="250" sx={{ objectFit: 'cover' }} image={albumGhPageImages?.repoInfo.data.homepage + image.path} alt={image.name}
              onClick={() => {
                setCurrentImage(index)
              }} />
            <CardContent>
              <Typography variant="body2">
                {image.name}
              </Typography>
              <Typography variant="caption" display="block" color="text.secondary">
                {Math.floor(image.size / 1000)} KB
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
        </Grid>)}
        <Grid key="add_an_img" item xs={6} sm={4} md={3} lg={2}>
          <Card sx={{ maxWidth: 250, }}>
            <CardActionArea>
              <CardMedia component="img" height="250" src={AddAPhotoIcon} alt="Add an image" sx={{
                ...opaqueOnBlur,
              }}
                onClick={() => { alert('WIP') }} />
              <CardContent>
                <Typography variant="body2">
                  Pick images
                </Typography>
                <Typography variant="caption" display="block" color="text.secondary">
                  compresed before upload
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      </Grid>
      <FullscreenImage base={albumGhPageImages?.repoInfo.data.homepage}
        currentImage={albumGhPageImages?.img[currentImage]}
        prev={currentImage >= 0 ? currentImage - 1 : undefined}
        next={albumGhPageImages && currentImage < albumGhPageImages.img.length - 1 ? currentImage + 1 : undefined}
        setCurrentImage={setCurrentImage} />
    </div>
  )
}

export default Album