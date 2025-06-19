const adjectives = [
  'swift', 'bright', 'clever', 'bold', 'quick', 'smart', 'cool', 'warm',
  'fresh', 'clean', 'sharp', 'smooth', 'strong', 'light', 'dark', 'deep',
  'wild', 'calm', 'pure', 'rich', 'soft', 'hard', 'fast', 'slow',
  'purple', 'blue', 'green', 'red', 'orange', 'yellow', 'pink', 'silver',
  'golden', 'crystal', 'magic', 'cosmic', 'stellar', 'lunar', 'solar',
  'dancing', 'flying', 'running', 'jumping', 'spinning', 'glowing'
];

const animals = [
  'cat', 'dog', 'fox', 'wolf', 'bear', 'deer', 'rabbit', 'mouse',
  'lion', 'tiger', 'eagle', 'hawk', 'owl', 'dove', 'swan', 'duck',
  'whale', 'dolphin', 'shark', 'fish', 'crab', 'turtle', 'frog',
  'butterfly', 'bee', 'ant', 'spider', 'dragonfly', 'firefly',
  'horse', 'zebra', 'giraffe', 'elephant', 'rhino', 'hippo',
  'monkey', 'panda', 'koala', 'kangaroo', 'penguin', 'seal'
];

/**
 * Generate a random site name with pattern: adjective-animal-adjective
 * Examples: "swift-fox-blue", "dancing-whale-bright", "crystal-eagle-fast"
 */
export function generateSiteName(): string {
  const randomAdjective1 = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomAnimal = animals[Math.floor(Math.random() * animals.length)];
  const randomAdjective2 = adjectives[Math.floor(Math.random() * adjectives.length)];

  // Ensure adjectives are different
  let finalAdjective2 = randomAdjective2;
  while (finalAdjective2 === randomAdjective1) {
    finalAdjective2 = adjectives[Math.floor(Math.random() * adjectives.length)];
  }

  return `${randomAdjective1}-${randomAnimal}-${finalAdjective2}`;
}

/**
 * Generate a Better Analytics site key with format BA_XXXXXXXX
 */
export function generateSiteKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'BA_';

  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
} 