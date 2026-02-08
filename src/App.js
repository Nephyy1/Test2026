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

  // --- LOGIKA DETEKSI JARI ---
  const detectHandGesture = useCallback((landmarks) => {
    if (!landmarks) return null;

    const fingerTips = [8, 12, 16, 20];
    const fingerPips = [6, 10, 14, 18];
    const thumbTip = 4;
    const thumbIp = 3;

    let fingersUp = [];

    // Deteksi Jempol (Logika universal kiri/kanan sederhana)
    // Kita cek jarak X jempol ke kelingking untuk tahu apakah jempol 'keluar'
    if (Math.abs(landmarks[thumbTip].x - landmarks[17].x) > Math.abs(landmarks[thumbIp].x - landmarks[17].x)) {
       fingersUp.push('Thumb');
    }

    fingerTips.forEach((tip, index) => {
      if (landmarks[tip].y < landmarks[fingerPips[index]].y) {
        fingersUp.push(index);
      }
    });

    const count = fingersUp.length;

    // Klasifikasi Gesture
    const isLove = 
      fingersUp.includes('Thumb') && 
      landmarks[8].y < landmarks[6].y && 
      landmarks[20].y < landmarks[18].y && 
      landmarks[12].y > landmarks[10].y && 
      landmarks[16].y > landmarks[14].y;

    if (isLove) return "🤟 I LOVE YOU";
    if (count === 0) return "✊ BATU / ZERO";
    if (count === 1 && fingersUp.includes(0)) return "☝️ SATU";
    if (count === 2 && fingersUp.includes(0) && fingersUp.includes(1)) return "✌️ DUA";
    if (count === 5) return "🖐️ LIMA";
    
    return "Scanning...";
  }, []);

  const onResults = useCallback((results) => {
    if (!canvasRef.current || !webcamRef.current || !webcamRef.current.video) return;

    const video = webcamRef.current.video;
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;

    // Set ukuran canvas sama persis dengan resolusi asli video kamera
    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;

    const ctx = canvasRef.current.getContext('2d');
    ctx.save();
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    // 1. Wajah
    drawConnectors(ctx, results.faceLandmarks, FACEMESH_TESSELATION, { color: '#C0C0C050', lineWidth: 1 });
    if (results.faceLandmarks) setFaceStatus("Wajah Aktif ✅");
    else setFaceStatus("Mencari... ❌");

    // 2. Tangan & Gesture
    let activeGesture = "";
    
    if (results.rightHandLandmarks) {
      drawConnectors(ctx, results.rightHandLandmarks, HAND_CONNECTIONS, { color: '#00FF00', lineWidth: 3 });
      drawLandmarks(ctx, results.rightHandLandmarks, { color: '#FF0000', lineWidth: 1, radius: 3 });
      activeGesture = detectHandGesture(results.rightHandLandmarks);
    } 
    else if (results.leftHandLandmarks) {
      drawConnectors(ctx, results.leftHandLandmarks, HAND_CONNECTIONS, { color: '#00FF00', lineWidth: 3 });
      drawLandmarks(ctx, results.leftHandLandmarks, { color: '#FF0000', lineWidth: 1, radius: 3 });
      activeGesture = detectHandGesture(results.leftHandLandmarks);
    }

    if (activeGesture) setGesture(activeGesture);

    // 3. Pose (Bahu/Badan)
    drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, { color: '#00F2FF', lineWidth: 2 });

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
        // Gunakan resolusi standar 4:3 atau 16:9 agar tidak gepeng di HP
        width: 1280,
        height: 720,
      });
      camera.start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="app-container">
      {/* Container Video Wrapper agar responsif */}
      <div className="video-wrapper">
        <Webcam
          ref={webcamRef}
          className="responsive-video"
          mirrored={true}
          videoConstraints={{ facingMode: "user" }}
        />
        <canvas ref={canvasRef} className="responsive-canvas" />
      </div>
      
      {/* UI Overlay HUD - Terpisah dari wrapper video agar selalu fullscreen */}
      <div className="hud-overlay">
        <div className="hud-header">
          <h2>AI SENSOR CORE</h2>
          <div className="live-pill">● LIVE</div>
        </div>

        <div className="hud-content">
          <div className="hud-card">
            <span className="label">STATUS WAJAH</span>
            <span className="value">{faceStatus}</span>
          </div>
          <div className="hud-card highlight">
            <span className="label">GESTURE TANGAN</span>
            <span className="value big">{gesture}</span>
          </div>
        </div>
        
        <div className="hud-footer">
          <p>TAMPILKAN TANGAN ANDA KE KAMERA</p>
        </div>
      </div>
    </div>
  );
}
