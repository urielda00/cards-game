import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import HomePage from './pages/HomePage';
import ListPage from './pages/ListPage';
import GamePage from './pages/GamePage';
import ImageListPage from './pages/ImageListPage';
import ImageGamePage from './pages/ImageGamePage';

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;