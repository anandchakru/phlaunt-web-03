import axios, { AxiosResponse } from "axios"
import { useEffect, useState } from "react"

const Img = ({ src, alt, ...props }) => {
  const [sSrc, setSsrc] = useState('')
  useEffect(() => {
    const fetchData = async (src: string) => await axios.get(src, { responseType: 'blob' }).then((res: AxiosResponse) => URL.createObjectURL(res.data))
    if (src) {
      fetchData(src).then(res => setSsrc(res))
    }
  }, [src])
  return (
    sSrc.length > 0 ? <img src={sSrc} alt={alt} {...props} /> : <></>
  )
}

export default Img

/*
<Img style={{ objectFit: 'cover' }} height="250" onClick={() => { setCurrentImage(index) }}
              src={albumGhPageImages?.repoInfo.data.homepage + image.path} alt={image.name} />
*/