import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';
import Home from './pages/home';
import Login from './pages/login';
import Signup from './pages/signup';
import AuthorSignup from './pages/authorsignup';
import Dashboard from './pages/dashboard';
import Profile from './pages/profile';
import Starred from './pages/starred';
import PaperDetail from './pages/paper';
import FollowingPapers from './pages/followingpapers';
import Following from './pages/following';
import RecentPapers from './pages/recentpapers';
import RecentAuthors from './pages/recentauthors';
import JoinGroup from './pages/joingroup';
import GroupPage from "./pages/groups";
import About from "./pages/about";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/authorsignup" element={<AuthorSignup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/followedpapers" element={<FollowingPapers />} />
        <Route path="/following" element={<Following />} />
        <Route path="/starred" element={<Starred />} />
        <Route path="/recentpapers" element={<RecentPapers />} />
        <Route path="/recentauthors" element={<RecentAuthors />} />
        <Route path="/joingroup" element={<JoinGroup/>} />
        <Route path="/group/:groupId" element={<GroupPage/>} />
        <Route path="/about" element={<About/>} />
        <Route path="*" element={<div>404 Not Found</div>} />
        <Route path="/paper/:paperId" element={<PaperDetail />} />
      

      </Routes>
    </BrowserRouter>
  );
}

export default App;
