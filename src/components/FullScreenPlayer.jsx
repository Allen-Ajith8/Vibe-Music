import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, 
  ChevronDown, Heart, Volume2, Music2
} from 'lucide-react';
import ScrollingText from './ScrollingText';
import useColorExtractor from '../hooks/useColorExtractor';

const FullScreenPlayer = ({ isExpanded, onClose, isPlaying, setIsPlaying, currentSong, setCurrentSong, playlist, currentTime, setCurrentTime, duration, setDuration, albumArtUrl, audioRef, lyricsString }) => {
  const [progress, setProgress] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [parsedLyrics, setParsedLyrics] = useState([]);
  const [activeLyricIndex, setActiveLyricIndex] = useState(-1);
  const lyricsContainerRef = useRef(null);

  // Dynamic Adaptive Aura
  const auraColor = useColorExtractor(albumArtUrl);

  // Calculate progress
  useEffect(() => {
    if (duration > 0) {
      setProgress((currentTime / duration) * 100);
    }
  }, [currentTime, duration]);

  // Parse LRC lyrics
  useEffect(() => {
    if (!lyricsString) {
      setParsedLyrics([]);
      return;
    }
    const lines = lyricsString.split('\n');
    const parsed = [];
    for (const line of lines) {
      const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/);
      if (match) {
        const minutes = parseInt(match[1]);
        const seconds = parseInt(match[2]);
        const ms = parseInt(match[3]);
        const time = minutes * 60 + seconds + ms / (match[3].length === 3 ? 1000 : 100);
        parsed.push({ time, text: match[4].trim() });
      }
    }
    setParsedLyrics(parsed);
  }, [lyricsString]);

  // Find active lyric line
  useEffect(() => {
    if (parsedLyrics.length === 0) return;
    let activeIdx = -1;
    for (let i = 0; i < parsedLyrics.length; i++) {
      if (currentTime >= parsedLyrics[i].time) {
        activeIdx = i;
      } else {
        break;
      }
    }
    setActiveLyricIndex(activeIdx);
  }, [currentTime, parsedLyrics]);

  // Auto-scroll lyrics
  useEffect(() => {
    if (activeLyricIndex >= 0 && lyricsContainerRef.current) {
      const activeEl = lyricsContainerRef.current.children[activeLyricIndex];
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeLyricIndex]);

  const handleSeek = (e) => {
    const newProgress = e.target.value;
    if (audioRef.current && duration) {
      audioRef.current.currentTime = (newProgress / 100) * duration;
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  if (!isExpanded) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col animate-slideUp transition-all duration-[1500ms] ease-in-out bg-black"
      style={{
        backgroundImage: `radial-gradient(circle at 50% 50%, ${auraColor} 0%, #000 70%)`
      }}
    >
      
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-transparent">
        <button onClick={onClose} className="text-white/70 hover:text-white transition">
          <ChevronDown className="w-8 h-8" />
        </button>
        <div className="text-center w-64 overflow-hidden flex flex-col items-center">
          <div className="logo-glow mb-1">
             <Music2 className="text-vibeCyan w-6 h-6" />
          </div>
          <ScrollingText 
            text={currentSong ? (currentSong.artist || "Unknown Artist") : "VibeMusic"} 
            className="text-xs font-semibold text-white/70"
          />
        </div>
        <button 
          onClick={() => setIsLiked(!isLiked)}
          className="p-2"
        >
          <Heart className={`w-6 h-6 transition duration-300 ${isLiked ? 'text-vibeCyan fill-vibeCyan' : 'text-white/50 hover:text-white'}`} />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-12 px-12 overflow-hidden">
        
        {/* Album Art with colored shadow */}
        <div 
          className="w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-2xl overflow-hidden shadow-2xl flex-shrink-0 relative border border-white/5 transition-transform duration-700 hover:scale-[1.02]"
          style={{ boxShadow: `0 25px 50px -12px ${auraColor.replace('0.25', '0.4')}` }}
        >
          {albumArtUrl && !albumArtUrl.startsWith('linear-gradient') ? (
            <img src={albumArtUrl} alt="Album Art" className={`w-full h-full object-cover ${isPlaying ? 'scale-105' : 'scale-100'} transition-transform duration-[2000ms]`} />
          ) : (
            <div 
              className="w-full h-full flex items-center justify-center text-6xl font-bold text-white/10"
              style={albumArtUrl && albumArtUrl.startsWith('linear-gradient') ? { background: albumArtUrl } : { background: 'rgba(255,255,255,0.03)' }}
            >
              ♪
            </div>
          )}
        </div>

        {/* Glassmorphic Lyrics Panel */}
        <div className="flex-1 max-w-xl h-[70vh] rounded-3xl backdrop-blur-3xl bg-white/5 border border-white/10 p-8 overflow-hidden flex flex-col shadow-2xl">
          <div className="flex-1 overflow-y-auto no-scrollbar mask-fade-y" ref={lyricsContainerRef}>
            {parsedLyrics.length > 0 ? (
              parsedLyrics.map((lyric, i) => (
                <p 
                  key={i} 
                  className={`py-3 text-xl md:text-3xl font-extrabold transition-all duration-700 cursor-pointer origin-left ${
                    i === activeLyricIndex 
                      ? 'text-vibeCyan scale-105 opacity-100' 
                      : 'text-white/20 hover:text-white/40'
                  }`}
                  onClick={() => {
                    if (audioRef.current) audioRef.current.currentTime = lyric.time;
                  }}
                >
                  {lyric.text || '♪'}
                </p>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <Music2 className="w-12 h-12 text-white/10 animate-pulse" />
                <p className="text-white/15 text-2xl font-bold tracking-tight uppercase">Lyrics Coming Soon</p>
                <p className="text-white/5 text-sm uppercase tracking-widest">Enhanced Playback Experience</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="px-8 pb-12 pt-4">
        {/* Song Title */}
        <div className="text-center mb-8 max-w-xl mx-auto overflow-hidden">
          <ScrollingText 
            text={currentSong ? (currentSong.title || currentSong.name.replace(/\.[^/.]+$/, "")) : "No Track Selected"} 
            className="text-3xl font-black text-white tracking-tight"
            enableScroll={false}
          />
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-4 mb-6 max-w-3xl mx-auto group">
          <span className="text-xs font-mono text-white/40 w-12 text-right">{formatTime(currentTime)}</span>
          <div className="flex-1">
            <input 
              type="range" 
              min="0" max="100" 
              value={progress} 
              onChange={handleSeek}
              className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:scale-0 group-hover:[&::-webkit-slider-thumb]:scale-100 transition-all group-hover:bg-white/20"
              style={{
                background: `linear-gradient(to right, #22d3ee ${progress}%, rgba(255,255,255,0.1) ${progress}%)`
              }}
            />
          </div>
          <span className="text-xs font-mono text-white/40 w-12">{formatTime(duration)}</span>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-10">
          <button className="text-white/30 hover:text-white transition"><Shuffle className="w-5 h-5" /></button>
          <button className="text-white hover:scale-110 active:scale-90 transition"><SkipBack className="w-7 h-7 fill-current" /></button>
          
          <button 
            className="w-16 h-16 flex items-center justify-center bg-white rounded-full hover:scale-105 active:scale-95 transition shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 text-black fill-black" />
            ) : (
              <Play className="w-7 h-7 text-black fill-black ml-1" />
            )}
          </button>
          
          <button className="text-white hover:scale-110 active:scale-90 transition"><SkipForward className="w-7 h-7 fill-current" /></button>
          <button className="text-white/30 hover:text-white transition"><Repeat className="w-5 h-5" /></button>
        </div>
      </div>

    </div>
  );
};

export default FullScreenPlayer;
