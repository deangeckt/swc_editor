import React, { useState } from 'react';
import SearchByNameId from './SearchByNameId';
import ExploreBySpecies from './ExploreBySpecies';
import '../NeuroMorphExplorer.css';
import './neuromorph.css';

type ExplorerMode = 'search' | 'explore';

interface NeuroMorphExplorerProps {
    onBack: () => void;
}

const NeuroMorphExplorer: React.FC<NeuroMorphExplorerProps> = ({ onBack }) => {
    // Get previously selected mode from localStorage or default to search
    const initialMode = (localStorage.getItem('neuromorph_explorer_mode') as ExplorerMode) || 'search';
    const [mode, setMode] = useState<ExplorerMode>(initialMode);

    // Save mode selection to localStorage
    const handleModeChange = (newMode: ExplorerMode) => {
        setMode(newMode);
        localStorage.setItem('neuromorph_explorer_mode', newMode);
    };

    return (
        <div className="NeuroMorphExplorer">
            <div className="explorer-header">
                <button className="back-button" onClick={onBack}>
                    ← Back to Editor
                </button>
                <h2>NeuroMorpho.org Explorer</h2>
            </div>

            {/* Mode selector */}
            <div className="mode-selector">
                <button
                    className={`mode-button ${mode === 'search' ? 'active' : ''}`}
                    onClick={() => handleModeChange('search')}
                >
                    Search by Name/ID
                </button>
                <button
                    className={`mode-button ${mode === 'explore' ? 'active' : ''}`}
                    onClick={() => handleModeChange('explore')}
                >
                    Explore by Species
                </button>
            </div>

            {/* Content based on selected mode */}
            <div className="explorer-content">{mode === 'search' ? <SearchByNameId /> : <ExploreBySpecies />}</div>

            {/* Global loading overlay is handled by the subcomponents */}
        </div>
    );
};

export default NeuroMorphExplorer;
