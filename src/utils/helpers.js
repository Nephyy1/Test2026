import * as THREE from 'three'

export const generateTextCoordinates = (text, width, height, particleCount) => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  canvas.width = width
  canvas.height = height

  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, width, height)
  
  const fontSize = width < 500 ? 60 : 100
  ctx.font = `900 ${fontSize}px monospace`
  ctx.fillStyle = 'white'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, width / 2, height / 2)

  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data
  const coordinates = []

  for (let y = 0; y < height; y += 4) {
    for (let x = 0; x < width; x += 4) {
      const index = (y * width + x) * 4
      if (data[index] > 128) {
        const posX = (x / width - 0.5) * 20
        const posY = -(y / height - 0.5) * 10 
        coordinates.push(posX, posY, 0)
      }
    }
  }

  const output = new Float32Array(particleCount * 3)
  for (let i = 0; i < particleCount; i++) {
    const sourceIndex = (i % (coordinates.length / 3)) * 3
    output[i * 3] = coordinates[sourceIndex]
    output[i * 3 + 1] = coordinates[sourceIndex + 1]
    output[i * 3 + 2] = coordinates[sourceIndex + 2]
  }

  return output
}

export const analyzeGesture = (landmarks) => {
  if (!landmarks) return { type: 'IDLE', position: null }

  const thumbTip = landmarks[4]
  const indexTip = landmarks[8]
  const middleTip = landmarks[12]
  const wrist = landmarks[0]

  const pinchDist = Math.hypot(thumbTip.x - indexTip.x, thumbTip.y - indexTip.y)
  
  if (pinchDist < 0.05) {
    return { type: 'LOVE', position: null }
  }

  const palmDist = Math.hypot(middleTip.x - wrist.x, middleTip.y - wrist.y)
  
  if (palmDist > 0.35) {
    const centerX = (landmarks[0].x + landmarks[5].x + landmarks[17].x) / 3
    const centerY = (landmarks[0].y + landmarks[5].y + landmarks[17].y) / 3
    return { 
      type: 'OPEN_PALM', 
      position: { x: centerX, y: centerY } 
    }
  }

  return { 
    type: 'POINT', 
    position: { x: indexTip.x, y: indexTip.y } 
  }
      }
