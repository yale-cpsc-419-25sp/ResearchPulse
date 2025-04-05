import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';
import Home from './pages/home';
import Login from './pages/login';
import Signup from './pages/signup';
import Dashboard from './pages/dashboard';
import Profile from './pages/profile';
import Starred from './pages/starred';
import PaperDetail from './pages/paper';
import FollowingPapers from './pages/followingpapers';
import Following from './pages/following';
import RecentPapers from './pages/recentpapers';
import RecentAuthors from './pages/recentauthors';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/followedpapers" element={<FollowingPapers />} />
        <Route path="/following" element={<Following />} />
        <Route path="/starred" element={<Starred />} />
        <Route path="/recentpapers" element={<RecentPapers />} />
        <Route path="/recentauthors" element={<RecentAuthors />} />
        <Route path="/inbox" element={<div>Inbox</div>} />
        <Route path="/joingroup" element={<div>Join Group</div>} />
        <Route path="/leavegroup" element={<div>Leave Group</div>} />
        <Route path="*" element={<div>404 Not Found</div>} />
        <Route path="/paper/:paperId" element={<PaperDetail />} />


      </Routes>
    </BrowserRouter>
  );
}

export default App;
