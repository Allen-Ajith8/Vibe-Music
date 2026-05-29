import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, 
  Heart, Volume2, Maximize2, Mic2, ListMusic 
} from 'lucide-react';
import ScrollingText from './ScrollingText';

const BottomPlayer = ({ 
  isPlaying, setIsPlaying, onExpand, currentSong, setCurrentSong, 
  playlist, userPlaylists = [], activePlaylistId, currentView,
  currentTime, setCurrentTime, duration, setDuration, albumArtUrl, audioRef,
  isShuffle, setIsShuffle, repeatState, setRepeatState
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [progress, setProgress] = useState(0); 
  const [isDragging, setIsDragging] = useState(false);
  const [volume, setVolume] = useState(70);
  const [showQueue, setShowQueue] = useState(false);
  const lastTimeUpdateRef = useRef(0); // for throttling

  // --- Queue Logic ---
  const getActiveQueue = useCallback(() => {
    if (activePlaylistId) {
      const pl = userPlaylists.find(p => p.id === activePlaylistId);
      if (pl && pl.trackIds.length > 0) {
        return pl.trackIds.map(id => playlist.find(t => t.id === id)).filter(Boolean);
      }
    }
    return playlist;
  }, [activePlaylistId, userPlaylists, playlist]);

  const activeQueue = getActiveQueue();

  // --- Next/Prev Logic ---
  const handleNextSong = useCallback(() => {
    if (!activeQueue || activeQueue.length === 0 || !currentSong) {
      setIsPlaying(false);
      return;
    }
    
    if (isShuffle) {
      const nextIndex = Math.floor(Math.random() * activeQueue.length);
      setCurrentSong(activeQueue[nextIndex]);
      setIsPlaying(true);
      return;
    }
    
    const currentIndex = activeQueue.findIndex(s => s.id === currentSong.id);
    let nextIndex = currentIndex === -1 ? 0 : currentIndex + 1;
    
    if (nextIndex >= activeQueue.length) {
      if (repeatState === 1 || repeatState === 2) {
        nextIndex = 0; // Wrap around for Playlist repeat
      } else {
        // Repeat Off -> "plays random similar songs" => Play a random global track
        const randomIdx = Math.floor(Math.random() * playlist.length);
        setCurrentSong(playlist[randomIdx]);
        setIsPlaying(true);
        return;
      }
    }
    
    setCurrentSong(activeQueue[nextIndex]);
    setIsPlaying(true);
  }, [activeQueue, currentSong, setCurrentSong, setIsPlaying, isShuffle, repeatState, playlist]);

  const handlePrevSong = useCallback(() => {
    if (!activeQueue || activeQueue.length === 0 || !currentSong) return;
    
    if (isShuffle) {
      const prevIndex = Math.floor(Math.random() * activeQueue.length);
      setCurrentSong(activeQueue[prevIndex]);
      setIsPlaying(true);
      return;
    }

    const currentIndex = activeQueue.findIndex(s => s.id === currentSong.id);
    const prevIndex = currentIndex <= 0 ? activeQueue.length - 1 : currentIndex - 1;
    setCurrentSong(activeQueue[prevIndex]);
    setIsPlaying(true);
  }, [activeQueue, currentSong, setCurrentSong, setIsPlaying, isShuffle]);
// removed duplicate

  // Sync isPlaying state with html audio element
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Audio playback failed:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentSong]);

  // --- Throttled Time Update (fires every ~500ms) ---
  const handleTimeUpdate = useCallback(() => {
    if (!audioRef.current || isDragging) return;
    const now = Date.now();
    if (now - lastTimeUpdateRef.current < 500) return; // throttle to 500ms
    lastTimeUpdateRef.current = now;
    
    const ct = audioRef.current.currentTime;
    const dur = audioRef.current.duration;
    setCurrentTime(ct);
    setProgress(dur > 0 ? (ct / dur) * 100 : 0);
  }, [isDragging, setCurrentTime]);

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  // --- Stall Detection: if stalled/waiting near end of track, push to end ---
  const handleStalled = useCallback(() => {
    if (!audioRef.current || !duration) return;
    const remaining = duration - audioRef.current.currentTime;
    // If within 3 seconds of the end when stalled, jump to finish
    if (remaining > 0 && remaining < 3) {
      console.log(`Stall detected near end (${remaining.toFixed(1)}s left). Jumping to end.`);
      audioRef.current.currentTime = duration;
    }
  }, [duration]);

  // --- onEnded: auto-advance or single repeat ---
  const handleEnded = useCallback(() => {
    setProgress(100);
    setCurrentTime(duration);
    
    if (repeatState === 2) { // Repeat One song
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else {
      handleNextSong();
    }
  }, [handleNextSong, duration, setCurrentTime, repeatState, audioRef]);

  const handleSeekChange = (e) => {
    setIsDragging(true);
    const newProgress = e.target.value;
    setProgress(newProgress);
    if (duration) setCurrentTime((newProgress / 100) * duration);
  };

  const handleSeekEnd = (e) => {
    setIsDragging(false);
    const newProgress = e.target.value;
    if (audioRef.current) {
      audioRef.current.currentTime = (newProgress / 100) * audioRef.current.duration;
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const handleVolumeChange = (e) => {
    const val = e.target.value;
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val / 100;
    }
  };

  const renderQueuePopup = () => {
    if (!showQueue) return null;
    const currentIndex = activeQueue.findIndex(s => s?.id === currentSong?.id);
    const upcoming = activeQueue.slice(Math.max(0, currentIndex + 1), currentIndex + 11);
    
    return (
      <div className="absolute bottom-28 right-4 w-80 bg-[#1e1e1e]/90 backdrop-blur-2xl border border-white/10 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-4 flex flex-col z-50 animate-slideUp">
        <h3 className="text-white font-bold mb-4 flex items-center justify-between">
          <span>Up Next</span>
          <span className="text-xs text-vibeCyan font-normal">{activePlaylistId ? 'Playing from Playlist' : 'Master Mix'}</span>
        </h3>
        <div className="flex flex-col gap-3 max-h-64 overflow-y-auto no-scrollbar">
          {upcoming.length > 0 ? (
            upcoming.map((track, i) => (
              <div 
                key={i} 
                className="flex items-center gap-3 group cursor-pointer hover:bg-white/5 p-1 rounded-md transition"
                onClick={() => {
                   setCurrentSong(track);
                   setIsPlaying(true);
                   setShowQueue(false);
                }}
              >
                <div className="w-10 h-10 bg-spotifyDark rounded flex-shrink-0 overflow-hidden relative">
                   {track.imageId && <img src={`http://localhost:3000/api/image/${track.imageId}`} className="w-full h-full object-cover" />}
                   <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center">
                     <Play className="w-4 h-4 text-white fill-white" />
                   </div>
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-white text-sm truncate">{track.title || track.name.replace(/\.[^/.]+$/, "")}</span>
                  <span className="text-spotifyLightGray text-xs truncate">{track.artist || "Unknown Artist"}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-white/50 text-sm text-center py-4">No upcoming songs</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {renderQueuePopup()}
      <div className="fixed bottom-0 left-0 right-0 h-24 bg-white/5 backdrop-blur-xl border-t border-white/10 flex items-center justify-between px-4 z-40">
      
      {/* Hidden Audio Element pointing to Node backend */}
      {currentSong && (
        <audio 
          ref={audioRef}
          src={`http://localhost:3000/api/play/${currentSong.id}`}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          onStalled={handleStalled}
          onWaiting={handleStalled}
        />
      )}

      {/* Left: Song Info */}
      <div 
        className="flex items-center gap-4 w-[30%] min-w-[200px] cursor-pointer group"
        onClick={onExpand}
      >
        <div className="relative w-14 h-14 rounded-md overflow-hidden bg-white/5 border border-white/10"
             style={albumArtUrl && albumArtUrl.startsWith('linear-gradient') ? { background: albumArtUrl } : {}}
        >
          {albumArtUrl && !albumArtUrl.startsWith('linear-gradient') && (
            <img src={albumArtUrl} alt="Album Art" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
          )}
          <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center backdrop-blur-sm">
            <Maximize2 className="w-5 h-5 text-white" />
          </div>
        </div>
        <div className="flex flex-col flex-1 overflow-hidden">
          <ScrollingText 
            text={currentSong ? (currentSong.title || currentSong.name.replace(/\.[^/.]+$/, "")) : "Select a Track"} 
            className="text-white text-sm font-semibold hover:underline"
            enableScroll={false}
          />
          <ScrollingText 
            text={currentSong ? (currentSong.artist || "Unknown Artist") : "Master Drive"} 
            className="text-xs text-spotifyLightGray hover:underline"
          />
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); setIsLiked(!isLiked); }} 
          className="p-2 hidden md:block"
        >
          <Heart className={`w-5 h-5 transition duration-300 ${isLiked ? 'text-vibeCyan fill-vibeCyan' : 'text-spotifyLightGray hover:text-white'}`} />
        </button>
      </div>

      {/* Center: Controls */}
      <div className="flex flex-col items-center max-w-[40%] w-full relative">
        {/* Playback Controls Island with Hover Physics */}
        <div className="group/island relative">
          {/* Hover Zone Expansion */}
          <div className="absolute -inset-4 bg-transparent z-0"></div>
          
          <div className="relative z-10 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-full px-8 py-2.5 shadow-2xl flex items-center gap-8 mb-2 group-hover/island:scale-110 group-hover/island:bg-white/[0.18] transition-all duration-500 ease-out">
            <button 
              className={`transition transform active:scale-90 ${isShuffle ? 'text-vibeCyan relative after:absolute after:-bottom-2 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-vibeCyan after:rounded-full' : 'text-spotifyLightGray hover:text-white'}`}
              onClick={() => setIsShuffle(!isShuffle)}
            >
              <Shuffle className="w-5 h-5" />
            </button>
            <button className="text-spotifyLightGray hover:text-white transition transform active:scale-90" onClick={handlePrevSong}><SkipBack className="w-5 h-5 fill-current" /></button>
            
            <button 
              className="w-10 h-10 flex items-center justify-center bg-white rounded-full hover:scale-110 active:scale-95 transition shadow-lg"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-black fill-black" />
              ) : (
                <Play className="w-5 h-5 text-black fill-black ml-0.5" />
              )}
            </button>
            
            <button className="text-spotifyLightGray hover:text-white transition transform active:scale-90" onClick={handleNextSong}><SkipForward className="w-5 h-5 fill-current" /></button>
            <button 
              className={`transition transform active:scale-90 ${repeatState > 0 ? 'text-vibeCyan relative after:absolute after:-bottom-2 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-vibeCyan after:rounded-full' : 'text-spotifyLightGray hover:text-white'}`}
              onClick={() => setRepeatState((prev) => (prev + 1) % 3)}
            >
              <Repeat className="w-5 h-5" />
              {repeatState === 2 && <span className="absolute -top-1 -right-2 text-[8px] font-black bg-vibeCyan text-black rounded-full w-3 h-3 flex items-center justify-center">1</span>}
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-2 w-full max-w-[600px]">
          <span className="text-xs text-spotifyLightGray w-10 text-right">{formatTime(currentTime)}</span>
          <div className="flex-1 group flex items-center">
            <input 
              type="range" 
              min="0" max="100" 
              value={progress} 
              onChange={handleSeekChange}
              onMouseUp={handleSeekEnd}
              onTouchEnd={handleSeekEnd}
              className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:opacity-0 group-hover:[&::-webkit-slider-thumb]:opacity-100 group-hover:accent-vibeCyan"
              style={{
                background: `linear-gradient(to right, #22d3ee ${progress}%, rgba(255,255,255,0.2) ${progress}%)`
              }}
            />
          </div>
          <span className="text-xs text-spotifyLightGray w-10">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Right: Extra Controls */}
      <div className="flex items-center justify-end gap-4 w-[30%] min-w-[200px]">
        <button className="text-spotifyLightGray hover:text-white transition" title="Lyrics Overlay">
          <Mic2 className="w-5 h-5" />
        </button>
        <button 
          className={`transition ${showQueue ? 'text-vibeCyan' : 'text-spotifyLightGray hover:text-white'}`} 
          title="Queue"
          onClick={() => setShowQueue(!showQueue)}
        >
          <ListMusic className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 group w-24">
          <Volume2 className="w-5 h-5 text-spotifyLightGray group-hover:text-white" />
          <input 
            type="range" 
            min="0" max="100" 
            value={volume}
            onChange={handleVolumeChange}
            className="w-full h-1 bg-white/20 rounded-full appearance-none cursor-pointer outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:opacity-0 group-hover:[&::-webkit-slider-thumb]:opacity-100 group-hover:accent-vibeCyan"
             style={{
                background: `linear-gradient(to right, #22d3ee ${volume}%, rgba(255,255,255,0.2) ${volume}%)`
              }}
          />
        </div>
      </div>

    </div>
    </>
  );
};

export default BottomPlayer;
