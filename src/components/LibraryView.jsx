import React from 'react';

const AnimatedPlaylistCard = ({ title, count, img1, img2, img3, onClick }) => {
  return (
    <div onClick={onClick} className="relative group flex flex-col items-center justify-center p-4 cursor-pointer">
      <div className="file relative w-60 h-40 origin-bottom [perspective:1500px] z-10 transition-transform duration-300 hover:scale-[1.03]">
        
        {/* Back folder side */}
        <div className="work-5 bg-cyan-600 w-full h-full origin-top rounded-2xl rounded-tl-none group-hover:shadow-[0_20px_40px_rgba(0,0,0,.2)] transition-all ease duration-300 relative after:absolute after:content-[''] after:bottom-[99%] after:left-0 after:w-20 after:h-4 after:bg-cyan-600 after:rounded-t-2xl before:absolute before:content-[''] before:-top-[15px] before:left-[75.5px] before:w-4 before:h-4 before:bg-cyan-600 before:[clip-path:polygon(0_35%,0%_100%,50%_100%);]"></div>
        
        {/* Layer 3 Poster (Back) */}
        <div className="work-4 absolute inset-1 bg-zinc-800 rounded-2xl transition-all ease duration-300 origin-bottom select-none group-hover:[transform:rotateX(-20deg)_translateY(-10px)] overflow-hidden shadow-lg border border-white/5">
           <img src={img1} className="w-full h-full object-cover opacity-60" alt="Track 3" />
        </div>
        
        {/* Layer 2 Poster (Middle) */}
        <div className="work-3 absolute inset-1 bg-zinc-700 rounded-2xl transition-all ease duration-300 origin-bottom group-hover:[transform:rotateX(-30deg)_translateY(-15px)] overflow-hidden shadow-lg border border-white/10">
           <img src={img2} className="w-full h-full object-cover opacity-80" alt="Track 2" />
        </div>
        
        {/* Layer 1 Poster (Front) */}
        <div className="work-2 absolute inset-1 bg-zinc-600 rounded-2xl transition-all ease duration-300 origin-bottom group-hover:[transform:rotateX(-45deg)_translateY(-20px)] overflow-hidden shadow-2xl border border-white/20">
           <img src={img3} className="w-full h-full object-cover" alt="Track 1" />
        </div>
        
        {/* Front folder side */}
        <div className="work-1 absolute bottom-0 bg-gradient-to-t from-cyan-600 to-cyan-400 w-full h-[156px] rounded-2xl rounded-tr-none after:absolute after:content-[''] after:bottom-[99%] after:right-0 after:w-[146px] after:h-[16px] after:bg-cyan-400 after:rounded-t-2xl before:absolute before:content-[''] before:-top-[10px] before:right-[142px] before:w-3 before:h-3 before:bg-cyan-400 before:[clip-path:polygon(100%_14%,50%_100%,100%_100%);] transition-all ease-out duration-300 origin-bottom flex items-end group-hover:shadow-[inset_0_20px_40px_#0891b2,_inset_0_-20px_40px_#06b6d4] group-hover:[transform:rotateX(-55deg)_translateY(2px)] shadow-[0_-5px_15px_rgba(0,0,0,0.5)] border border-white/10">
           {/* Subtle glass reflection on the front flap */}
           <div className="w-full h-full bg-gradient-to-b from-white/10 to-transparent rounded-2xl opacity-50 pointer-events-none"></div>
        </div>
        
      </div>
      
      {/* Playlist Meta */}
      <h3 className="text-xl font-bold mt-8 text-white group-hover:text-vibeCyan transition-colors">{title}</h3>
      <p className="text-xs font-bold text-white/40 mt-1 uppercase tracking-widest">Playlist • {count} Tracks</p>
    </div>
  );
};

const LibraryView = ({ userPlaylists = [], masterTracks = [], setCurrentView, setActivePlaylistId, onCreatePlaylist }) => {

  const getPlaylistImages = (trackIds) => {
    const images = trackIds
      .map(id => masterTracks.find(t => t.id === id))
      .filter(t => t && t.imageId)
      .map(t => `http://localhost:3000/api/image/${t.imageId}`);
    
    // Fallbacks
    while(images.length < 3) {
      if (images.length === 0) images.push('https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=200');
      else if (images.length === 1) images.push('https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=200');
      else images.push('https://images.unsplash.com/photo-1493225457124-a1a2a5ea3a0e?auto=format&fit=crop&q=80&w=200');
    }
    return images.slice(0, 3);
  };

  const handlePlaylistClick = (id) => {
    setActivePlaylistId(id);
    setCurrentView('PlaylistDetail');
  };
  const mockPlaylists = [
    { 
      title: 'Chill Vibes 2026', 
      images: [
        'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&q=80&w=200',
        'https://images.unsplash.com/photo-1493225457124-a1a2a5ea3a0e?auto=format&fit=crop&q=80&w=200',
        'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=200'
      ] 
    },
    { 
      title: 'Focus Sessions', 
      images: [
        'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=200',
        'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=200',
        'https://images.unsplash.com/photo-1458560871784-56d23406c091?auto=format&fit=crop&q=80&w=200'
      ] 
    },
    { 
      title: 'Late Night Drive', 
      images: [
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=200',
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
        'https://images.unsplash.com/photo-1493225457124-a1a2a5ea3a0e?auto=format&fit=crop&q=80&w=200'
      ] 
    },
    { 
      title: 'Workout Mix', 
      images: [
        'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=200',
        'https://images.unsplash.com/photo-1458560871784-56d23406c091?auto=format&fit=crop&q=80&w=200',
        'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=200'
      ] 
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-[#1b1b1b] to-spotifyBlack rounded-lg mr-2 mt-2 p-8 pb-24 border border-white/5 h-[calc(100vh-6.5rem)]">
      
      <div className="mb-12 mt-4 ml-6">
        <h1 className="text-4xl font-black tracking-tight text-white mb-2">Your Library</h1>
        <p className="text-spotifyLightGray font-medium">Your curated collection and saved mixes.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-y-16 gap-x-8 mt-16 px-4">
        {/* Create New Playlist Card */}
        <AnimatedPlaylistCard 
          title="Create New Playlist"
          count={0}
          img1="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=200"
          img2="https://images.unsplash.com/photo-1493225457124-a1a2a5ea3a0e?auto=format&fit=crop&q=80&w=200"
          img3="https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=200"
          onClick={onCreatePlaylist}
        />

        {userPlaylists.map((playlist) => {
          const images = getPlaylistImages(playlist.trackIds);
          return (
            <AnimatedPlaylistCard 
              key={playlist.id}
              title={playlist.title}
              count={playlist.trackIds.length}
              img1={images[2]}
              img2={images[1]}
              img3={images[0]}
              onClick={() => handlePlaylistClick(playlist.id)}
            />
          );
        })}
      </div>

    </div>
  );
};

export default LibraryView;
