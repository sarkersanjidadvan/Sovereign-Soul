
import React from 'react';

interface VisualEffectsProps {
  isSoulless: boolean;
  activationIcon: 'skeleton' | 'snowflake' | 'lightning' | null;
}

const VisualEffects: React.FC<VisualEffectsProps> = ({ isSoulless, activationIcon }) => {
  if (!activationIcon) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      <div className="overlay-container">
        {/* Unique key forces a fresh mount and animation reset, eliminating "buggy" jumps */}
        <div key={activationIcon} className="overlay-icon-wrap flex items-center justify-center">
          {activationIcon === 'lightning' && (
            <i className={`fa-solid fa-bolt-lightning text-[220px] sm:text-[280px] drop-shadow-[0_0_40px_rgba(249,115,22,0.6)] ${isSoulless ? 'text-red-600' : 'text-orange-500'}`}></i>
          )}

          {activationIcon === 'skeleton' && (
            <i className="fa-solid fa-skull text-[220px] sm:text-[280px] text-red-600 drop-shadow-[0_0_40px_rgba(220,38,38,0.6)]"></i>
          )}

          {activationIcon === 'snowflake' && (
            <i className="fa-solid fa-snowflake text-[220px] sm:text-[280px] text-blue-400 drop-shadow-[0_0_40px_rgba(96,165,250,0.6)]"></i>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisualEffects;
