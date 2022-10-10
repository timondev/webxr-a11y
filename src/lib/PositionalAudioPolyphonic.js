import * as THREE from 'three'

class PositionalAudioPolyphonic extends THREE.Object3D {
  constructor (listener, poolSize) {
    super()
    this.listener = listener
    this.context = listener.context

    this.poolSize = poolSize || 5
    for (let i = 0; i < this.poolSize; i++) {
      this.children.push(new THREE.PositionalAudio(listener))
    }
  }

  setBuffer (buffer) {
    this.children.forEach(sound => {
      sound.setBuffer(buffer)
    })
  }

  play () {
    let found = false
    for (let i = 0; i < this.children.length; i++) {
      const sound = this.children[i]
      if (!sound.isPlaying && sound.buffer && !found) {
        sound.play()
        sound.isPaused = false
        found = true
        continue
      }
    }

    if (!found) {
      console.warn('All the sounds are playing. If you need to play more sounds simultaneously consider increasing the pool size')
    }
  }
}

export { PositionalAudioPolyphonic }
