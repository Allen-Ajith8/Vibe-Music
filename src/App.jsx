import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import MainView from './components/MainView';
import BottomPlayer from './components/BottomPlayer';
import FullScreenPlayer from './components/FullScreenPlayer';
import TopNav from './components/TopNav';
import SearchView from './components/SearchView';
import LibraryView from './components/LibraryView';
import PlaylistDetailView from './components/PlaylistDetailView';

function App() {
  const [currentView, setCurrentView] = useState('Home');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState(null);
  const [playlist, setPlaylist] = useState([]);
  const [userPlaylists, setUserPlaylists] = useState([
    { id: '1', title: 'Chill Vibes 2026', trackIds: [] },
    { id: '2', title: 'Focus Sessions', trackIds: [] },
    { id: '3', title: 'Late Night Drive', trackIds: [] },
    { id: '4', title: 'Workout Mix', trackIds: [] }
  ]);
  const [activePlaylistId, setActivePlaylistId] = useState(null);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatState, setRepeatState] = useState(0); // 0 = off, 1 = playlist, 2 = one
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [albumArtUrl, setAlbumArtUrl] = useState(null);
  const [lyricsString, setLyricsString] = useState("");
  
  const audioRef = useRef(null);
  
  // Deterministic gradient fallback
  const getFallbackGradient = (name) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    const color1 = `hsl(${Math.abs(hash) % 360}, 70%, 50%)`;
    const color2 = `hsl(${(Math.abs(hash) + 40) % 360}, 80%, 30%)`;
    return `linear-gradient(135deg, ${color1}, ${color2})`;
  };

  // Fetch master track list
  useEffect(() => {
    fetch('http://localhost:3000/api/songs')
      .then(res => res.json())
      .then(data => {
        if (!data.error) setPlaylist(data);
      })
      .catch(err => console.error('Error fetching drive songs:', err));
  }, []);

  // ==========================================
  // 🚨 JARVIS LISTENER HOOK
  // ==========================================
  useEffect(() => {
    // Wait until the playlist is actually loaded from Drive
    if (playlist.length === 0) return;

    const pollJarvis = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/jarvis/poll');
        const data = await res.json();

        if (data.action === 'play' && data.targetSong) {
          console.log(`[JARVIS COMMAND RECEIVED] Searching for: ${data.targetSong}`);
          
          const searchTarget = data.targetSong.toLowerCase();
          
          // Fuzzy search to find the best match by title, filename, or artist
          const songToPlay = playlist.find(song => 
            song.title.toLowerCase().includes(searchTarget) || 
            song.baseName.toLowerCase().includes(searchTarget) ||
            song.artist.toLowerCase().includes(searchTarget)
          );

          if (songToPlay) {
            console.log(`[JARVIS] Match found! Playing: ${songToPlay.title}`);
            setCurrentSong(songToPlay);
            setIsPlaying(true);
          } else {
            console.warn(`[JARVIS] Could not find a song matching: ${data.targetSong}`);
          }
        }
      } catch (err) {
        // Silently catch errors so we don't spam the console if the backend is restarting
      }
    };

    // Poll the server every 1 second
    const intervalId = setInterval(pollJarvis, 1000); 

    // Cleanup the interval if the component unmounts
    return () => clearInterval(intervalId); 
  }, [playlist]); 
  // ==========================================

  const handleCreatePlaylist = (initialTrackId = null) => {
    const newPlaylist = {
      id: Date.now().toString(),
      title: `My Playlist #${userPlaylists.length + 1}`,
      trackIds: initialTrackId ? [initialTrackId] : []
    };
    setUserPlaylists([...userPlaylists, newPlaylist]);
  };

  const handleRenamePlaylist = (playlistId, newTitle) => {
    setUserPlaylists(prev => prev.map(p => p.id === playlistId ? { ...p, title: newTitle } : p));
  };

  const handleDeletePlaylist = (playlistId) => {
    setUserPlaylists(prev => prev.filter(p => p.id !== playlistId));
    setActivePlaylistId(null);
    setCurrentView('Library');
  };

  const handleAddToPlaylist = (playlistId, trackId) => {
    setUserPlaylists(prev => prev.map(p => {
      if (p.id === playlistId) {
        if (!p.trackIds.includes(trackId)) {
          return { ...p, trackIds: [trackId, ...p.trackIds] };
        }
      }
      return p;
    }));
  };

  useEffect(() => {
    if (!currentSong) return;
    
    // Set dynamic Image URL or hit fallback gradient
    if (currentSong.imageId) {
      setAlbumArtUrl(`http://localhost:3000/api/image/${currentSong.imageId}`);
    } else {
      setAlbumArtUrl(getFallbackGradient(currentSong.baseName || currentSong.name));
    }

    // Fetch dynamic Lyrics string
    if (currentSong.lyricsId) {
       fetch(`http://localhost:3000/api/lyrics/${currentSong.lyricsId}`)
         .then(res => res.text())
         .then(text => setLyricsString(text))
         .catch(() => setLyricsString(""));
    } else {
       setLyricsString("");
    }
  }, [currentSong]);

  return (
    <div className="flex h-screen bg-spotifyBlack text-white overflow-hidden font-sans">
      
      {/* Top Navigation */}
      <TopNav currentView={currentView} setCurrentView={setCurrentView} />
      
      {/* App Body */}
      <div className="flex flex-1 w-full relative">
        <Sidebar currentView={currentView} setCurrentView={setCurrentView} userPlaylists={userPlaylists} />
        
        {currentView === 'Home' && (
          <MainView 
            playlist={playlist} 
            currentSong={currentSong} 
            setCurrentSong={setCurrentSong} 
            setIsPlaying={setIsPlaying}
            userPlaylists={userPlaylists}
            onAddToPlaylist={handleAddToPlaylist}
            onCreatePlaylist={handleCreatePlaylist}
          />
        )}
        
        {currentView === 'Search' && (
          <SearchView 
            playlist={playlist}
            currentSong={currentSong} 
            setCurrentSong={setCurrentSong} 
            setIsPlaying={setIsPlaying}
            userPlaylists={userPlaylists}
            onAddToPlaylist={handleAddToPlaylist}
            onCreatePlaylist={handleCreatePlaylist}
          />
        )}

        {currentView === 'Library' && (
          <LibraryView 
            userPlaylists={userPlaylists} 
            masterTracks={playlist} 
            setCurrentView={setCurrentView} 
            setActivePlaylistId={setActivePlaylistId} 
            onCreatePlaylist={handleCreatePlaylist}
          />
        )}

        {currentView === 'PlaylistDetail' && activePlaylistId && (
          <PlaylistDetailView 
            playlistId={activePlaylistId}
            userPlaylists={userPlaylists}
            masterTracks={playlist}
            currentSong={currentSong}
            setCurrentSong={setCurrentSong}
            setIsPlaying={setIsPlaying}
            onAddToPlaylist={handleAddToPlaylist}
            onCreatePlaylist={handleCreatePlaylist}
            onRenamePlaylist={handleRenamePlaylist}
            onDeletePlaylist={handleDeletePlaylist}
            setCurrentView={setCurrentView}
            setIsShuffle={setIsShuffle}
          />
        )}
      </div>

      {/* Fixed Playback Controls */}
      <BottomPlayer 
        isPlaying={isPlaying} 
        setIsPlaying={setIsPlaying} 
        onExpand={() => setIsExpanded(true)} 
        currentSong={currentSong}
        setCurrentSong={setCurrentSong}
        playlist={playlist}
        userPlaylists={userPlaylists}
        activePlaylistId={activePlaylistId}
        currentTime={currentTime}
        setCurrentTime={setCurrentTime}
        duration={duration}
        setDuration={setDuration}
        albumArtUrl={albumArtUrl}
        audioRef={audioRef}
        isShuffle={isShuffle}
        setIsShuffle={setIsShuffle}
        repeatState={repeatState}
        setRepeatState={setRepeatState}
        currentView={currentView}
      />

      {/* Full Screen Overlay Overlay */}
      <FullScreenPlayer 
        isExpanded={isExpanded} 
        onClose={() => setIsExpanded(false)} 
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        currentSong={currentSong}
        currentTime={currentTime}
        duration={duration}
        albumArtUrl={albumArtUrl}
        lyricsString={lyricsString}
        audioRef={audioRef}
      />
      
    </div>
  );
}

export default App;
