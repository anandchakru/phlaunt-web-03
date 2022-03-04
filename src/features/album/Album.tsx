import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { addImagesToAlbumAsync, AppImageBlob, fetchAlbumAsync, selectAlbumGhPageImages, selectAlbumStatus } from './AlbumSlice'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { Avatar, Box, Card, CardActionArea, CardContent, CardMedia, Backdrop, CircularProgress, Grid, IconButton, SxProps, Typography } from '@mui/material'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import Dialog from '@mui/material/Dialog'
import AddAPhotoIcon from './add_photo_alternate_black_24dp.svg'
import CloudUploadIcon from './cloud_upload_black_24dp.svg'
import { selectGhUser } from '../auth/AuthSlice'
import ShareIcon from '@mui/icons-material/Share'
import GitHubIcon from '@mui/icons-material/GitHub'
import { compress } from './compress'
const opacity5 = {
  opacity: 0.5,
  transitionProperty: 'opacity',
  transitionDelay: '0.1s',
}
const opaqueOnBlur = {
  ...opacity5,
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
  const status = useAppSelector(selectAlbumStatus)
  const { albumId, owner } = useParams()
  const dispatch = useAppDispatch()
  const [searchParams] = useSearchParams()
  const ghUser = useAppSelector(selectGhUser)
  const [currentImage, setCurrentImage] = useState<number>(searchParams && searchParams.get("image") ? parseInt(searchParams.get("image") as string) : -1)

  const [images, setImages] = useState<{ [x: number]: AppImageBlob }>({})
  const [compressing, setCompressing] = useState<boolean>(false)

  const navigate = useNavigate()
  useEffect(() => {
    if (albumId && ghUser) {
      dispatch(fetchAlbumAsync({ owner: owner ? owner : ghUser, name: albumId }))
    }
  }, [albumId, ghUser, owner, dispatch])
  return (
    <div>
      <Box mb={5}>
        <Typography variant="body2">{albumGhPageImages?.repoInfo.data?.description || albumId}</Typography>
        <IconButton aria-label="View on Github" color="primary"
          onClick={() => window.open(albumGhPageImages?.repoInfo.data?.html_url)}>
          <GitHubIcon />
        </IconButton>
        {(owner !== undefined && owner !== ghUser) ? <IconButton aria-label="View Owner on Github" color="primary"
          onClick={() => window.open(albumGhPageImages?.repoInfo.data?.owner.html_url)}>
          <Avatar sx={{ width: '24px', height: '24px' }} alt={albumGhPageImages?.repoInfo.data?.owner.html_url} src={albumGhPageImages?.repoInfo.data?.owner.avatar_url} />
        </IconButton> :
          <IconButton aria-label="share" disabled color="primary" onClick={() => window.open(window.location.href.replace('album/', 'album/' + ghUser + '/'))}>
            <ShareIcon />
            {/* Disabled for now, once copy to clipboard is figured out, will enable it */}
          </IconButton>}
      </Box>

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
              <label htmlFor="raised-button-file">
                <CardMedia component="img" height="250" src={AddAPhotoIcon} alt="Add an image" sx={{
                  ...opaqueOnBlur,
                  objectFit: 'contain',
                }}
                  onClick={() => { }} />
              </label>
              <CardContent>
                <Typography variant="body2">
                  Pick images
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
        {images && Object.keys(images).map((image, index) => <Grid key={index} item xs={6} sm={4} md={3} lg={2}><Card sx={{ maxWidth: 250, opacity: 0.5 }}>
          <CardActionArea>
            <CardMedia component="img" height="250" sx={{ objectFit: 'cover' }} image={URL.createObjectURL(images[image].blob)} alt={images[image].name}
              onClick={() => {
                setCurrentImage(index)
              }} />
            <CardContent>
              <Typography variant="body2">
                {images[image].name}
              </Typography>
              <Typography variant="caption" display="block" color="text.secondary">
                (upload pending)
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
        </Grid>)}
        {images && albumId && Object.keys(images).length > 0 && <>
          <Grid key="add_an_img" item xs={6} sm={4} md={3} lg={2}>
            <Card sx={{ maxWidth: 250, }}>
              <CardActionArea>
                <CardMedia component="img" height="250" src={CloudUploadIcon} alt="Add an image" sx={{
                  ...(compressing || status === 'loading' ? opacity5 : opaqueOnBlur),
                  objectFit: 'contain',
                }}
                  onClick={async () => {
                    if (!compressing && status !== 'loading') {
                      const ownerOrFork = owner ? owner : ghUser
                      ownerOrFork && await dispatch(addImagesToAlbumAsync({
                        repoName: albumId, images,
                        albumName: albumGhPageImages?.repoInfo.data?.description || albumId,
                        owner: ownerOrFork,
                      }))
                      setImages({})
                      alert((ghUser === owner) ? `Images waiting for ${owner} approval` : `Images added, it will take about a minute to see changes.`)
                      navigate('/gallery')
                    }
                  }} />
                <CardContent>
                  <Typography variant="body2">
                    Upload
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        </>}

        {/* File upload */}
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
      </Grid>
      <Box mt={10}>
        <Backdrop sx={{ backgroundColor: '#ffffffee', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={compressing || status === 'loading'}>
          {(compressing || status === 'loading') && <CircularProgress />}
        </Backdrop>
      </Box>
      <FullscreenImage base={albumGhPageImages?.repoInfo.data.homepage}
        currentImage={albumGhPageImages?.img[currentImage]}
        prev={currentImage >= 0 ? currentImage - 1 : undefined}
        next={albumGhPageImages && currentImage < albumGhPageImages.img.length - 1 ? currentImage + 1 : undefined}
        setCurrentImage={setCurrentImage} />
    </div>
  )
}

export default Album