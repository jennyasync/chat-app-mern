import { NOTIFICATION_SOUND_URL } from './constants.js';

// Created on first use and reused, so users who never get a notification never load the file.
let audioInstance = null;

const getAudio = () => {
  if (typeof window === 'undefined' || typeof Audio === 'undefined') {
    return null;
  }
  if (!audioInstance) {
    audioInstance = new Audio(NOTIFICATION_SOUND_URL);
    audioInstance.preload = 'auto';
    audioInstance.volume = 0.5;
  }
  return audioInstance;
};

export const playNotificationSound = () => {
  const audio = getAudio();
  if (!audio) return;
  try {
    // Restart so back-to-back notifications aren't cut off.
    audio.currentTime = 0;
    const result = audio.play();
    if (result && typeof result.catch === 'function') {
      result.catch(() => {
        // Browsers block autoplay until the user has interacted with the page.
      });
    }
  } catch {
    // Some browsers throw synchronously when the audio element is detached.
  }
};
