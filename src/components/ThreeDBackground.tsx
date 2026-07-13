import React, { useEffect, useRef } from 'react';

interface Point3D {
  x: number;
  y: number;
  z: number;
  color: string;
  size: number;
}

export default function ThreeDBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Camera settings
    const fov = 350;
    const cx = width / 2;
    const cy = height / 2;

    // Rotation angles
    let angleX = 0.0015;
    let angleY = 0.002;

    // Mouse coordinates to steer rotation speed
    const mouse = { x: 0, y: 0 };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = (e.clientX - width / 2) * 0.00005;
      mouse.y = (e.clientY - height / 2) * 0.00005;
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    // Generate 3D Points forming a structured double-helix / globe shell mapping the Smart Eco-City grid
    const points: Point3D[] = [];
    const numPoints = 85;

    for (let i = 0; i < numPoints; i++) {
      const theta = Math.acos(-1 + (2 * i) / numPoints);
      const phi = Math.sqrt(numPoints * Math.PI) * theta;

      // Sphere coordinates
      const r = Math.min(width, height) * 0.28;
      const x = r * Math.sin(theta) * Math.cos(phi);
      const y = r * Math.sin(theta) * Math.sin(phi);
      const z = r * Math.cos(theta);

      // Distinguish colors representing different categories: Green for organic waste nodes, teal for recyclables, gold for administrative hubs
      let color = 'rgba(16, 185, 129, '; // emerald
      if (i % 3 === 0) color = 'rgba(20, 184, 166, '; // teal
      if (i % 7 === 0) color = 'rgba(234, 179, 8, '; // amber

      points.push({
        x,
        y,
        z,
        color,
        size: Math.random() * 2.5 + 1.5,
      });
    }

    // Connective grid lines structure
    const connections: [number, number][] = [];
    for (let i = 0; i < points.length; i++) {
      // Connect each node to its nearest neighbors to look like a high-tech smart city mesh network
      const distances = points.map((p, idx) => ({
        idx,
        dist: Math.hypot(p.x - points[i].x, p.y - points[i].y, p.z - points[i].z)
      })).filter(d => d.idx !== i);
      
      distances.sort((a, b) => a.dist - b.dist);
      // Take 2 closest neighbors
      distances.slice(0, 2).forEach(d => {
        if (!connections.some(([a, b]) => (a === i && b === d.idx) || (a === d.idx && b === i))) {
          connections.push([i, d.idx]);
        }
      });
    }

    // Main 3D projecting and rendering loop
    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw light ambient grid lines
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.015)';
      ctx.lineWidth = 1;
      const gridSpacing = 120;
      for (let x = 0; x < width; x += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Rotate points based on standard trig transforms modified by mouse position
      const rx = angleX + mouse.y;
      const ry = angleY + mouse.x;

      const cosX = Math.cos(rx);
      const sinX = Math.sin(rx);
      const cosY = Math.cos(ry);
      const sinY = Math.sin(ry);

      points.forEach(p => {
        // Rotate Y
        let x1 = p.x * cosY - p.z * sinY;
        let z1 = p.z * cosY + p.x * sinY;

        // Rotate X
        let y2 = p.y * cosX - z1 * sinX;
        let z2 = z1 * cosX + p.y * sinX;

        p.x = x1;
        p.y = y2;
        p.z = z2;
      });

      // Project and draw connections first
      connections.forEach(([i, j]) => {
        const p1 = points[i];
        const p2 = points[j];

        // 3D perspective divide projection
        const scale1 = fov / (fov + p1.z);
        const scale2 = fov / (fov + p2.z);

        const x1 = p1.x * scale1 + cx;
        const y1 = p1.y * scale1 + cy;
        const x2 = p2.x * scale2 + cx;
        const y2 = p2.y * scale2 + cy;

        // Clip far back-plane connections
        const avgZ = (p1.z + p2.z) / 2;
        const alpha = Math.max(0.01, (fov - avgZ) / (fov * 2)) * 0.18;

        ctx.strokeStyle = `rgba(16, 185, 129, ${alpha})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      });

      // Project and draw individual nodes
      points.forEach(p => {
        const scale = fov / (fov + p.z);
        const px = p.x * scale + cx;
        const py = p.y * scale + cy;

        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          const depthAlpha = Math.max(0.05, (fov - p.z) / (fov * 1.5)) * 0.6;
          ctx.beginPath();
          ctx.arc(px, py, p.size * scale, 0, Math.PI * 2);
          ctx.fillStyle = `${p.color}${depthAlpha})`;
          ctx.fill();

          // Add a dynamic glowing halo for closer prominent nodes
          if (p.z < -40) {
            ctx.beginPath();
            ctx.arc(px, py, p.size * scale * 2.8, 0, Math.PI * 2);
            ctx.fillStyle = `${p.color}${depthAlpha * 0.12})`;
            ctx.fill();
          }
        }
      });

      // Render orbiting orbital data telemetry ring
      const ringPoints = 64;
      ctx.beginPath();
      for (let i = 0; i <= ringPoints; i++) {
        const theta = (i / ringPoints) * Math.PI * 2;
        const rx = Math.min(width, height) * 0.35 * Math.cos(theta);
        const rz = Math.min(width, height) * 0.35 * Math.sin(theta);
        const ry = 0; // flat ring

        // Rotate ring
        const rx1 = rx * cosY - rz * sinY;
        const rz1 = rz * cosY + rx * sinY;
        const ry2 = ry * cosX - rz1 * sinX;
        const rz2 = rz1 * cosX + ry * sinX;

        const scale = fov / (fov + rz2);
        const px = rx1 * scale + cx;
        const py = ry2 * scale + cy;

        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.05)';
      ctx.lineWidth = 1;
      ctx.stroke();

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div id="three-d-cyber-bg" className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
      {/* Dynamic projection canvas rendering the rotating IoT nodes */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-70" />

      {/* Modern High-End Radial vignette overlay to deepen depth and aesthetics */}
      <div className="absolute inset-0 bg-radial-[at_50%_50%] from-transparent via-slate-950/30 to-slate-950 pointer-events-none"></div>
    </div>
  );
}
