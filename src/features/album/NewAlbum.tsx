import React, { useEffect, useState } from 'react'
import { Button, Card, CardActionArea, CardContent, CardMedia, Grid } from '@mui/material'

function PreviewImgs(props: any) {
  const files: { [x: number]: Blob } = props.files
  return (
    <Grid container rowSpacing={4} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
      {Object.keys(files).map((file: string, index: number) => <Grid key={index} item xs={6} sm={4} md={3} lg={2}><Card sx={{ maxWidth: 100, }}>
        <CardActionArea>
          <CardMedia component="img" height="100" sx={{ objectFit: 'cover' }} image={URL.createObjectURL(files[file])} alt={files[file].name} />
          <CardContent> </CardContent>
        </CardActionArea>
      </Card></Grid>)}
    </Grid>
  )
}
function NewAlbum() {
  const BASE64_MARKER = 'base64,'
  const QUALITY = 0.7
  const MAX_IMG_SIZE = 2048
  const [rawFiles, setRawFiles] = useState<File[]>([])
  const [images, setImages] = useState<{ [x: number]: Blob }>({})

  const hashCode = function (input: string): number {
    let hash = 0
    if (input.length === 0) return hash
    for (let i = 0; i < input.length; i++) {
      hash = ((hash << 5) - hash) + input.charCodeAt(i)
      hash |= 0
    }
    return hash
  }
  useEffect(() => {
    const dataURLToBlob = (dataURL: string) => {
      if (dataURL.indexOf(BASE64_MARKER) === -1) {
        const parts2 = dataURL.split(',')
        return new Blob([parts2[1]], { type: parts2[0].split(':')[1] })
      }
      const parts = dataURL.split(BASE64_MARKER)
      const raw = window.atob(parts[1])
      const rawLength = raw.length
      const uInt8Array = new Uint8Array(rawLength)
      for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i)
      }
      return new Blob([uInt8Array], { type: parts[0].split(':')[1] })
    }
    const zipp = (file: File) => new Promise<{ key: number, blob: Blob }>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (readerEvent) => {
        const image = new Image()
        image.onload = () => {
          // Resize the image
          const canvas = document.createElement('canvas')
          let width = image.width
          let height = image.height
          if (width > height) {
            if (width > MAX_IMG_SIZE) {
              height *= MAX_IMG_SIZE / width
              width = MAX_IMG_SIZE
            }
          } else {
            if (height > MAX_IMG_SIZE) {
              width *= MAX_IMG_SIZE / height
              height = MAX_IMG_SIZE
            }
          }
          canvas.width = width
          canvas.height = height
          const crcd = (canvas.getContext('2d') as CanvasRenderingContext2D)
          crcd.drawImage(image, 0, 0, width, height)
          const dataUrl = canvas.toDataURL('image/jpeg', QUALITY) as string
          resolve({ key: hashCode(dataUrl), blob: dataURLToBlob(dataUrl) })
        }
        image.src = (readerEvent.target as FileReader).result as string
      }
      reader.readAsDataURL(file)
    })
    for (var file of rawFiles) {
      zipp(file).then(({ key, blob }) => {
        setImages((files) => ({ ...files, [key]: blob }))
        // rawFiles.splice(rawFiles.indexOf(file), 1)
      })
    }
  }, [rawFiles])
  return (
    <div>
      <h1>
        New Album
      </h1>
      <PreviewImgs files={images} />
      <input
        accept="image/jpeg"
        style={{ display: 'none' }}
        id="raised-button-file"
        multiple
        type="file"
        onChange={async (event) => {
          const elem = event.target as HTMLInputElement
          elem && elem.files && setRawFiles([...rawFiles, ...Array.from(elem.files)])
        }} />
      <label htmlFor="raised-button-file">
        <Button component="span" onClick={() => { }}>
          Pick
        </Button>
      </label>
    </div>
  )
}

export default NewAlbum