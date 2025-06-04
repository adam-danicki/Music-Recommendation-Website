import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DragDropInterface from './Components/DragDropInterface';
import GeneratedPlaylist from './Components/GeneratedPlaylist';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DragDropInterface />} />
        <Route path="/generatePlaylist" element={<GeneratedPlaylist />} />
      </Routes>
    </Router>
  );
}

export default App;
