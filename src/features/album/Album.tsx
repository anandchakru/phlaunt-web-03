import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'

function Album() {
  const { albumId } = useParams()
  useEffect(() => {
    if (albumId) {
      console.log(`Album component loaded with albumid:${albumId}`)
    }
  }, [albumId])
  return (
    <div>
      Album
      <pre>{albumId}</pre>
    </div>
  )
}

export default Album