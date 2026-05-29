import React, { useState, useRef, useEffect } from 'react';
import { Play, Plus } from 'lucide-react';
import ScrollingText from './ScrollingText';

const AlbumCard = ({ trackId, title, artist, imgUrl, onClick, isActive, userPlaylists = [], onAddToPlaylist, onCreatePlaylist }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddClick = (e) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handlePlaylistSelect = (e, playlistId) => {
    e.stopPropagation();
    if (onAddToPlaylist) onAddToPlaylist(playlistId, trackId);
    setShowMenu(false);
  };

  const handleCreateNew = (e) => {
    e.stopPropagation();
    if (onCreatePlaylist) onCreatePlaylist(trackId);
    setShowMenu(false);
  };

  return (
    <div 
      className={`bg-spotifyDark hover:bg-white/10 p-4 rounded-xl transition duration-300 flex-shrink-0 w-[180px] cursor-pointer group relative ${isActive ? 'bg-white/20' : ''}`}
      onClick={onClick}
    >
      <div className="relative w-full aspect-square mb-4 rounded-md overflow-hidden shadow-lg border border-white/5">
        <img src={imgUrl} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition duration-700 bg-spotifyBlack" />
        
        {/* Play Button */}
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-xl z-10">
          <button className="bg-vibeCyan rounded-full p-3 hover:scale-105 hover:brightness-110 active:scale-95 transition shadow-lg">
            <Play className="w-5 h-5 text-black fill-black" />
          </button>
        </div>

        {/* Add to Playlist Button */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
          <button 
            onClick={handleAddClick}
            className="bg-black/60 hover:bg-black/90 backdrop-blur-md rounded-full p-1.5 transition text-white hover:text-vibeCyan border border-white/10"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Dropdown Menu */}
        {showMenu && (
          <div 
            ref={menuRef}
            className="absolute top-10 right-2 w-48 bg-[#282828] border border-white/10 rounded-lg shadow-2xl z-30 py-2 text-sm text-white animate-slideUp overflow-hidden"
          >
            <div className="px-3 py-1.5 text-xs font-bold text-white/50 uppercase tracking-widest border-b border-white/5 mb-1">Add to Playlist</div>
            <button 
              onClick={handleCreateNew}
              className="w-full text-left px-4 py-2 hover:bg-white/10 transition flex items-center gap-2 font-bold text-vibeCyan"
            >
              <Plus className="w-4 h-4" /> Create New Playlist
            </button>
            <div className="max-h-32 overflow-y-auto no-scrollbar">
              {userPlaylists.map(pl => (
                <button 
                  key={pl.id}
                  onClick={(e) => handlePlaylistSelect(e, pl.id)}
                  className="w-full text-left px-4 py-2 hover:bg-white/10 transition truncate flex items-center justify-between group/btn"
                >
                  <span className="truncate pr-2">{pl.title}</span>
                  {pl.trackIds.includes(trackId) && <span className="text-[10px] bg-white/20 px-1.5 rounded-full text-white/70">Added</span>}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <ScrollingText text={title} className="font-bold text-white mb-1" enableScroll={false} />
      <ScrollingText text={artist} className="text-sm text-spotifyLightGray" />
    </div>
  );
};

export default AlbumCard;
