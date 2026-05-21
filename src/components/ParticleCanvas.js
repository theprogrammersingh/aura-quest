'use client';

import React, { useEffect, useRef } from 'react';

export default function ParticleCanvas({ speedMultiplier = 1, density = 40, color = 'rgba(255, 255, 255,' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle class
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.baseSpeedX = (Math.random() - 0.5) * 0.2;
        this.baseSpeedY = -Math.random() * 0.4 - 0.1;
        this.speedX = this.baseSpeedX * speedMultiplier;
        this.speedY = this.baseSpeedY * speedMultiplier;
        this.opacity = Math.random() * 0.7 + 0.3;
        this.glow = Math.random() > 0.8;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Reset particle if it leaves canvas boundaries
        if (this.y < 0) {
          this.y = canvas.height;
          this.x = Math.random() * canvas.width;
        }
        if (this.x < 0 || this.x > canvas.width) {
          this.x = Math.random() * canvas.width;
          this.y = canvas.height;
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        
        if (this.glow) {
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#8a2be2';
          ctx.fillStyle = `rgba(186, 85, 211, ${this.opacity})`;
        } else {
          ctx.shadowBlur = 0;
          ctx.fillStyle = `${color} ${this.opacity})`;
        }

        ctx.fill();
      }
    }

    // Initialize particle pool
    const particles = Array.from({ length: density }, () => new Particle());

    // Animation Loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((particle) => {
        particle.speedX = particle.baseSpeedX * speedMultiplier;
        particle.speedY = particle.baseSpeedY * speedMultiplier;
        particle.update();
        particle.draw();
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [speedMultiplier, density, color]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.75
      }}
    />
  );
}
