import React, { useState, useEffect } from 'react';
import { getModelById } from '../config/models';

// Enhanced Model Card with Material Design 2 styling and favorites system
const ModelCard = ({ modelId, onClick, isSelected = false, isFavorite = false, onFavoriteToggle }) => {
  const modelConfig = getModelById(modelId);
  const [isFavorited, setIsFavorited] = useState(isFavorite);

  useEffect(() => {
    setIsFavorited(isFavorite);
  }, [isFavorite]);

  if (!modelConfig) return null;

  const handleCardClick = () => {
    if (onClick) onClick(modelId);
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    const newFavoriteState = !isFavorited;
    setIsFavorited(newFavoriteState);
    if (onFavoriteToggle) onFavoriteToggle(modelId, newFavoriteState);
  };

  return (
    <div
      className={`bg-card rounded-xl shadow-md border border-border hover:shadow-lg transition-all duration-200 cursor-pointer group p-4 ${isSelected ? 'border-primary-500' : 'border-border'}`}
      onClick={handleCardClick}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-muted text-muted-foreground">
            <span className="material-symbols-outlined text-xs">{modelConfig.icon || 'psychology'}</span>
          </div>
          <div>
            <h4 className="font-medium text-sm">{modelConfig.name}</h4>
            <p className="text-xs text-muted-foreground">{modelConfig.provider}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleFavoriteClick} className="text-primary-600 hover:text-primary-700 transition-colors">
            <span className="material-symbols-outlined text-sm">{isFavorited ? 'star' : 'star_outline'}</span>
          </button>
          <div
            className={`px-2 py-1 text-xs rounded-full ${
              modelConfig.speed === 'fastest'
                ? 'bg-green-100 text-green-700'
                : modelConfig.speed === 'fast'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-yellow-100 text-yellow-700'
            }`}
          >
            {modelConfig.speed}
          </div>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mb-2">{modelConfig.description}</p>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined">text_snippet</span>
          {modelConfig.context || 'Medium'} context
        </span>
        <span className="bg-muted text-muted-foreground px-2 py-1 rounded-full">{modelConfig.maxTokens || 4000} tokens</span>
      </div>
    </div>
  );
};

export default ModelCard;
