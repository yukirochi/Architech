import { useState, useRef, useCallback } from 'react';
import { architectures } from '../data/architectures';

export function useSimulation(currentArchId, isProMode, setSelectedNode, addLog) {
  const [isSimulating, setIsSimulating]   = useState(false);
  const [activeNodes,  setActiveNodes]    = useState([]);
  const [activeLines,  setActiveLines]    = useState([]);
  const audioRef = useRef({ ctx: null, ready: false });

  /* ---------- Audio ---------- */
  const initAudio = useCallback(() => {
    if (audioRef.current.ready) return;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      const ctx = new Ctx();
      if (ctx.state === 'suspended') ctx.resume();
      audioRef.current = { ctx, ready: true };
    } catch (_) {}
  }, []);

  const playSound = useCallback((type) => {
    const { ctx } = audioRef.current;
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      if (type === 'packet') {
        o.type = 'sine';
        o.frequency.setValueAtTime(900, now);
        o.frequency.exponentialRampToValueAtTime(400, now + 0.12);
        g.gain.setValueAtTime(0.012, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        o.start(now); o.stop(now + 0.13);
      } else if (type === 'success') {
        o.type = 'sine';
        o.frequency.setValueAtTime(1046, now);
        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(0.06, now + 0.1);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
        o.start(now); o.stop(now + 1);
      } else if (type === 'hit') {
        o.type = 'sine';
        o.frequency.setValueAtTime(660, now);
        g.gain.setValueAtTime(0.05, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        o.start(now); o.stop(now + 0.35);
      } else if (type === 'miss') {
        o.type = 'triangle';
        o.frequency.setValueAtTime(180, now);
        o.frequency.exponentialRampToValueAtTime(80, now + 0.2);
        g.gain.setValueAtTime(0.07, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        o.start(now); o.stop(now + 0.22);
      }
    } catch (_) {}
  }, []);

  /* ---------- Helpers ---------- */
  const delay = ms => new Promise(r => setTimeout(r, ms));

  /** Animates a glowing dot from one node's DOM center to another's. */
  const shootPacket = (fromId, toId, type = 'request', dur = 600) => {
    return new Promise(resolve => {
      playSound('packet');
      const canvas  = document.getElementById('canvas-inner');
      const fromEl  = document.getElementById(`node-${fromId}`);
      const toEl    = document.getElementById(`node-${toId}`);
      if (!canvas || !fromEl || !toEl) return resolve();

      const cR  = canvas.getBoundingClientRect();
      const fR  = fromEl.getBoundingClientRect();
      const tR  = toEl.getBoundingClientRect();

      // true centre relative to canvas
      const x1 = fR.left + fR.width  / 2 - cR.left;
      const y1 = fR.top  + fR.height / 2 - cR.top;
      const x2 = tR.left + tR.width  / 2 - cR.left;
      const y2 = tR.top  + tR.height / 2 - cR.top;

      const dot = document.createElement('div');
      dot.className = `packet ${type}`;
      dot.style.cssText = `left:${x1}px;top:${y1}px;`;
      canvas.appendChild(dot);

      const anim = dot.animate([
        { transform: 'translate(-50%,-50%) translate(0px,0px)' },
        { transform: `translate(-50%,-50%) translate(${x2-x1}px,${y2-y1}px)` }
      ], { duration: dur, easing: 'cubic-bezier(0.4,0,0.2,1)', fill: 'forwards' });

      anim.onfinish = () => { dot.remove(); resolve(); };
    });
  };

  /** Highlights line id(s) then removes after the packet travel time. */
  const activateLine = (lineId, dur) => {
    if (!lineId) return;
    setActiveLines(p => [...p, lineId]);
    setTimeout(() => setActiveLines(p => p.filter(id => id !== lineId)), dur + 100);
  };

  const findLineId = (arch, from, to) =>
    arch.lines.find(l =>
      (l.from === from && l.to === to) || (l.from === to && l.to === from)
    )?.id;

  /* ---------- Main simulation ---------- */
  const startSimulation = async (cacheHit = false) => {
    if (isSimulating) return;
    initAudio();
    setIsSimulating(true);
    setActiveNodes([]);
    setActiveLines([]);
    addLog('Pipeline execution initiated.', 'info');

    const arch = architectures[currentArchId];
    if (!arch?.simulate) {
      addLog('No simulation script for this architecture.', 'error');
      setIsSimulating(false);
      return;
    }

    try {
      for (const step of arch.simulate) {
        // Log
        if (step.logBeginner || step.logPro) {
          addLog(
            isProMode
              ? (step.logPro    || step.logBeginner)
              : (step.logBeginner || step.logPro),
            step.logType || 'info'
          );
        }

        if (step.from && step.to) {
          const lid = findLineId(arch, step.from, step.to);
          setSelectedNode(step.from);

          // cache-hit short-circuit (webapp only)
          if (cacheHit && step.cacheIntercept) {
            playSound('hit');
            addLog(
              isProMode ? 'Cache HIT — extenuating downstream proxy tree.' : 'Cache HIT! Answer retrieved from memory instantly.',
              'info'
            );
            activateLine(lid, 400);
            // Shoot back to the source
            await shootPacket(step.to, step.from, 'response', 400);
            break;
          }

          activateLine(lid, step.dur);

          if (step.type === 'background') {
            // fire-and-forget
            shootPacket(step.from, step.to, step.type, step.dur);
          } else {
            await shootPacket(step.from, step.to, step.type || 'request', step.dur);
          }
        }

        if (step.node && step.process) {
          setSelectedNode(step.node);
          setActiveNodes(p => [...p, step.node]);
          await delay(step.dur || 400);
          setActiveNodes(p => p.filter(id => id !== step.node));
        }
      }

      playSound('success');
      addLog('Pipeline acknowledged successfully.', 'info');
    } catch (err) {
      addLog('Simulation aborted unexpectedly.', 'error');
      console.error(err);
    }

    setIsSimulating(false);
    setActiveNodes([]);
    setActiveLines([]);
  };

  return {
    isSimulating,
    activeNodes,
    activeLines,
    startSimulation,
    simulateCacheHit: () => startSimulation(true),
  };
}
