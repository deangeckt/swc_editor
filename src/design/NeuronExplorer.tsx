import React, { useContext, useState } from 'react';
import { AppContext } from '../AppContext';
import { getNeuronsBySpecies, NeuronFile } from '../neuron_file';
import { importFile } from '../util/swcUtils';
import './NeuronExplorer.css';

const getSpeciesIcon = (species: string) => {
    switch (species.toLowerCase()) {
        case 'mouse':
            return '🐭';
        case 'human':
            return '👤';
        default:
            return '🧬';
    }
};

const NeuronExplorer = () => {
    const { state, setState } = useContext(AppContext);
    const [activeSpecies, setActiveSpecies] = useState<string>('Mouse');
    const neuronsBySpecies = getNeuronsBySpecies();

    const handleNeuronChange = async (neuron: NeuronFile) => {
        try {
            const response = await fetch(`${process.env.PUBLIC_URL}/${neuron.file_path}`);
            const text = await response.text();
            const result = importFile(text, state.stage.rootX, state.stage.rootY);
            setState({ ...state, ...result, file: neuron.file_path });
        } catch (error) {
            console.error('Error loading neuron file:', error);
        }
    };

    const handleLinkClick = (e: React.MouseEvent, link: string) => {
        e.preventDefault();
        e.stopPropagation();
        // Open in a new tab within the same window
        const newWindow = window.open('', '_blank');
        if (newWindow) {
            newWindow.location.href = link;
        }
    };

    return (
        <div className="NeuronExplorer">
            <div className="species-tabs">
                {Object.keys(neuronsBySpecies).map((species) => (
                    <button
                        key={species}
                        className={`species-tab ${activeSpecies === species ? 'active' : ''}`}
                        onClick={() => setActiveSpecies(species)}
                    >
                        <span className="species-icon">{getSpeciesIcon(species)}</span>
                        <span className="species-name">{species}</span>
                    </button>
                ))}
            </div>
            <div className="neuron-list">
                {neuronsBySpecies[activeSpecies].map((neuron) => (
                    <button
                        key={neuron.file_path}
                        className={`neuron-button ${state.file === neuron.file_path ? 'selected' : ''}`}
                        onClick={() => handleNeuronChange(neuron)}
                    >
                        <span className="neuron-name">{neuron.display_name}</span>
                        <span className="neuron-description">{neuron.description}</span>
                        {neuron.link && (
                            <a
                                className="neuron-link"
                                href={neuron.link}
                                onClick={(e) => handleLinkClick(e, neuron.link!)}
                            >
                                More details
                            </a>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default NeuronExplorer;
