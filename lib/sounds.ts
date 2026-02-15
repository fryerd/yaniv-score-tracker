'use client';

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';

// --- Sound Definitions ---
// Each sound can have multiple files for round-robin variation.
// Just add more files to the array to enable round-robin cycling.

const SOUND_DEFS = {
  'numpad-tap': {
    files: ['/sfx/numpad-tap.mp3'],
    volume: 0.3,
  },
  'stepper-tick': {
    files: ['/sfx/stepper-tick.mp3'],
    volume: 0.25,
  },
  'card-select': {
    files: ['/sfx/card-select.mp3'],
    volume: 0.5,
  },
  'dropdown-open': {
    files: ['/sfx/dropdown-open.mp3'],
    volume: 0.2,
  },
  'dropdown-close': {
    files: ['/sfx/dropdown-close.mp3'],
    volume: 0.2,
  },
  'toggle-switch': {
    files: ['/sfx/toggle-switch.mp3'],
    volume: 0.15,
  },
  'player-slide': {
    files: ['/sfx/player-slide.mp3'],
    volume: 0.3,
  },
  'add-score': {
    files: ['/sfx/add-score.mp3'],
    volume: 0.35,
  },
  'score-tally': {
    files: ['/sfx/score-tally.mp3'],
    volume: 0.4,
  },
  'score-tick': {
    files: ['/sfx/score-tick.mp3'],
    volume: 0.2,
  },
  'score-outro': {
    files: ['/sfx/score-outro.mp3'],
    volume: 0.35,
  },
  'total-snap': {
    files: ['/sfx/total-snap.mp3'],
    volume: 0.5,
  },
  'step-whoosh': {
    files: ['/sfx/step-whoosh.mp3'],
    volume: 0.2,
  },
  'false-yaniv-wah': {
    files: ['/sfx/false-yaniv-wah.mp3'],
    volume: 0.5,
  },
  'game-end-transition': {
    files: ['/sfx/game-end-transition.mp3'],
    volume: 0.35,
  },
  'podium-reveal': {
    files: ['/sfx/podium-reveal.mp3'],
    volume: 0.6,
  },
  'confirm-chime': {
    files: ['/sfx/confirm-chime.mp3'],
    volume: 0.45,
  },
  'alert-tone': {
    files: ['/sfx/alert-tone.mp3'],
    volume: 0.4,
  },
} as const;

export type SoundName = keyof typeof SOUND_DEFS;

// --- Storage Key ---
const MUTE_KEY = 'yaniv-sfx-muted';

// --- Singleton Sound Engine ---
// One AudioContext shared across all components.
// Buffers are decoded once, then played via lightweight source nodes.

let audioContext: AudioContext | null = null;
let gainNode: GainNode | null = null;

// Decoded audio buffers: soundName -> array of buffers (for round-robin)
const bufferCache = new Map<string, AudioBuffer[]>();

// Round-robin index per sound
const rrIndex = new Map<SoundName, number>();

// Mute state (module-level for sync access)
let _isMuted = false;

// Subscribers for mute state changes (for useSyncExternalStore)
const listeners = new Set<() => void>();
function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
function getSnapshot() {
  return _isMuted;
}
function notifyListeners() {
  listeners.forEach((l) => l());
}

// Initialize from localStorage on module load (client only)
if (typeof window !== 'undefined') {
  try {
    _isMuted = localStorage.getItem(MUTE_KEY) === 'true';
  } catch {
    // localStorage unavailable
  }
}

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
    gainNode = audioContext.createGain();
    gainNode.connect(audioContext.destination);
  }
  // Resume if suspended (browser autoplay policy)
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  return audioContext;
}

async function loadBuffer(url: string): Promise<AudioBuffer> {
  const ctx = getAudioContext();
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  return ctx.decodeAudioData(arrayBuffer);
}

async function ensureLoaded(name: SoundName): Promise<AudioBuffer[]> {
  const cached = bufferCache.get(name);
  if (cached) return cached;

  const def = SOUND_DEFS[name];
  const buffers = await Promise.all(def.files.map(loadBuffer));
  bufferCache.set(name, buffers);
  return buffers;
}

// Preload all sounds (call after first user interaction)
let preloadStarted = false;
async function preloadAll() {
  if (preloadStarted) return;
  preloadStarted = true;

  // Load in parallel, don't block on failure
  const names = Object.keys(SOUND_DEFS) as SoundName[];
  await Promise.allSettled(names.map(ensureLoaded));
}

// Play a sound by name
async function playSound(name: SoundName) {
  if (_isMuted) return;

  try {
    const ctx = getAudioContext();
    if (!gainNode) return;

    const buffers = await ensureLoaded(name);
    if (buffers.length === 0) return;

    // Round-robin: cycle through variants
    const currentIndex = rrIndex.get(name) ?? 0;
    const buffer = buffers[currentIndex % buffers.length];
    rrIndex.set(name, currentIndex + 1);

    // Create source -> gain for this play instance
    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const vol = ctx.createGain();
    vol.gain.value = SOUND_DEFS[name].volume;
    source.connect(vol);
    vol.connect(gainNode);

    source.start(0);
  } catch {
    // Silently fail — sound is non-critical
  }
}

function setMuted(muted: boolean) {
  _isMuted = muted;
  try {
    localStorage.setItem(MUTE_KEY, String(muted));
  } catch {
    // localStorage unavailable
  }
  notifyListeners();
}

function toggleMute() {
  setMuted(!_isMuted);
}

// --- React Hook ---

export function useSound() {
  const isMuted = useSyncExternalStore(subscribe, getSnapshot, () => false);

  // Trigger preload on first mount (after hydration = user has visited)
  const preloaded = useRef(false);
  useEffect(() => {
    if (!preloaded.current) {
      preloaded.current = true;
      // Preload on first user interaction to satisfy autoplay policy
      const handler = () => {
        preloadAll();
        window.removeEventListener('pointerdown', handler);
        window.removeEventListener('keydown', handler);
      };
      window.addEventListener('pointerdown', handler, { once: true });
      window.addEventListener('keydown', handler, { once: true });
    }
  }, []);

  const play = useCallback((name: SoundName) => {
    playSound(name);
  }, []);

  return { play, isMuted, toggleMute };
}
