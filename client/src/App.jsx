import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import HomePage from './pages/HomePage';
import ListPage from './pages/ListPage';
import GamePage from './pages/GamePage';
import SwipeGame from './pages/SwipeGame';
import ImageListPage from './pages/ImageListPage';
import ImageGamePage from './pages/ImageGamePage';
import GamesMenuPage from './pages/GamesMenuPage';
import RapidFireGame from './pages/RapidFireGame';
import GridMatchGame from './pages/GridMatchGame';
import PresentationPage from './pages/PresentationPage';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="bottom-center" /> 
      <Routes>
        {/* Word Game Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/lists" element={<ListPage />} />
        <Route path="/lists/:listId" element={<GamePage />} />

        {/* Image Game Routes */}
        <Route path="/image-lists" element={<ImageListPage />} />
        <Route path="/image-lists/:listId" element={<ImageGamePage />} />

          {/* Games Menu Route */}
          <Route path="/games" element={<GamesMenuPage />} />
          <Route path="/games/swipe" element={<SwipeGame />} />
          <Route path="/games/rapid-fire" element={<RapidFireGame />} />
          <Route path="/games/grid-match" element={<GridMatchGame />} />
          <Route path="/presentation" element={<PresentationPage />} />
          
      </Routes>
    </BrowserRouter>
  );
}

export default App;