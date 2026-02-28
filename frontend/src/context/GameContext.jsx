import { createContext, useContext, useState, useEffect } from 'react';
import { getRandomQuests } from '../data/quests';
import { getRandomShopItems } from '../data/outfits';

const GameContext = createContext();

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

export const GameProvider = ({ children }) => {
  // Load initial state from localStorage or use defaults
  const loadState = () => {
    try {
      const saved = localStorage.getItem('zotQuestsState');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          currentPage: 'landing',
          coins: parsed.coins || 0,
          completedQuests: parsed.completedQuests || [],
          activeQuest: null,
          ownedOutfits: parsed.ownedOutfits || [],
          equippedOutfits: parsed.equippedOutfits || {},
          shopInventory: getRandomShopItems(3, parsed.ownedOutfits || []),
          questStartTime: null,
          uploadedImage: null,
        };
      }
    } catch (error) {
      console.error('Error loading saved state:', error);
    }
    
    return {
      currentPage: 'landing',
      coins: 0,
      completedQuests: [],
      activeQuest: null,
      ownedOutfits: [],
      equippedOutfits: {},
      shopInventory: getRandomShopItems(3, []),
      questStartTime: null,
      uploadedImage: null,
    };
  };

  const [state, setState] = useState(loadState);

  // Save to localStorage whenever relevant state changes
  useEffect(() => {
    const toSave = {
      coins: state.coins,
      completedQuests: state.completedQuests,
      ownedOutfits: state.ownedOutfits,
      equippedOutfits: state.equippedOutfits,
    };
    localStorage.setItem('zotQuestsState', JSON.stringify(toSave));
  }, [state.coins, state.completedQuests, state.ownedOutfits, state.equippedOutfits]);

  // Navigation
  const navigateTo = (page) => {
    setState(prev => ({ ...prev, currentPage: page }));
  };

  // Quest Management
  const acceptQuest = (quest) => {
    setState(prev => ({
      ...prev,
      activeQuest: quest,
      questStartTime: Date.now(),
      uploadedImage: null,
      currentPage: 'proof',
    }));
  };

  const completeQuest = () => {
    if (!state.activeQuest) return;

    const newCompletedQuest = {
      ...state.activeQuest,
      completedAt: new Date().toISOString(),
      imageUrl: state.uploadedImage,
    };

    setState(prev => ({
      ...prev,
      coins: prev.coins + prev.activeQuest.coinReward,
      completedQuests: [...prev.completedQuests, newCompletedQuest],
      activeQuest: null,
      questStartTime: null,
      uploadedImage: null,
      currentPage: 'landing',
    }));
  };

  const setUploadedImage = (imageDataUrl) => {
    setState(prev => ({ ...prev, uploadedImage: imageDataUrl }));
  };

  // Shop & Outfit Management
  const purchaseOutfit = (outfit) => {
    if (state.coins < outfit.cost) {
      alert('Not enough coins!');
      return false;
    }

    if (state.ownedOutfits.includes(outfit.id)) {
      alert('You already own this outfit!');
      return false;
    }

    setState(prev => ({
      ...prev,
      coins: prev.coins - outfit.cost,
      ownedOutfits: [...prev.ownedOutfits, outfit.id],
      shopInventory: prev.shopInventory.filter(item => item.id !== outfit.id),
    }));

    return true;
  };

  const equipOutfit = (outfit) => {
    setState(prev => {
      const newEquipped = { ...prev.equippedOutfits };
      
      // If already equipped, unequip it
      if (newEquipped[outfit.type] === outfit.id) {
        delete newEquipped[outfit.type];
      } else {
        // Otherwise, equip it (replacing any existing item of that type)
        newEquipped[outfit.type] = outfit.id;
      }

      return { ...prev, equippedOutfits: newEquipped };
    });
  };

  const rerollShop = () => {
    const newInventory = getRandomShopItems(3, state.ownedOutfits);
    setState(prev => ({ ...prev, shopInventory: newInventory }));
  };

  const value = {
    // State
    currentPage: state.currentPage,
    coins: state.coins,
    completedQuests: state.completedQuests,
    activeQuest: state.activeQuest,
    ownedOutfits: state.ownedOutfits,
    equippedOutfits: state.equippedOutfits,
    shopInventory: state.shopInventory,
    questStartTime: state.questStartTime,
    uploadedImage: state.uploadedImage,
    
    // Actions
    navigateTo,
    acceptQuest,
    completeQuest,
    setUploadedImage,
    purchaseOutfit,
    equipOutfit,
    rerollShop,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
