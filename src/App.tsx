import React, { useEffect, useRef } from "react";
import image from "./assets/Framee.png"

interface ParticleHoverEffectProps {
  width?: number;
  height?: number;
  imageUrl: string; // Image URL as a prop for flexibility
}

const ParticleHoverEffect: React.FC<ParticleHoverEffectProps> = ({
  width = 400,
  height = 400,
  imageUrl,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  let particles: {
    x: number;
    y: number;
    originalX: number;
    originalY: number;
    vx: number;
    vy: number;
    color: string;
  }[] = [];

  // Configurable variables
  const particleSize = 3;
  const spacing = 4;
  const maxMouseEffectDistance = 80;
  const particleFriction = 0.85;
  const attractionStrength = 0.04;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas actual resolution correctly
    canvas.width = width;
    canvas.height = height;

    const img = new Image();
    img.crossOrigin = "anonymous"; // Fix CORS issue for external images
    img.src = imageUrl;
    img.onload = () => {
      extractParticles(img, ctx, canvas);
      animate();
    };
  }, [width, height, imageUrl]); // Re-run when dimensions or image change

  const extractParticles = (
    image: HTMLImageElement,
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement
  ) => {
    particles = []; // Reset particles to avoid duplication

    const offscreenCanvas = document.createElement("canvas");
    const offCtx = offscreenCanvas.getContext("2d");
    if (!offCtx) return;

    offscreenCanvas.width = image.width;
    offscreenCanvas.height = image.height;
    offCtx.drawImage(image, 0, 0);

    const imageData = offCtx.getImageData(0, 0, image.width, image.height);
    const data = imageData.data;

    const scaleX = canvas.width / image.width;
    const scaleY = canvas.height / image.height;

    for (let y = 0; y < image.height; y += spacing) {
      for (let x = 0; x < image.width; x += spacing) {
        const index = (y * image.width + x) * 4;
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];
        const alpha = data[index + 3];

        if (alpha > 128) {
          // Only create particles where image is visible
          particles.push({
            x: x * scaleX,
            y: y * scaleY,
            originalX: x * scaleX,
            originalY: y * scaleY,
            vx: 0,
            vy: 0,
            color: `rgb(${r},${g},${b})`,
          });
        }
      }
    }
  };

  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((particle) => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vx *= particleFriction;
      particle.vy *= particleFriction;

      const dx = particle.originalX - particle.x;
      const dy = particle.originalY - particle.y;
      particle.vx += dx * attractionStrength;
      particle.vy += dy * attractionStrength;

      ctx.fillStyle = particle.color;
      ctx.fillRect(particle.x, particle.y, particleSize, particleSize);
    });

    requestAnimationFrame(animate);
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    particles.forEach((particle) => {
      const dx = particle.x - mouseX;
      const dy = particle.y - mouseY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < maxMouseEffectDistance) {
        const angle = Math.atan2(dy, dx);
        const force =
          (maxMouseEffectDistance - distance) / maxMouseEffectDistance;
        particle.vx += Math.cos(angle) * force * 6;
        particle.vy += Math.sin(angle) * force * 6;
      }
    });
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseMove={handleMouseMove}
      style={{
        display: "block",
        width: `${width}px`,
        height: `${height}px`,
      }}
    />
  );
};

export default ParticleHoverEffect;
