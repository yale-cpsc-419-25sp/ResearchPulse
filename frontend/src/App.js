import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';
import Home from './pages/home';
import Login from './pages/login';
import Signup from './pages/signup';
import Dashboard from './pages/dashboard';
import Profile from './pages/profile';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/followedpapers" element={<div>Followed Papers</div>} />
        <Route path="/followedauthors" element={<div>Followed Authors</div>} />
        <Route path="/starred" element={<div>Starred</div>} />
        <Route path="/recentpapers" element={<div>Recent Papers</div>} />
        <Route path="/recentauthors" element={<div>Recent Authors</div>} />
        <Route path="/inbox" element={<div>Inbox</div>} />
        <Route path="/joingroup" element={<div>Join Group</div>} />
        <Route path="/leavegroup" element={<div>Leave Group</div>} />
        <Route path="*" element={<div>404 Not Found</div>} />
    </Routes>
  </BrowserRouter>
  );
}

export default App;
