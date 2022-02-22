import { AppImageBlob } from "./AlbumSlice"
export const compress = async (inputFiles: File[]): Promise<{ [x: number]: AppImageBlob }> => {
  const BASE64_MARKER = 'base64,'
  const QUALITY = 0.2
  const MAX_IMG_SIZE = 2048
  return new Promise((resolve, reject) => {
    const hashCode = function (input: string): number {
      let hash = 0
      if (input.length === 0) return hash
      for (let i = 0; i < input.length; i++) {
        hash = ((hash << 5) - hash) + input.charCodeAt(i)
        hash |= 0
      }
      return hash
    }
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
    const zipp = (file: File, index: number) => new Promise<AppImageBlob>((resolve, reject) => {
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
          resolve({
            key: hashCode(dataUrl),
            name: file.name,
            blob: dataURLToBlob(dataUrl),
            b64: dataUrl.replace(`data:image/jpeg;base64,`, ``), // https://stackoverflow.com/a/71201317/234110
            index,
            selected: false,
          })
        }
        image.src = (readerEvent.target as FileReader).result as string
      }
      reader.readAsDataURL(file)
    })
    let tmp: { [x: number]: AppImageBlob } = {}
    inputFiles.forEach(async (file, i) => {
      const { key, name, blob, b64, index } = await zipp(file, i)
      console.log(`${index}.${name} compressed.`)
      tmp[key] = { name, blob, b64, index, key, selected: false }
      if (Object.keys(tmp).length === inputFiles.length) {
        resolve(tmp)
      }
    })
  })
}
