import React, { useRef, useEffect, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Hands, HAND_CONNECTIONS } from '@mediapipe/hands';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { Camera } from '@mediapipe/camera_utils';
import './App.css';

export default function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [bgColor, setBgColor] = useState('#1e1e1e');
  const [isPinching, setIsPinching] = useState(false);

  // Fungsi triggerAction untuk mengganti warna
  const triggerAction = useCallback(() => {
    const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
    setBgColor(randomColor);
  }, []);

  // Fungsi deteksi pinch
  const detectPinch = useCallback((landmarks) => {
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];

    const distance = Math.sqrt(
      Math.pow(thumbTip.x - indexTip.x, 2) +
      Math.pow(thumbTip.y - indexTip.y, 2)
    );

    // Threshold jarak
    if (distance < 0.05) {
      setIsPinching((prev) => {
        if (!prev) {
          triggerAction();
          return true;
        }
        return prev;
      });
    } else {
      setIsPinching(false);
    }
  }, [triggerAction]);

  // Fungsi callback hasil deteksi
  const onResults = useCallback((results) => {
    if (!canvasRef.current || !webcamRef.current || !webcamRef.current.video) return;

    const videoWidth = webcamRef.current.video.videoWidth;
    const videoHeight = webcamRef.current.video.videoHeight;

    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;

    const canvasCtx = canvasRef.current.getContext('2d');
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      for (const landmarks of results.multiHandLandmarks) {
        drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
          color: '#00FF00',
          lineWidth: 5,
        });
        drawLandmarks(canvasCtx, landmarks, {
          color: '#FF0000',
          lineWidth: 2,
        });
        detectPinch(landmarks);
      }
    } else {
      setIsPinching(false);
    }
    canvasCtx.restore();
  }, [detectPinch]);

  useEffect(() => {
    const hands = new Hands({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      },
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    hands.onResults(onResults);

    if (
      typeof webcamRef.current !== 'undefined' &&
      webcamRef.current !== null
    ) {
      const camera = new Camera(webcamRef.current.video, {
        onFrame: async () => {
          if (webcamRef.current && webcamRef.current.video) {
            await hands.send({ image: webcamRef.current.video });
          }
        },
        width: 1280,
        height: 720,
      });
      camera.start();
    }
    // Baris di bawah ini SANGAT PENTING untuk mengatasi error build Vercel
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="App" style={{ backgroundColor: bgColor }}>
      <header className="App-header">
        <h1>Hand Gesture Control</h1>
        <p>{isPinching ? "👌 PINCH DETECTED!" : "🖐 Open Hand"}</p>

        <div className="cam-container">
          <Webcam
            ref={webcamRef}
            style={{
              position: "absolute",
              marginLeft: "auto",
              marginRight: "auto",
              left: 0,
              right: 0,
              textAlign: "center",
              zIndex: 9,
              width: 320,
              height: 240,
            }}
          />

          <canvas
            ref={canvasRef}
            style={{
              position: "absolute",
              marginLeft: "auto",
              marginRight: "auto",
              left: 0,
              right: 0,
              textAlign: "center",
              zIndex: 9,
              width: 320,
              height: 240,
            }}
          />
        </div>
      </header>
    </div>
  );
              }
                                
