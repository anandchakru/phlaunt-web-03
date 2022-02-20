import { Button } from '@mui/material'
import React from 'react'
import { useNavigate } from 'react-router-dom'

function Home() {
  const navigate = useNavigate()
  return (
    <div>
      <Button onClick={() => { navigate('/gallery') }}>Gallery</Button>
      <Button onClick={() => { navigate('/album/new') }}>New Album</Button>
      <Button onClick={() => { navigate(`/album/${Math.random().toString(36).slice(2)}`) }}>Album</Button>
    </div>
  )
}

export default Home
