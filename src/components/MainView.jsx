import React from 'react';
import { Play } from 'lucide-react';
import ScrollingText from './ScrollingText';
import AlbumCard from './AlbumCard';

const QuickCard = ({ title, imgUrl }) => (
  <div className="bg-white/5 hover:bg-white/20 transition duration-300 rounded-md flex items-center gap-4 cursor-pointer group rel overflow-hidden pr-4 sm:pr-0">
    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-spotifyDark flex-shrink-0 relative overflow-hidden">
      <img src={imgUrl} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
    </div>
    <span className="font-bold text-sm sm:text-base pr-4">{title}</span>
    
    <div className="absolute right-4 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-xl ml-auto hidden sm:flex">
      <button className="bg-vibeCyan rounded-full p-3 hover:scale-105 hover:brightness-110 active:scale-95 transition">
        <Play className="w-5 h-5 text-black fill-black" />
      </button>
    </div>
  </div>
);

const MainView = ({ playlist, currentSong, setCurrentSong, setIsPlaying, userPlaylists, onAddToPlaylist, onCreatePlaylist }) => {

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const quickLinks = [
    { title: 'Liked Songs', imgUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=100' },
    { title: 'Recent Mixes', imgUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=100' },
    { title: 'Daily Mix 1', imgUrl: 'https://images.unsplash.com/photo-1493225457124-a1a2a5ea3a0e?auto=format&fit=crop&q=80&w=100' },
    { title: 'Discover Weekly', imgUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=100' },
    { title: 'Lofi Beats', imgUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&q=80&w=100' },
    { title: 'Release Radar', imgUrl: 'https://images.unsplash.com/photo-1458560871784-56d23406c091?auto=format&fit=crop&q=80&w=100' },
  ];

  const handlePlaySong = (song) => {
    setCurrentSong(song);
    setIsPlaying(true);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-[#1b1b1b] to-spotifyBlack rounded-lg mr-2 mt-2 p-6 pb-24 border border-white/5 h-[calc(100vh-6.5rem)] relative">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8 sticky top-0 bg-transparent z-10 pt-2">
        <h1 className="text-3xl font-bold tracking-tight">{getGreeting()}</h1>
        <div className="w-10 h-10 rounded-full bg-spotifyDark border-[2px] border-white/10 overflow-hidden cursor-pointer hover:scale-105 transition">
           <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100" alt="User Profile" />
        </div>
      </div>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-10">
        {quickLinks.map((link, i) => (
          <QuickCard key={i} {...link} />
        ))}
      </div>

      {/* Horizontal Scroll Section */}
      <div className="mb-10">
        <div className="mb-6">
          <div className="w-12 h-1 bg-vibeCyan mb-3 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.5)]"></div>
          <div className="flex justify-between items-end">
            <h2 className="text-2xl font-bold hover:underline cursor-pointer">Recently Added</h2>
            <span className="text-sm font-bold text-spotifyLightGray hover:underline cursor-pointer uppercase tracking-widest">Show All</span>
          </div>
        </div>
        
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar items-stretch border-l-2 border-vibeCyan pl-2">
          {playlist.length > 0 ? (
            playlist.map((item) => (
              <AlbumCard 
                key={item.id} 
                trackId={item.id}
                title={item.title || item.name.replace(/\.[^/.]+$/, "")} 
                artist={item.artist || "Unknown Artist"} 
                imgUrl={item.imageId ? `http://localhost:3000/api/image/${item.imageId}` : "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=200"} 
                onClick={() => handlePlaySong(item)}
                isActive={currentSong?.id === item.id}
                userPlaylists={userPlaylists}
                onAddToPlaylist={onAddToPlaylist}
                onCreatePlaylist={onCreatePlaylist}
              />
            ))
          ) : (
            <p className="text-spotifyLightGray mt-2 pl-4 italic border-l-2 border-white/10 text-sm">
              No audio files found in connected Google Drive. Ensure the backend is running with a valid Service Account.
            </p>
          )}
        </div>
      </div>

    </div>
  );
};

export default MainView;
