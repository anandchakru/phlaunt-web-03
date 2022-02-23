import * as React from 'react'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Menu from '@mui/material/Menu'
import MenuIcon from '@mui/icons-material/Menu'
import HomeIcon from '@mui/icons-material/Home'
import Container from '@mui/material/Container'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import MenuItem from '@mui/material/MenuItem'

import { useAppSelector, useAppDispatch } from '../../app/hooks'
import { selectIsAuth, selectAuthUser, signOutAsync } from '../auth/AuthSlice'
import { useNavigate } from 'react-router-dom'

const ResponsiveAppBar = () => {
  const navigate = useNavigate()
  const isAuth = useAppSelector(selectIsAuth)
  const user = useAppSelector(selectAuthUser)
  const dispatch = useAppDispatch()

  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null)
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null)

  return (
    <AppBar position="static" sx={{ marginBottom: '24px' }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography variant="h6" noWrap component="div" sx={{ mr: 2, display: { xs: 'none', md: 'flex' } }}>
            <IconButton onClick={() => {
              setAnchorElNav(null)
              navigate('/home')
            }} sx={{ my: 2, color: 'white', display: 'block' }}>
              <HomeIcon />
            </IconButton>
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}> {/* SMALL SCREEN */}
            <IconButton size="large" aria-label="account of current user" aria-controls="menu-appbar" aria-haspopup="true"
              onClick={(event: React.MouseEvent<HTMLElement>) => setAnchorElNav(event.currentTarget)} color="inherit" >
              <MenuIcon />
            </IconButton>
            <Menu id="menu-appbar" anchorEl={anchorElNav} keepMounted
              open={Boolean(anchorElNav)} onClose={() => setAnchorElNav(null)}
              sx={{ display: { xs: 'block', md: 'none' }, }}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }} >
              <MenuItem onClick={() => {
                setAnchorElNav(null)
                navigate('/gallery')
              }}><Typography textAlign="center">
                  Gallery
                </Typography>
              </MenuItem>
              <MenuItem onClick={() => {
                setAnchorElNav(null)
                navigate('/album/new')
              }}><Typography textAlign="center">
                  New Album
                </Typography>
              </MenuItem>
            </Menu>
          </Box>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <Button onClick={() => {
              setAnchorElNav(null)
              navigate('/home')
            }} sx={{ my: 2, color: 'white', display: 'block' }}>
              <HomeIcon />
            </Button>
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}> {/* LARGE SCREEN */}
            <Button onClick={() => {
              setAnchorElNav(null)
              navigate('/gallery')
            }} sx={{ my: 2, color: 'white', display: 'block' }}>
              Gallery
            </Button>
            <Button onClick={() => {
              setAnchorElNav(null)
              navigate('/album/new')
            }} sx={{ my: 2, color: 'white', display: 'block' }}>
              New Album
            </Button>
          </Box>

          {/* PROFILE START */}
          {isAuth && <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Open settings">
              <IconButton onClick={(event: React.MouseEvent<HTMLElement>) => setAnchorElUser(event.currentTarget)} sx={{ p: 0 }}>
                <Avatar alt={user?.displayName ? user?.displayName as string : user?.email as string} src={user?.photoURL as string} />
              </IconButton>
            </Tooltip>
            <Menu sx={{ mt: '45px' }} id="menu-appbar" anchorEl={anchorElUser} keepMounted
              open={Boolean(anchorElUser)} onClose={() => setAnchorElUser(null)}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}>
              <MenuItem onClick={() => {
                navigate('/profile')
                setAnchorElUser(null)
              }}>
                <Typography textAlign="center">Profile</Typography>
              </MenuItem>
              <MenuItem onClick={() => {
                dispatch(signOutAsync({}))
                setAnchorElUser(null)
                navigate('/home')
              }}>
                <Typography textAlign="center">Signout</Typography>
              </MenuItem>
            </Menu>
          </Box>}
          {!isAuth && <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Signin">
              <IconButton onClick={() => navigate('/login')} sx={{ p: 0 }}>
                <Avatar alt={user?.displayName ? user?.displayName as string : user?.email as string} src={user?.photoURL as string} />
              </IconButton>
            </Tooltip>
          </Box>}
          {/* PROFILE END */}
        </Toolbar>
      </Container>
    </AppBar>
  )
}
export default ResponsiveAppBar
