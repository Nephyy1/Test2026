import { useState, useRef, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import HandManager from './components/HandManager'
import ParticleSystem from './components/ParticleSystem'
import Interface from './components/Interface'

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
          <HandManager onHandUpdate={handleHandUpdate} />
          <ParticleSystem handRef={handRef} />
        </Suspense>
        
        <fog attach="fog" args={['#020205', 5, 25]} />
      </Canvas>
    </div>
  )
}

export default App
