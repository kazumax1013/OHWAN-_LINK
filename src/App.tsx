import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import Timeline from './pages/Timeline';
import Groups from './pages/Groups';
import GroupDetail from './pages/GroupDetail';
import Members from './pages/Members';
import Messages from './pages/Messages';
import ChatDetail from './pages/ChatDetail';
import Profile from './pages/Profile';
import Events from './pages/Events';
import Polls from './pages/Polls';
import Search from './pages/Search';
import NotFound from './pages/NotFound';
import Database from './pages/Database';
import DailyReports from './pages/DailyReports';
import VersionChecker from './components/VersionChecker';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <VersionChecker />
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/" element={<Timeline />} />
                <Route path="/groups" element={<Groups />} />
                <Route path="/groups/:id" element={<GroupDetail />} />
                <Route path="/members" element={<Members />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/messages/:id" element={<ChatDetail />} />
                <Route path="/profile/:id" element={<Profile />} />
                <Route path="/events" element={<Events />} />
                <Route path="/polls" element={<Polls />} />
                <Route path="/search" element={<Search />} />
                <Route path="/database" element={<Database />} />
                <Route path="/daily-reports" element={<DailyReports />} />
              </Route>
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;