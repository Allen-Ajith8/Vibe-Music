import React, { useState } from 'react';
import AlbumCard from './AlbumCard';
import { Play, Shuffle, Trash2, Edit3, Check } from 'lucide-react';

const PlaylistDetailView = ({
  playlistId,
  userPlaylists,
  masterTracks,
  currentSong,
  setCurrentSong,
  setIsPlaying,
  onAddToPlaylist,
  onCreatePlaylist,
  onRenamePlaylist,
  onDeletePlaylist,
  setCurrentView,
  setIsShuffle
}) => {
  const playlist = userPlaylists.find(p => p.id === playlistId);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");

  if (!playlist) return <div className="p-8 text-white">Playlist not found</div>;

  const tracks = playlist.trackIds
    .map(id => masterTracks.find(t => t.id === id))
    .filter(Boolean);

  const handlePlayAll = () => {
    if (tracks.length > 0) {
      setCurrentSong(tracks[0]);
      setIsPlaying(true);
    }
  };

  const handleShufflePlay = () => {
    setIsShuffle(true);
    if (tracks.length > 0) {
      const idx = Math.floor(Math.random() * tracks.length);
      setCurrentSong(tracks[idx]);
      setIsPlaying(true);
    }
  };

  const handleEditClick = () => {
    setEditTitle(playlist.title);
    setIsEditing(true);
  };

  const handleSaveRename = () => {
    if (editTitle.trim()) {
      onRenamePlaylist(playlist.id, editTitle.trim());
    }
    setIsEditing(false);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-[#1b1b1b] to-spotifyBlack rounded-lg mr-2 mt-2 p-8 pb-24 border border-white/5 h-[calc(100vh-6.5rem)]">
      
      {/* Header */}
      <div className="flex items-end gap-6 mb-12 mt-8">
        <div className="w-48 h-48 bg-spotifyDark shadow-2xl rounded-sm flex items-center justify-center overflow-hidden border border-white/10">
          {tracks.length > 0 && tracks[0].imageId ? (
            <img src={`http://localhost:3000/api/image/${tracks[0].imageId}`} className="w-full h-full object-cover" alt="Playlist Cover" />
          ) : (
             <div className="w-full h-full bg-gradient-to-br from-cyan-600 to-cyan-900" />
          )}
        </div>
        <div className="flex flex-col flex-1">
          <span className="text-sm font-bold uppercase tracking-widest text-white/70 mb-2">Playlist</span>
          
          {isEditing ? (
            <div className="flex items-center gap-4 mb-6">
               <input 
                 type="text" 
                 value={editTitle}
                 onChange={(e) => setEditTitle(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && handleSaveRename()}
                 autoFocus
                 className="bg-white/10 text-6xl font-black text-white tracking-tight border-b-2 border-vibeCyan outline-none px-2 py-1 w-full max-w-2xl rounded-t-sm"
               />
               <button onClick={handleSaveRename} className="p-3 bg-vibeCyan text-black rounded-full hover:scale-105 active:scale-95 transition">
                 <Check className="w-6 h-6" />
               </button>
            </div>
          ) : (
            <div className="flex items-end gap-6 mb-6 group/title">
              <h1 className="text-6xl font-black text-white tracking-tight cursor-pointer" onClick={handleEditClick}>
                {playlist.title}
              </h1>
              <button onClick={handleEditClick} className="opacity-0 group-hover/title:opacity-100 transition text-white/40 hover:text-white mb-2">
                 <Edit3 className="w-6 h-6" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 text-white/70 font-medium">
            <span className="text-white hover:underline cursor-pointer font-bold">You</span>
            <span>•</span>
            <span>{tracks.length} songs</span>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between gap-6 mb-10 border-b border-white/5 pb-8">
        <div className="flex items-center gap-6">
          <button 
            onClick={handlePlayAll}
            className="bg-vibeCyan hover:scale-105 transition active:scale-95 text-black p-4 rounded-full shadow-[0_0_20px_rgba(34,211,238,0.4)]"
          >
            <Play className="w-6 h-6 fill-black" />
          </button>
          <button onClick={handleShufflePlay} className="text-white/50 hover:text-vibeCyan transition">
             <Shuffle className="w-8 h-8" />
          </button>
        </div>
        
        <button 
          onClick={() => onDeletePlaylist(playlist.id)} 
          className="text-white/30 hover:text-red-500 hover:bg-red-500/10 p-3 rounded-full transition flex items-center gap-2"
          title="Delete Playlist"
        >
           <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Tracks Grid */}
      <div className="flex gap-4 flex-wrap pb-4">
        {tracks.length > 0 ? (
          tracks.map((item) => (
            <AlbumCard 
              key={item.id} 
              trackId={item.id}
              title={item.title || item.name.replace(/\.[^/.]+$/, "")} 
              artist={item.artist || "Unknown Artist"} 
              imgUrl={item.imageId ? `http://localhost:3000/api/image/${item.imageId}` : "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=200"} 
              onClick={() => {
                setCurrentSong(item);
                setIsPlaying(true);
              }}
              isActive={currentSong?.id === item.id}
              userPlaylists={userPlaylists}
              onAddToPlaylist={onAddToPlaylist}
              onCreatePlaylist={onCreatePlaylist}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center w-full mt-10 bg-white/5 p-12 rounded-xl border border-white/5 shadow-inner">
             <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4">
                <Play className="w-6 h-6 text-white/50" />
             </div>
             <h3 className="text-xl font-bold text-white mb-2">It's a bit quiet here...</h3>
             <p className="text-white/50 text-center max-w-sm mb-6">
                This playlist is currently empty. Find your favorite songs in the search menu and click the '+' button to add them!
             </p>
             <button 
               onClick={() => setCurrentView('Search')}
               className="bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-6 rounded-full transition"
             >
               Find Songs
             </button>
          </div>
        )}
      </div>
      
    </div>
  );
};

export default PlaylistDetailView;
