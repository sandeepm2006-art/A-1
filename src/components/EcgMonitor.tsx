import React, { useEffect, useRef, useState } from 'react';
import { Activity, Heart, Zap } from 'lucide-react';
import { motion } from 'motion/react';

interface EcgMonitorProps {
  heartRate: number; // bpm
  systolicBP: number;
  diastolicBP: number;
  riskCategory: string;
}

export const EcgMonitor: React.FC<EcgMonitorProps> = ({
  heartRate,
  systolicBP,
  diastolicBP,
  riskCategory
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [pulseActive, setPulseActive] = useState(false);

  // Hemodynamic calculations
  const pulsePressure = systolicBP - diastolicBP;
  const meanArterialPressure = Math.round(diastolicBP + pulsePressure / 3);
  const ratePressureProduct = Math.round((systolicBP * heartRate) / 100);
  const rrIntervalMs = Math.round(60000 / heartRate);

  // Rhythm classification
  let rhythmLabel = 'Normal Sinus Rhythm';
  if (heartRate < 60) rhythmLabel = 'Sinus Bradycardia';
  else if (heartRate > 100) rhythmLabel = 'Sinus Tachycardia';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let x = 0;
    const width = canvas.width;
    const height = canvas.height;
    const midY = height / 2;

    // Buffer to store history of points for smooth rendering
    const points: { x: number; y: number }[] = [];
    const maxPoints = width;

    // Cycle timing based on heart rate
    // 60 bpm = 1 sec per cycle = 60 frames @ 60fps
    let cyclePhase = 0; // 0 to 1

    const render = () => {
      // Speed of sweep across screen: approx 2-3 seconds per full sweep
      const sweepSpeed = 2.2;
      x = (x + sweepSpeed) % width;

      // Calculate beat frequency per frame (assuming 60fps)
      // heartRate bpm / 60 = beats per second
      // at 60 fps, phase increment = (heartRate / 60) / 60 = heartRate / 3600
      const phaseDelta = heartRate / 3600;
      cyclePhase = (cyclePhase + phaseDelta) % 1;

      // Realistic ECG P-Q-R-S-T wave model
      let waveY = 0;
      const p = cyclePhase;

      if (p >= 0.08 && p < 0.18) {
        // P-wave (Atrial depolarization)
        const localP = (p - 0.08) / 0.10;
        waveY = -Math.sin(localP * Math.PI) * 7;
      } else if (p >= 0.22 && p < 0.25) {
        // Q-wave (Septal depolarization)
        const localQ = (p - 0.22) / 0.03;
        waveY = Math.sin(localQ * Math.PI) * 5;
      } else if (p >= 0.25 && p < 0.32) {
        // R-wave spike (Ventricular depolarization) - Tall positive deflection
        const localR = (p - 0.25) / 0.07;
        waveY = -Math.sin(localR * Math.PI) * 36;
      } else if (p >= 0.32 && p < 0.36) {
        // S-wave (Late ventricular depolarization) - Negative deflection
        const localS = (p - 0.32) / 0.04;
        waveY = Math.sin(localS * Math.PI) * 11;
      } else if (p >= 0.44 && p < 0.62) {
        // T-wave (Ventricular repolarization) - Smooth positive deflection
        const localT = (p - 0.44) / 0.18;
        waveY = -Math.sin(localT * Math.PI) * 13;
      } else {
        // Isoelectric baseline with microscopic physiologic jitter
        waveY = (Math.random() - 0.5) * 0.8;
      }

      // Trigger pulse visual at peak of R-wave
      if (p >= 0.27 && p <= 0.30) {
        setPulseActive(true);
      } else if (p > 0.35) {
        setPulseActive(false);
      }

      const currentY = midY + waveY;

      // Clear narrow column ahead of the sweep cursor (scanner effect)
      const clearWidth = 24;
      ctx.fillStyle = '#0f172a'; // slate-900
      ctx.fillRect(x, 0, clearWidth, height);

      // Faint medical grid lines
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.25)'; // slate-700
      ctx.lineWidth = 0.5;

      // Draw grid only in the cleared region
      ctx.beginPath();
      for (let gy = 0; gy < height; gy += 15) {
        ctx.moveTo(x, gy);
        ctx.lineTo(Math.min(width, x + clearWidth), gy);
      }
      ctx.stroke();

      // Draw active ECG trace line
      ctx.beginPath();
      ctx.strokeStyle = riskCategory === 'High' ? '#f43f5e' : riskCategory === 'Intermediate' ? '#f59e0b' : '#38bdf8'; // rose-500, amber-500 or sky-400
      ctx.lineWidth = 1.75;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Connect from previous point
      const prevX = (x - sweepSpeed + width) % width;
      if (prevX < x) {
        ctx.moveTo(prevX, midY);
        ctx.lineTo(x, currentY);
        ctx.stroke();
      }

      // Draw glowing lead tip cursor
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#0284c7';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(x, currentY, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0; // reset

      animationFrameId = requestAnimationFrame(render);
    };

    // Initialize background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [heartRate, riskCategory]);

  return (
    <div className="bg-slate-900 text-white rounded-xl p-4 border border-slate-800 shadow-sm space-y-3 overflow-hidden relative">
      {/* Header telemetry info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <motion.div
              animate={{
                scale: pulseActive ? [1, 1.28, 0.94, 1.15, 1] : 1
              }}
              transition={{
                duration: 0.35,
                ease: 'easeOut'
              }}
              className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                pulseActive ? 'bg-red-500/30 text-red-400' : 'bg-slate-800 text-sky-400'
              }`}
            >
              <Heart className="w-4 h-4 fill-current" />
            </motion.div>
            {pulseActive && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full animate-ping" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Lead II • ECG Rhythm
              </span>
              <span className="px-1.5 py-0.2 bg-slate-800 text-[9px] font-mono text-emerald-400 rounded border border-slate-700">
                LIVE
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              {rhythmLabel} • R-R: {rrIntervalMs}ms
            </p>
          </div>
        </div>

        {/* Live BPM counter */}
        <div className="text-right flex items-baseline gap-1 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/80">
          <motion.span
            key={heartRate}
            initial={{ scale: 1.15, color: '#38bdf8' }}
            animate={{ scale: 1, color: '#ffffff' }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="text-xl font-mono font-black"
          >
            {heartRate}
          </motion.span>
          <span className="text-[10px] font-bold text-slate-400 uppercase">BPM</span>
        </div>
      </div>

      {/* Canvas Oscilloscope */}
      <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
        <canvas
          ref={canvasRef}
          width={460}
          height={85}
          className="w-full h-20 block"
        />
        {/* Subtle vignette / oscilloscope scanline overlay */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_transparent_60%,_rgba(15,23,42,0.6)_100%)]"></div>
      </div>

      {/* Real-time Hemodynamics bar */}
      <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800/80 text-[10px]">
        <div className="bg-slate-800/60 p-1.5 rounded-lg border border-slate-700/60">
          <span className="text-slate-400 block uppercase font-bold text-[9px]">Mean Art. Pres.</span>
          <span className="font-mono font-bold text-slate-200 text-xs">{meanArterialPressure}</span>
          <span className="text-slate-500 font-sans ml-1 text-[9px]">mmHg</span>
        </div>

        <div className="bg-slate-800/60 p-1.5 rounded-lg border border-slate-700/60">
          <span className="text-slate-400 block uppercase font-bold text-[9px]">Pulse Pressure</span>
          <span className="font-mono font-bold text-slate-200 text-xs">{pulsePressure}</span>
          <span className="text-slate-500 font-sans ml-1 text-[9px]">mmHg</span>
        </div>

        <div className="bg-slate-800/60 p-1.5 rounded-lg border border-slate-700/60">
          <span className="text-slate-400 block uppercase font-bold text-[9px]">Rate-Pressure</span>
          <span className="font-mono font-bold text-sky-400 text-xs">{ratePressureProduct}</span>
          <span className="text-slate-500 font-sans ml-1 text-[9px]">RPP</span>
        </div>
      </div>
    </div>
  );
};
