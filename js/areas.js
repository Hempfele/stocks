// The 10 life areas, modeled after the hierarchy of needs (bottom to top).
export const AREAS = [
  { key: 'nourishment', emoji: '🍞', title: 'Nourishment',       question: 'What feeds you?' },
  { key: 'home',        emoji: '🏠', title: 'Home & Shelter',    question: 'Where does life happen?' },
  { key: 'health',      emoji: '❤️', title: 'Health & Body',     question: 'What keeps you well?' },
  { key: 'energy',      emoji: '⚡', title: 'Energy & Resources', question: 'What powers it all?' },
  { key: 'safety',      emoji: '🛡️', title: 'Safety & Security', question: 'What do you rely on?' },
  { key: 'mobility',    emoji: '🚲', title: 'Mobility',          question: 'How do you move through the world?' },
  { key: 'connection',  emoji: '💬', title: 'Connection',        question: 'How do you stay close?' },
  { key: 'play',        emoji: '🎮', title: 'Play & Joy',        question: 'What makes you smile?' },
  { key: 'growth',      emoji: '📚', title: 'Learning & Growth', question: 'How do you become more?' },
  { key: 'dreams',      emoji: '🚀', title: 'Dreams & Frontier', question: 'What future do you want to see?' },
];

export const STAKE = 1000; // € virtually invested per pick

export function areaByKey(key) {
  return AREAS.find((a) => a.key === key);
}
