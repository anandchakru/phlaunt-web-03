import { Button } from '@mui/material'
import React from 'react'
import { useNavigate } from 'react-router-dom'

function Home() {
  const navigate = useNavigate()
  return (
    <div>
      <Button onClick={() => { navigate('/gallery') }}>Gallery</Button>
      <Button onClick={() => { navigate('/album/33') }}>Album 33</Button>
    </div>
  )
}

export default Home
