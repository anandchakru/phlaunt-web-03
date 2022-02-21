import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { Box } from '@mui/material'

function Album() {
  const { albumId } = useParams()
  const [page, setPage] = useState<string>('')
  useEffect(() => {
    if (albumId) {
      console.log(`Album component loaded with albumid:${albumId}`)
      axios.get(`https://anandchakru.github.io/${albumId}`).then(res => res.data).then(data => {
        setPage(data)
      })
    }
  }, [albumId])
  return (
    <div>
      Album
      <pre>{albumId}</pre>
      {/* <iframe src={'https://anandchakru.github.io/' + albumId} seamless></iframe> */}
      <Box>{page}</Box>
    </div>
  )
}

export default Album