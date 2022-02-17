import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import App from './App';
import { store } from './app/store';
import { Provider } from 'react-redux';
import * as serviceWorker from './serviceWorker';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from 'react-router-dom'
import Home from './features/home/Home';
import Gallery from './features/gallery/Gallery';
import Album from './features/album/Album';
import Container from '@mui/material/Container'

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <Container sx={{ textAlign: 'center' }}>
        <BrowserRouter basename='/phlaunt-web-03'>
          <Routes>
            <Route path="/" element={<Navigate to="/home" />} />
            <Route path="/home" element={<Home />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/album" element={<Navigate to="/gallery" />} />
            <Route path="/album/:albumId" element={<Album />} />

            <Route path="*" element={<h1>404</h1>} />
          </Routes>
        </BrowserRouter>
      </Container>
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
