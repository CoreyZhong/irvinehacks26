let quests = [];

// Fetch 3 quests from the backend and replace the in-memory list.
export const refreshQuests = async () => {
  const res = await fetch('/api/quests/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Failed to fetch quests');
  }

  const data = await res.json();
  const normalized = Array.isArray(data)
    ? data.map((q, idx) => ({
        id: idx + 1,
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

// Helper function to get quest by ID
export const getQuestById = (id) => {
  return quests.find(q => q.id === id);
};
