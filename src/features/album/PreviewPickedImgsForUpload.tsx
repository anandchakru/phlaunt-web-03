import { Card, CardActionArea, CardContent, CardMedia, Grid, Typography } from "@mui/material"
import { AppImageBlob } from "./AlbumSlice"

const PreviewPickedImgsForUpload = (props: any) => {
  const files: { [x: number]: AppImageBlob } = props.files
  return (<Grid container rowSpacing={4} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
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

export default PreviewPickedImgsForUpload