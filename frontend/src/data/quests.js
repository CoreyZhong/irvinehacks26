let quests = [];

const FALLBACK_QUESTS = [
  { id: 'fallback_1', category: 'easy', description: 'Find something blue on campus and take a photo.', timeLimit: 10, coinReward: 3 },
  { id: 'fallback_2', category: 'medium', description: 'Take a photo with something anteater-related at UCI.', timeLimit: 20, coinReward: 5 },
  { id: 'fallback_3', category: 'hard', description: 'Find three different trees in Aldrich Park and photograph each.', timeLimit: 30, coinReward: 7 },
];

const hashString = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // force 32-bit
  }
  return Math.abs(hash).toString(36);
};

const makeQuestId = (q) => {
  const base = `${q.category || 'unknown'}|${q.timeLimit || ''}|${q.coinReward || ''}|${q.description || ''}`;
  return `q_${hashString(base)}`;
};

// Fetch 3 quests from the backend and replace the in-memory list.
export const refreshQuests = async () => {
  const res = await fetch('/api/quests/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    let message = (err && typeof err.detail === 'string') ? err.detail : (err?.detail?.error) || `Request failed (${res.status})`;
    if (res.status === 404) {
      message = "Not Found. Run the backend with: fastapi run src/main.py (not src/api.py) so routes are at /api/quests/generate.";
    }
    throw new Error(message);
  }

  const data = await res.json();
  const normalized = Array.isArray(data)
    ? data.map((q) => ({
      id: makeQuestId(q),
        category: q.category,
        description: q.description,
        timeLimit: q.timeLimit,
        coinReward: q.coinReward,
      }))
    : [];

  quests = normalized;
  return quests;
};

export const getRandomQuests = (count = 3, excludeIds = []) => {
  const availableQuests = quests.filter(q => !excludeIds.includes(q.id));
  const shuffled = [...availableQuests].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export const getFallbackQuests = (excludeIds = []) => {
  const available = FALLBACK_QUESTS.filter(q => !excludeIds.includes(q.id));
  return available.slice(0, 3);
};

// Helper function to get quest by ID
export const getQuestById = (id) => {
  return quests.find(q => q.id === id);
};
