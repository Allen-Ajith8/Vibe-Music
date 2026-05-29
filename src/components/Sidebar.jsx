import React, { useState } from 'react';
import { Home, Search, Library, RefreshCw, Cloud, Heart, Music2, PlusSquare } from 'lucide-react';

const Sidebar = ({ currentView, setCurrentView }) => {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 2000); // mock sync
  };

  const handleNavClick = (view) => {
    if (view === 'Home' && currentView === 'Home') {
      window.location.reload();
      return;
    }
    setCurrentView(view);
  };

  return (
    <div className="hidden md:flex flex-col w-64 bg-spotifyBlack h-[calc(100vh-6rem)] p-4 text-spotifyLightGray overflow-y-auto">
      
      {/* Logo */}
      <div className="flex items-center gap-2 text-white font-bold text-2xl mb-8 px-2 hover:scale-105 transition duration-300 cursor-pointer w-max">
        <Music2 className="text-vibeCyan w-8 h-8" />
        VibeMusic
      </div>

      {/* Main Nav */}
      <div className="flex flex-col gap-4 mb-8">
        <button onClick={() => handleNavClick('Home')} className={`flex items-center gap-4 px-2 font-semibold transition duration-200 ${currentView === 'Home' ? 'text-white' : 'hover:text-white'}`}>
          <Home className="w-6 h-6" /> Home
        </button>
        <button onClick={() => handleNavClick('Search')} className={`flex items-center gap-4 px-2 font-semibold transition duration-200 ${currentView === 'Search' ? 'text-white' : 'hover:text-white'}`}>
          <Search className="w-6 h-6" /> Search
        </button>
        <button onClick={() => handleNavClick('Library')} className={`flex items-center gap-4 px-2 font-semibold transition duration-200 ${currentView === 'Library' ? 'text-white' : 'hover:text-white'}`}>
          <Library className="w-6 h-6" /> Your Library
        </button>
      </div>

      {/* Action Links */}
      <div className="flex flex-col gap-4 mb-6 border-b border-white/10 pb-6">
        <button className="flex items-center gap-4 hover:text-white transition duration-200 px-2 group">
          <div className="bg-spotifyLightGray group-hover:bg-white text-spotifyBlack p-1 rounded-sm transition">
            <PlusSquare className="w-4 h-4" />
          </div>
          <span className="font-semibold">Create Playlist</span>
        </button>
        <button className="flex items-center gap-4 hover:text-white transition duration-200 px-2 group">
          <div className="bg-gradient-to-br from-[#450af5] to-[#cffafe] text-white p-1 rounded-sm opacity-80 group-hover:opacity-100 transition">
            <Heart className="w-4 h-4" />
          </div>
          <span className="font-semibold text-white">Liked Songs</span>
        </button>
      </div>

      {/* Cloud Server Section */}
      <div className="flex flex-col gap-3 mb-6 bg-spotifyDark p-3 rounded-xl border border-white/5">
        <h3 className="text-xs uppercase font-bold tracking-widest text-spotifyLightGray mb-1">Cloud Server</h3>
        
        <button 
          onClick={handleSync}
          className="flex items-center gap-3 bg-white/5 hover:bg-white/10 py-2 px-3 rounded-md transition duration-200 text-white font-medium group"
        >
          <RefreshCw className={`w-5 h-5 text-vibeCyan ${isSyncing ? 'animate-spin-slow' : 'group-hover:scale-110 transition'}`} />
          {isSyncing ? 'Syncing...' : 'Sync Master Drive'}
        </button>
        
        <a href="#" className="flex items-center gap-3 hover:text-white transition duration-200 px-2 text-sm">
          <Cloud className="w-4 h-4" /> 
          Master Library
        </a>
      </div>

      {/* Playlists */}
      <div className="flex flex-col gap-3 overflow-y-auto text-sm px-2">
        {['Chill Vibes 2026', 'Focus Sessions', 'Late Night Drive', 'Workout Mix'].map((playlist, i) => (
          <a key={i} href="#" className="hover:text-white truncate transition duration-200">
            {playlist}
          </a>
        ))}
      </div>

    </div>
  );
};

export default Sidebar;
