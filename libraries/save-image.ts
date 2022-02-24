import { getImgFromArr } from 'array-to-image'
import { decode } from 'blurhash'

type SaveImageProps = {
  imageData: any
  data: any
  setData: any
}
const saveImage = async ({ imageData, data, setData }: SaveImageProps) => {
  const res = await fetch(`/api/blurhash?url=${imageData.url}`)
  if (res.ok) {
    const blurhash = await res.json()
    const pixels = decode(blurhash.hash, 32, 32)
    const image = getImgFromArr(pixels, 32, 32)
    setData({ ...data, image: imageData.url, imageBlurhash: image.src })
  }
}

export default saveImage
