const Interface = ({ isActive }) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-6 md:p-10">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-neon font-mono text-xl md:text-2xl tracking-[0.2em] uppercase font-bold drop-shadow-[0_0_10px_rgba(0,243,255,0.5)]">
            Lumina Core
          </h1>
          <div className="flex items-center mt-2 gap-2">
            <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="text-xs font-mono text-white/60">
              {isActive ? 'SENSOR ONLINE' : 'WAITING FOR INPUT'}
            </span>
          </div>
        </div>
      </div>

      {!isActive && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center w-full max-w-md px-4">
          <div className="border border-white/10 bg-black/40 backdrop-blur-md p-6 rounded-lg">
            <p className="text-white font-light text-lg mb-4">Initialize Neural Link</p>
            <p className="text-white/50 text-sm font-mono leading-relaxed">
              Allow camera access to begin.
              <br/>
              Use your hand to shape the light.
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col items-end space-y-2">
        <div className="text-right">
           <p className="text-[10px] md:text-xs font-mono text-neon/70 bg-black/50 p-2 rounded border border-neon/20">
            [GESTURE_01]: INDEX FINGER &rarr; ATTRACT
           </p>
        </div>
        <div className="text-right">
           <p className="text-[10px] md:text-xs font-mono text-neon/70 bg-black/50 p-2 rounded border border-neon/20">
            [GESTURE_02]: OPEN PALM &rarr; DISPERSE
           </p>
        </div>
        <div className="text-right">
           <p className="text-[10px] md:text-xs font-mono text-love/80 bg-black/50 p-2 rounded border border-love/20 animate-pulse">
            [SECRET]: KOREAN HEART &rarr; ???
           </p>
        </div>
      </div>
    </div>
  )
}

export default Interface
