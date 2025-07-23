import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Components/Home'
import SearchPage from './Components/SearchPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<SearchPage />} />
      </Routes>
    </Router>
  );
}

export default App;
