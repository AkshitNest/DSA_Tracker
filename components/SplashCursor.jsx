"use client";

import { useEffect, useRef } from "react";

export default function SplashCursor({ COLOR = "#e6deee" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const particles = [];
    let mouse = { x: -999, y: -999 };
    let rafId;

    // Parse hex color to rgba
    function hexToRgb(hex) {
      const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return r
        ? { r: parseInt(r[1], 16), g: parseInt(r[2], 16), b: parseInt(r[3], 16) }
        : { r: 230, g: 222, b: 238 };
    }
    const { r, g, b } = hexToRgb(COLOR);

    class Particle {
      constructor(x, y, vx, vy) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.alpha = 1;
        this.radius = Math.random() * 18 + 8;
        this.decay = Math.random() * 0.015 + 0.012;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.97;
        this.vy *= 0.97;
        this.alpha -= this.decay;
        this.radius *= 0.985;
      }

      draw() {
        const gradient = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, this.radius
        );
        gradient.addColorStop(0, `rgba(${r},${g},${b},${this.alpha})`);
        gradient.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }
    }

    let lastX = 0, lastY = 0;

    function onMouseMove(e) {
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      const speed = Math.sqrt(dx * dx + dy * dy);
      mouse.x = e.clientX;
      mouse.y = e.clientY;

      // Spawn more particles the faster you move
      const count = Math.min(Math.floor(speed / 3) + 1, 6);
      for (let i = 0; i < count; i++) {
        const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 1.2;
        const force = speed * 0.08 + 1;
        particles.push(new Particle(
          e.clientX + (Math.random() - 0.5) * 10,
          e.clientY + (Math.random() - 0.5) * 10,
          Math.cos(angle) * force * (Math.random() * 0.5 + 0.5),
          Math.sin(angle) * force * (Math.random() * 0.5 + 0.5),
        ));
      }
      lastX = e.clientX;
      lastY = e.clientY;
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);

      for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw();
        if (particles[i].alpha <= 0 || particles[i].radius <= 0.5) {
          particles.splice(i, 1);
        }
      }

      rafId = requestAnimationFrame(animate);
    }

    animate();

    const onResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 9998,
        pointerEvents: "none",
      }}
    />
  );
}
