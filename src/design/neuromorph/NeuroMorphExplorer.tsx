import React, { useState } from 'react';
import SearchByNameId from './SearchByNameId';
import SearchBySpecies from './SearchBySpecies';
import { IAppState } from '../../Wrapper';
import './NeuroMorphExplorer.css';
import './neuromorph.css';

// type ExplorerMode = 'search' | 'explore';

interface NeuroMorphExplorerProps {
    onBack: () => void;
    state: IAppState;
    setState: React.Dispatch<React.SetStateAction<IAppState>>;
}

const NeuroMorphExplorer: React.FC<NeuroMorphExplorerProps> = ({ onBack, state, setState }) => {
    const [activeMode, setActiveMode] = useState<'name' | 'species'>('name');

    const handleNeuronSelect = (id: number | null) => {
        setState((prev) => ({
            ...prev,
            selectedNeuronId: id,
            selectedNeuronSource: id ? 'neuromorph' : null,
        }));
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
                    className={`mode-button ${activeMode === 'name' ? 'active' : ''}`}
                    onClick={() => setActiveMode('name')}
                >
                    Search by Name/ID
                </button>
                <button
                    className={`mode-button ${activeMode === 'species' ? 'active' : ''}`}
                    onClick={() => setActiveMode('species')}
                >
                    Search by Species
                </button>
            </div>

            {/* Content based on selected mode */}
            <div className="explorer-content">
                {activeMode === 'name' ? (
                    <SearchByNameId
                        selectedNeuronId={state.selectedNeuronSource === 'neuromorph' ? state.selectedNeuronId : null}
                        onNeuronSelect={handleNeuronSelect}
                        state={state}
                        setState={setState}
                    />
                ) : (
                    <SearchBySpecies
                        selectedNeuronId={state.selectedNeuronSource === 'neuromorph' ? state.selectedNeuronId : null}
                        onNeuronSelect={handleNeuronSelect}
                        state={state}
                        setState={setState}
                    />
                )}
            </div>
        </div>
    );
};

export default NeuroMorphExplorer;
