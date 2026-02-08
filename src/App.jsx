import { useState, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
// Import dimatikan sementara untuk isolasi masalah
// import HandManager from './components/HandManager'
// import ParticleSystem from './components/ParticleSystem'
import Interface from './components/Interface'

function App() {
  const [testMode, setTestMode] = useState(true)

  return (
    <div className="w-full h-screen relative flex items-center justify-center">
      
      {/* Teks Debugging Wajib Muncul */}
      <div className="absolute top-10 left-10 z-50 bg-white p-4 text-black">
        <h1 className="font-bold text-xl">DEBUG MODE</h1>
        <p>Jika Anda melihat ini, React berkerja.</p>
        <p>Status: {testMode ? "Active" : "Inactive"}</p>
      </div>

      <Interface isActive={true} />

      {/* Canvas Kosong untuk Test */}
      <Canvas>
        <color attach="background" args={['#111']} />
        <mesh>
            <boxGeometry />
            <meshNormalMaterial />
        </mesh>
      </Canvas>
    </div>
  )
}

export default App
