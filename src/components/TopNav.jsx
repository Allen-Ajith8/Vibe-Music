import React, { useMemo } from 'react';
import { Search, Home, Library } from 'lucide-react';

const TopNav = ({ currentView, setCurrentView }) => {
  const tabs = useMemo(() => [
    { label: 'Search', icon: Search, id: 'Search' },
    { label: 'Home', icon: Home, id: 'Home' },
    { label: 'Library', icon: Library, id: 'Library', badge: 2 }
  ], []);

  const activeIdx = currentView === 'PlaylistDetail' ? 2 : tabs.findIndex(t => t.id === currentView);

  const handleTabClick = (idx, id) => {
    if (id === 'Home' && currentView === 'Home') {
      window.location.reload();
      return;
    }
    setCurrentView(id);
  };

  return (
    <div 
      className="
        fixed top-6 left-1/2 z-50
        flex p-1.5 rounded-full 
        bg-white/10 backdrop-blur-2xl border border-white/10
        transition-all duration-[400ms]
        -translate-x-1/2 hover:-translate-x-1/2 hover:scale-[1.08] hover:border-white/20
        group shadow-xl
      "
      style={{ transitionTimingFunction: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}
    >
      {tabs.map((tab, idx) => (
        <button
          key={idx}
          onClick={() => handleTabClick(idx, tab.id)}
          className={`
            relative z-20 flex items-center justify-center h-10 w-32 gap-2
            text-sm font-bold rounded-full cursor-pointer transition-colors duration-200 active:scale-95
            ${activeIdx === idx ? 'text-black' : 'text-white hover:text-white/80'}
          `}
        >
          <tab.icon className="w-4 h-4" />
          <span>{tab.label}</span>
          {tab.badge && (
            <span className={`
              absolute top-0 right-1 flex items-center justify-center 
              w-4 h-4 text-[10px] font-bold rounded-full transition-colors duration-200
              ${activeIdx === idx ? 'bg-black text-vibeCyan' : 'bg-vibeCyan text-black'}
            `}>
              {tab.badge}
            </span>
          )}
        </button>
      ))}

      {/* Glider */}
      <div 
        className="
          absolute top-1.5 bottom-1.5 w-32 bg-vibeCyan z-10 rounded-full 
          transition-transform duration-300 ease-out shadow-[0_0_10px_rgba(34,211,238,0.4)]
          group-hover:shadow-[0_0_25px_rgba(34,211,238,1)]
        "
        style={{ transform: `translateX(${activeIdx * 100}%)` }}
      />
    </div>
  );
};

export default TopNav;
