import Navbar from "./component/Navbar";
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import Home from "./pages/Home";
import Aptosint from "./pages/Aptosint";

function App() {
  return (
    <div>
      <Router>
        <Navbar />
        <Routes>
          <Route path='/'  element={<Home />} />
          <Route path='/Aptos'  element={<Aptosint />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
