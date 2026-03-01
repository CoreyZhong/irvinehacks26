import { useGame } from '../context/GameContext';
import { getRandomQuests, refreshQuests } from '../data/quests';
import { useState, useEffect } from 'react';
import BackButton from '../components/BackButton';
import './pages.css';
import './OpenTasks.css';

const OpenTasks = () => {
  const { acceptQuest, completedQuests } = useGame();
  const [availableQuests, setAvailableQuests] = useState([]);

  useEffect(() => {
    const loadQuests = async () => {
      const completedIds = completedQuests.map(q => q.id);
      try {
        await refreshQuests();
        const quests = getRandomQuests(3, completedIds);
        setAvailableQuests(quests);
      } catch (err) {
        console.error('Failed to fetch quests', err);
      }
    };

    loadQuests();
  }, [completedQuests]);

  const handleAcceptQuest = (quest) => {
    acceptQuest(quest);
  };

  return (
    <div className="page-container">
      <BackButton destination="landing" />
      <h1 className="page-title">Tasks</h1>

      <div className="tasks-grid">
        {availableQuests.map((quest, index) => (
          <div key={quest.id} className="task-card">
            <div className="task-header">
              <h3>Task {index + 1}</h3>
              <span className="task-category">{quest.category}</span>
            </div>
            
            <div className="task-content">
              <div className="task-description">
                {quest.description}
              </div>
              
              <div className="task-info">
                <div className="task-info-box">
                  <p><strong>Time:</strong> {quest.timeLimit} min</p>
                  <p><strong>Reward:</strong> {quest.coinReward} coins</p>
                </div>
              </div>
            </div>

            <button 
              className="accept-button"
              onClick={() => handleAcceptQuest(quest)}
            >
              Accept Task
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OpenTasks;
