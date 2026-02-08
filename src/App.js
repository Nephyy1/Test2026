import React, { useRef, useEffect, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Holistic, POSE_CONNECTIONS, HAND_CONNECTIONS, FACEMESH_TESSELATION } from '@mediapipe/holistic';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import './App.css';

export default function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [gesture, setGesture] = useState("Menunggu Tangan...");
  const [faceStatus, setFaceStatus] = useState("Mencari Wajah...");

  // --- LOGIKA DETEKSI JARI (Finger Counting) ---
  const detectHandGesture = useCallback((landmarks) => {
    if (!landmarks) return null;

    // Titik Jari (Tip vs PIP/Sendi Bawah)
    const fingerTips = [8, 12, 16, 20]; // Telunjuk, Tengah, Manis, Kelingking
    const fingerPips = [6, 10, 14, 18];
    const thumbTip = 4;
    const thumbIp = 3;

    let fingersUp = [];

    // Cek Jempol (Anggap tangan kanan/kiri sederhana: Jempol terbuka jika x Tip < x IP)
    // Logika ini bisa disesuaikan lagi untuk akurasi kiri/kanan
    if (landmarks[thumbTip].x < landmarks[thumbIp].x) fingersUp.push('Thumb');

    // Cek 4 Jari Lainnya (Y Tip < Y Pip berarti jari naik)
    fingerTips.forEach((tip, index) => {
      if (landmarks[tip].y < landmarks[fingerPips[index]].y) {
        fingersUp.push(index); // Simpan index jari yg naik
      }
    });

    const count = fingersUp.length;

    // --- KLASIFIKASI GESTURE ---
    
    // 1. LOVE Sign (🤟 - I Love You: Jempol, Telunjuk, Kelingking naik)
    const isLove = 
      fingersUp.includes('Thumb') && 
      landmarks[8].y < landmarks[6].y && // Telunjuk Naik
      landmarks[20].y < landmarks[18].y && // Kelingking Naik
      landmarks[12].y > landmarks[10].y && // Tengah Turun
      landmarks[16].y > landmarks[14].y;   // Manis Turun

    if (isLove) return "🤟 I LOVE YOU";

    // 2. Angka & Simbol Lain
    if (count === 0) return "✊ BATU / ZERO";
    if (count === 1 && fingersUp.includes(0)) return "☝️ SATU"; // Hanya telunjuk
    if (count === 2 && fingersUp.includes(0) && fingersUp.includes(1)) return "✌️ DUA / PEACE";
    if (count === 5) return "🖐️ LIMA / HAI";
    
    return "Scanning...";
  }, []);

  const onResults = useCallback((results) => {
    if (!canvasRef.current || !webcamRef.current || !webcamRef.current.video) return;

    const videoWidth = webcamRef.current.video.videoWidth;
    const videoHeight = webcamRef.current.video.videoHeight;
    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;

    const ctx = canvasRef.current.getContext('2d');
    ctx.save();
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    // 1. Gambar Wajah (Mesh)
    drawConnectors(ctx, results.faceLandmarks, FACEMESH_TESSELATION, { color: '#C0C0C070', lineWidth: 1 });
    if (results.faceLandmarks) setFaceStatus("Wajah Terdeteksi ✅");
    else setFaceStatus("Wajah Hilang ❌");

    // 2. Gambar Tangan & Deteksi Gesture
    let activeGesture = "Tidak ada tangan";
    
    // Prioritas Tangan Kanan
    if (results.rightHandLandmarks) {
      drawConnectors(ctx, results.rightHandLandmarks, HAND_CONNECTIONS, { color: '#00FF00', lineWidth: 5 });
      drawLandmarks(ctx, results.rightHandLandmarks, { color: '#FF0000', lineWidth: 2 });
      activeGesture = detectHandGesture(results.rightHandLandmarks);
    } 
    // Jika tidak ada kanan, cek kiri
    else if (results.leftHandLandmarks) {
      drawConnectors(ctx, results.leftHandLandmarks, HAND_CONNECTIONS, { color: '#00FF00', lineWidth: 5 });
      drawLandmarks(ctx, results.leftHandLandmarks, { color: '#FF0000', lineWidth: 2 });
      activeGesture = detectHandGesture(results.leftHandLandmarks);
    }

    if (activeGesture) setGesture(activeGesture);

    // 3. Pose Tubuh
    drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, { color: '#00F2FF', lineWidth: 4 });

    ctx.restore();
  }, [detectHandGesture]);

  useEffect(() => {
    const holistic = new Holistic({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`,
    });

    holistic.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    holistic.onResults(onResults);

    if (webcamRef.current && webcamRef.current.video) {
      const camera = new Camera(webcamRef.current.video, {
        onFrame: async () => {
          if (webcamRef.current && webcamRef.current.video) {
            await holistic.send({ image: webcamRef.current.video });
          }
        },
        width: 1280,
        height: 720,
      });
      camera.start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="holistic-container">
      <Webcam
        ref={webcamRef}
        className="webcam-bg"
        mirrored={true}
        videoConstraints={{ facingMode: "user" }}
      />
      <canvas ref={canvasRef} className="output-canvas" />
      
      {/* UI Overlay HUD */}
      <div className="hud-overlay">
        <div className="hud-header">
          <h2>AI SENSOR CORE</h2>
          <div className="live-indicator">● LIVE</div>
        </div>

        <div className="hud-stats">
          <div className="stat-box">
            <span className="label">FACE STATUS</span>
            <span className="value">{faceStatus}</span>
          </div>
          <div className="stat-box glow">
            <span className="label">HAND SIGN</span>
            <span className="value big">{gesture}</span>
          </div>
        </div>
        
        <div className="hud-footer">
          <p>COBA GESTURE: ☝️ (1), ✌️ (2), 🖐️ (5), ✊ (0), 🤟 (LOVE)</p>
        </div>
      </div>
    </div>
  );
        }
        
