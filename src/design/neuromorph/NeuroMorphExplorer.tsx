import React from 'react';
import SearchByNameId from './SearchByNameId';
import SearchByFeatures from './SearchByFeatures';
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
    // const [activeMode, setActiveMode] = useState<'name' | 'species'>('name');

    const handleNeuronSelect = (id: string | number | null) => {
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
                    className={`mode-button ${state.activeMorphMode === 'name' ? 'active' : ''}`}
                    onClick={() => setState((prev) => ({ ...prev, activeMorphMode: 'name' }))}
                >
                    Search by Name/ID
                </button>
                <button
                    className={`mode-button ${state.activeMorphMode === 'species' ? 'active' : ''}`}
                    onClick={() => setState((prev) => ({ ...prev, activeMorphMode: 'species' }))}
                >
                    Search by Features
                </button>
            </div>

            {/* Content based on selected mode */}
            <div className="explorer-content">
                {state.activeMorphMode === 'name' ? (
                    <SearchByNameId
                        selectedNeuronId={state.selectedNeuronSource === 'neuromorph' ? state.selectedNeuronId : null}
                        onNeuronSelect={handleNeuronSelect}
                        state={state}
                        setState={setState}
                    />
                ) : (
                    <SearchByFeatures
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
