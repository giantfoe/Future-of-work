'use client'

import React, { useCallback, useMemo } from 'react'
import Particles from 'react-tsparticles'
import { loadSlim } from 'tsparticles-slim' // or loadFull, loadBasic, etc.
import type { Engine } from 'tsparticles-engine'

const FuturisticBackground: React.FC = () => {
  const particlesInit = useCallback(async (engine: Engine) => {
    // console.log(engine)
    // you can initiate the tsParticles instance (engine) here, adding custom shapes or presets
    // this loads the tsparticles package bundle, it's good to keep it here to shape the bundle
    await loadSlim(engine) // or loadFull(engine), loadBasic(engine) if you need more features
  }, [])

  const particlesLoaded = useCallback(async (container: any) => {
    // await console.log(container)
  }, [])

  const particleOptions = useMemo(() => ({
    background: {
      color: {
        value: 'transparent', // Make background transparent so page background shows
      },
    },
    fpsLimit: 60,
    interactivity: {
      events: {
        onClick: {
          enable: true,
          mode: 'push',
        },
        onHover: {
          enable: true,
          mode: 'repulse', // Or 'grab', 'bubble'
        },
        resize: true,
      },
      modes: {
        push: {
          quantity: 4,
        },
        repulse: {
          distance: 100,
          duration: 0.4,
        },
      },
    },
    particles: {
      color: {
        value: '#ffffff',
      },
      links: {
        color: '#ffffff',
        distance: 150,
        enable: false, // No links for a starry sky
        opacity: 0.5,
        width: 1,
      },
      collisions: {
        enable: true,
      },
      move: {
        direction: 'none',
        enable: true,
        outModes: {
          default: 'bounce',
        },
        random: false,
        speed: 0.5, // Slow movement for stars
        straight: false,
      },
      number: {
        density: {
          enable: true,
          area: 800, // Adjust for more/less stars
        },
        value: 150, // Number of particles
      },
      opacity: {
        value: {
          min: 0.1,
          max: 0.7
        },
        animation: {
          enable: true,
          speed: 1,
          minimumValue: 0.1,
          sync: false
        }
      },
      shape: {
        type: 'circle',
      },
      size: {
        value: { min: 1, max: 3 },
        animation: {
          enable: true,
          speed: 2,
          minimumValue: 0.5,
          sync: false
        }
      },
    },
    detectRetina: true,
  }), [])

  return (
    <>
      {/* Particles - Middle Layer (z-10 to be above gradient but below text/cards) */}
      <div className="fixed inset-0 z-10 pointer-events-none">
        <Particles
          id="tsparticles"
          init={particlesInit}
          loaded={particlesLoaded}
          options={particleOptions as any} // Type assertion to avoid deep type checking issues
        />
      </div>
    </>
  )
}

export default FuturisticBackground