import { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { fetchLeaderboard } from '../lib/gameState';
import { getOutfitById } from '../data/outfits';
import petrLogo from '../assets/petr.png';
import BackButton from '../components/BackButton';
import './pages.css';
import './Leaderboard.css';

const SORT_COINS = 'coins_earned_lifetime';
const SORT_QUESTS = 'completed_count';

const Leaderboard = () => {
  const { showToast } = useGame();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState(SORT_COINS);
  const [selectedEntry, setSelectedEntry] = useState(null);

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        setLoading(true);
        const data = await fetchLeaderboard(100, sortBy);
        setLeaderboard(data);
      } catch (error) {
        console.error('Failed to load leaderboard:', error);
        showToast('Failed to load leaderboard', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, [sortBy, showToast]);

  const isCoins = sortBy === SORT_COINS;
  const valueHeader = isCoins ? 'Coins earned' : 'Quests completed';
  const getValue = (entry) =>
    isCoins ? (entry.coins_earned_lifetime ?? entry.coins ?? 0) : (entry.completed_count ?? 0);
  const formatValue = (v) => (isCoins ? Number(v).toLocaleString() : String(v));

  return (
    <div className="page-container">
      <BackButton destination="landing" />
      <h1 className="page-title">Zot Quests Leaderboard</h1>

      <div className="leaderboard-tabs">
        <button
          type="button"
          className={`leaderboard-tab ${isCoins ? 'leaderboard-tab-active' : ''}`}
          onClick={() => setSortBy(SORT_COINS)}
        >
          Sort by Coins
        </button>
        <button
          type="button"
          className={`leaderboard-tab ${!isCoins ? 'leaderboard-tab-active' : ''}`}
          onClick={() => setSortBy(SORT_QUESTS)}
        >
          Sort by Quests
        </button>
      </div>

      <div className="leaderboard-content">
        {loading ? (
          <div className="loading-state">
            <p>Loading leaderboard...</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="empty-state">
            <p>No players yet!</p>
            <p>Complete quests to appear on the leaderboard.</p>
          </div>
        ) : (
          <div key={sortBy} className="leaderboard-table-fade">
            <div className={`leaderboard-table ${!isCoins ? 'leaderboard-table-quests' : ''}`}>
            <div className="leaderboard-header">
              <div className="leaderboard-rank">Rank</div>
              <div className="leaderboard-username">Player</div>
              <div className="leaderboard-value">{valueHeader}</div>
            </div>
            <div className="leaderboard-rows">
              {leaderboard.map((entry, index) => (
                <div key={entry.id} className="leaderboard-row">
                  <div className="leaderboard-rank">
                    <span className={`rank-badge rank-${index + 1}`}>
                      {index === 0 && '🥇'}
                      {index === 1 && '🥈'}
                      {index === 2 && '🥉'}
                      {index >= 3 && `#${index + 1}`}
                    </span>
                  </div>
                  <div className="leaderboard-username">
                    <button
                      type="button"
                      className="leaderboard-username-btn"
                      onClick={() => setSelectedEntry(entry)}
                    >
                      {entry.username}
                    </button>
                  </div>
                  <div className="leaderboard-value">{formatValue(getValue(entry))}</div>
                </div>
              ))}
            </div>
            </div>
          </div>
        )}
      </div>

      {selectedEntry && (
        <div
          className="leaderboard-avatar-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="leaderboard-avatar-title"
          onClick={() => setSelectedEntry(null)}
        >
          <div
            className="leaderboard-avatar-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="leaderboard-avatar-close"
              onClick={() => setSelectedEntry(null)}
              aria-label="Close"
            >
              ×
            </button>
            <h2 id="leaderboard-avatar-title" className="leaderboard-avatar-title">
              {selectedEntry.username}'s Avatar
            </h2>
            <div className="leaderboard-avatar-display">
              <div className="leaderboard-avatar-petr-base">
                <div className="leaderboard-avatar-petr-wrapper">
                  <img src={petrLogo} alt="Petr the Anteater" className="leaderboard-avatar-petr-character" />
                  {selectedEntry.equipped_outfit_id != null && (() => {
                    const outfit = getOutfitById(selectedEntry.equipped_outfit_id);
                    return outfit?.imageUrl ? (
                      <img
                        key={outfit.id}
                        src={outfit.imageUrl}
                        alt={outfit.name}
                        className={`leaderboard-avatar-overlay-img leaderboard-avatar-overlay--${outfit.id}`}
                      />
                    ) : null;
                  })()}
                </div>
              </div>
              <div className="leaderboard-avatar-equipped">
                {selectedEntry.equipped_outfit_id != null ? (
                  <span className="leaderboard-avatar-badge">
                    {getOutfitById(selectedEntry.equipped_outfit_id)?.name ?? 'Outfit'}
                  </span>
                ) : (
                  <span className="leaderboard-avatar-no-outfit">No outfit equipped.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
