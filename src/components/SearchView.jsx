import React, { useState } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import AlbumCard from './AlbumCard';

const SearchView = ({ playlist, currentSong, setCurrentSong, setIsPlaying, userPlaylists, onAddToPlaylist, onCreatePlaylist }) => {
  const [query, setQuery] = useState('');

  const handlePlaySong = (song) => {
    setCurrentSong(song);
    setIsPlaying(true);
  };

  const filteredPlaylist = playlist.filter((item) => {
    const searchStr = query.toLowerCase();
    const title = (item.title || item.name.replace(/\.[^/.]+$/, "")).toLowerCase();
    const artist = (item.artist || "Unknown Artist").toLowerCase();
    return title.includes(searchStr) || artist.includes(searchStr);
  });

  return (
    <div className="flex-1 overflow-y-auto bg-[#121212] rounded-lg mr-2 mt-2 p-8 pb-24 border border-white/5 h-[calc(100vh-6.5rem)]">
      
      {/* Search Input Area */}
      <div className="max-w-2xl mx-auto mb-12 mt-12 relative">
        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
          <SearchIcon className="h-6 w-6 text-white/50" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="What do you want to listen to?"
          className="w-full bg-white/10 hover:bg-white/20 focus:bg-white/20 transition-all duration-300 text-white rounded-full py-5 pl-16 pr-8 text-lg font-bold border border-white/10 focus:border-vibeCyan focus:outline-none shadow-2xl placeholder-white/40"
          autoFocus
        />
      </div>

      {/* Results Section */}
      {query && (
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-6 hover:underline cursor-pointer">Top Results</h2>
          <div className="flex gap-4 flex-wrap pb-4">
            {filteredPlaylist.length > 0 ? (
              filteredPlaylist.map((item) => (
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
              <p className="text-white/50 text-lg w-full text-center mt-10">No results found for "{query}"</p>
            )}
          </div>
        </div>
      )}
      
      {!query && (
        <div className="flex flex-col items-center justify-center opacity-50 mt-20">
          <SearchIcon className="w-16 h-16 mb-4 text-vibeCyan animate-pulse" />
          <p className="text-xl font-bold">Search your library</p>
          <p className="text-sm mt-2">Find your favorite songs and artists from your Master Drive.</p>
        </div>
      )}

    </div>
  );
};

export default SearchView;
