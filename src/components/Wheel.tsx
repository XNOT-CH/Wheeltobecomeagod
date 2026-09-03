"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { WHEEL_PALETTE } from "@/data/categories";

export interface WheelHandle {
  /** Spins the wheel and resolves with the index it lands on. */
  spin: () => Promise<number>;
}

interface WheelProps {
  labels: string[];
  size?: number;
}

const SIZE = 640;

function paint(canvas: HTMLCanvasElement, labels: string[]) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const n = labels.length;
  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const r = SIZE / 2 - 6;
  ctx.clearRect(0, 0, SIZE, SIZE);
  const slice = (Math.PI * 2) / n;
  const fontSize = n > 12 ? 13 : n > 8 ? 15 : 19;
  const maxChars = n > 12 ? 15 : n > 8 ? 18 : 22;

  for (let i = 0; i < n; i++) {
    const start = i * slice;
    const end = start + slice;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, start, end);
    ctx.closePath();
    ctx.fillStyle = WHEEL_PALETTE[i % WHEEL_PALETTE.length];
    ctx.fill();

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(start + slice / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#f7f2e7";
    ctx.font = `600 ${fontSize}px Manrope, sans-serif`;
    const label = labels[i];
    ctx.fillText(label.length > maxChars ? label.slice(0, maxChars - 1) + "…" : label, r - 18, fontSize / 3);
    ctx.restore();
  }
}

export const Wheel = forwardRef<WheelHandle, WheelProps>(function Wheel({ labels }, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotationRef = useRef(0);
  const labelsRef = useRef(labels);
  labelsRef.current = labels;

  useImperativeHandle(ref, () => ({
    spin: () =>
      new Promise<number>((resolve) => {
        const canvas = canvasRef.current;
        if (!canvas) return resolve(0);
        const n = labelsRef.current.length;
        const slice = 360 / n;
        const chosen = Math.floor(Math.random() * n);
        const targetCenter = chosen * slice + slice / 2;
        const extraTurns = 5 + Math.floor(Math.random() * 3);
        rotationRef.current += 360 * extraTurns + (360 - targetCenter);
        canvas.style.transform = `rotate(${rotationRef.current}deg)`;
        window.setTimeout(() => resolve(chosen), 4100);
      }),
  }));

  useEffect(() => {
    if (canvasRef.current) paint(canvasRef.current, labels);
  }, [labels]);

  return (
    <canvas
      ref={canvasRef}
      width={SIZE}
      height={SIZE}
      className="block h-full w-full rounded-full transition-transform duration-[4000ms] ease-[cubic-bezier(.11,.86,.2,1.01)]"
      style={{
        boxShadow:
          "0 0 0 6px var(--color-surface-2), 0 0 0 7px var(--color-line), 0 26px 46px -20px var(--color-shadow)",
      }}
    />
  );
});
