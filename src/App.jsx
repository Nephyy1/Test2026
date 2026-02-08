import { useState, useRef, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import HandManager from './components/HandManager'
import ParticleSystem from './components/ParticleSystem'
import Interface from './components/Interface'

const Loader = () => (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
    <div className="text-cyan-400 font-mono text-sm animate-pulse tracking-widest">
      INITIALIZING AI SYSTEMS...
    </div>
  </div>
)

function App() {
  const [isReady, setIsReady] = useState(false)
  const handRef = useRef(null)

  const handleHandUpdate = (landmarks) => {
    handRef.current = landmarks
    if (landmarks && !isReady) setIsReady(true)
    if (!landmarks && isReady) setIsReady(false)
  }

  return (
    <div className="w-full h-screen bg-black overflow-hidden relative">
      <Suspense fallback={<Loader />}>
        <HandManager onHandUpdate={handleHandUpdate} />
      </Suspense>

      <Interface isActive={isReady} />
      
      <Canvas
        camera={{ position: [0, 0, 12], fov: 45 }}
        dpr={[1, 2]} 
        gl={{ 
          antialias: false, 
          alpha: false,
          powerPreference: "high-performance" 
        }}
      >
        <color attach="background" args={['#020205']} />
        
        <Suspense fallback={null}>
          <ParticleSystem handRef={handRef} />
        </Suspense>
        
        <fog attach="fog" args={['#020205', 5, 25]} />
      </Canvas>
    </div>
  )
}

export default App
