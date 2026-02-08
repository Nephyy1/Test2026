import { useEffect, useRef } from 'react'
import { Hands } from '@mediapipe/hands'
import { Camera } from '@mediapipe/camera_utils'

const HandManager = ({ onHandUpdate }) => {
  const videoRef = useRef(document.createElement('video'))

  useEffect(() => {
    const hands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    })

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    })

    hands.onResults((results) => {
      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        onHandUpdate(results.multiHandLandmarks[0])
      } else {
        onHandUpdate(null)
      }
    })

    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        await hands.send({ image: videoRef.current })
      },
      width: 640,
      height: 480,
    })

    camera.start()

    return () => {
      camera.stop()
      hands.close()
    }
  }, [onHandUpdate])

  return null
}

export default HandManager
