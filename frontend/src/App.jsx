import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { RightSidebar } from './components/RightSidebar';
import { BottomNav } from './components/BottomNav';

import { FeedPage } from './pages/FeedPage';
import { SuggestionsPage } from './pages/SuggestionsPage';
import { NetworkPage } from './pages/NetworkPage';
import { DiscoverPage } from './pages/DiscoverPage';
import { CommunitiesPage } from './pages/CommunitiesPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ProfilePage } from './pages/ProfilePage';
import { AlgorithmLabPage } from './pages/AlgorithmLabPage';
import { RequestsPage } from './pages/RequestsPage';

function AppLayout() {
  const location = useLocation();

  // Pages where the 3-column right sidebar is rendered
  const showRightSidebar = ['/', '/discover', '/suggestions'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-brand-500 selection:text-slate-950 pb-16 lg:pb-0">
      <Navbar />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-7 items-start">
          
          {/* Left Column: Sidebar Navigation */}
          <Sidebar />

          {/* Center Column: Main Content */}
          <div className="flex-1 min-w-0">
            <Routes>
              <Route path="/" element={<FeedPage />} />
              <Route path="/suggestions" element={<SuggestionsPage />} />
              <Route path="/network" element={<NetworkPage />} />
              <Route path="/discover" element={<DiscoverPage />} />
              <Route path="/communities" element={<CommunitiesPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/lab" element={<AlgorithmLabPage />} />
              <Route path="/requests" element={<RequestsPage />} />
              <Route path="/profile/:id" element={<ProfilePage />} />
            </Routes>
          </div>

          {/* Right Column: People You May Know & Trending */}
          {showRightSidebar && <RightSidebar />}

        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout />
      </Router>
    </AuthProvider>
  );
}

export default App;
