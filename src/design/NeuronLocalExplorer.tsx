import React, { useState } from 'react';
import { getNeuronsBySpecies } from '../neuron_file';
import { importFile } from '../util/swcUtils';
import NeuronButton from './neuromorph/NeuronButton';
import { IAppState } from '../Wrapper';
import './NeuronLocalExplorer.css';
import './neuromorph/neuromorph.css';

const getSpeciesIcon = (species: string) => {
    switch (species.toLowerCase()) {
        case 'mouse':
            return '🐭';
        case 'human':
            return '👨‍👩';
        default:
            return '🧬';
    }
};

interface NeuronExplorerProps {
    onBack: () => void;
    state: IAppState;
    setState: React.Dispatch<React.SetStateAction<IAppState>>;
}

const NeuronLocalExplorer: React.FC<NeuronExplorerProps> = ({ onBack, state, setState }) => {
    const neuronsBySpecies = getNeuronsBySpecies();
    const [loadingNeuronId, setLoadingNeuronId] = useState<string | null>(null);

    const handleSpeciesChange = (species: string) => {
        setState((prev) => ({
            ...prev,
            activeSpecies: species,
        }));
    };

    const handleNeuronChange = async (neuronId: number, neuronName: string) => {
        try {
            // Find the local neuron data to get the file path
            const localNeuron = Object.values(neuronsBySpecies)
                .flat()
                .find((n) => n.file_path === neuronName);

            if (!localNeuron) {
                console.error('Could not find local neuron data');
                return;
            }

            setLoadingNeuronId(localNeuron.file_path);
            const response = await fetch(`${process.env.PUBLIC_URL}/${localNeuron.file_path}`);
            const text = await response.text();
            const result = importFile(text, state.stage.rootX, state.stage.rootY);

            // Update the shared selected neuron state
            setState((prev) => ({
                ...prev,
                ...result,
                file: localNeuron.file_path,
                selectedNeuronId: neuronId,
                selectedNeuronSource: 'local',
            }));
        } catch (error) {
            console.error('Error loading neuron file:', error);
        } finally {
            setLoadingNeuronId(null);
        }
    };

    return (
        <div className="NeuronLocalExplorer">
            <div className="explorer-header">
                <button className="back-button" onClick={onBack}>
                    ← Back to Editor
                </button>
                <h2>Local Neurons</h2>
            </div>
            <div className="species-tabs">
                {Object.keys(neuronsBySpecies).map((species) => (
                    <button
                        key={species}
                        className={`species-tab ${state.activeSpecies === species ? 'active' : ''}`}
                        onClick={() => handleSpeciesChange(species)}
                    >
                        <span className="species-icon">{getSpeciesIcon(species)}</span>
                        <span className="species-name">{species}</span>
                    </button>
                ))}
            </div>
            <div className="neuron-list">
                {neuronsBySpecies[state.activeSpecies].map((neuron, index) => (
                    <NeuronButton
                        key={neuron.file_path}
                        neuron={{
                            neuron_id: index,
                            neuron_name: neuron.neuron_name,
                            species: neuron.species,
                            brain_region: [neuron.brain_region],
                            cell_type: [neuron.cell_type],
                            archive: 'Local',
                            png_url: '',
                        }}
                        onClick={(id) => handleNeuronChange(id, neuron.file_path)}
                        isSelected={state.selectedNeuronId === index && state.selectedNeuronSource === 'local'}
                        isLoading={loadingNeuronId === neuron.file_path}
                        detailsLink={neuron.link}
                        showDownload={false}
                    />
                ))}
            </div>
        </div>
    );
};

export default NeuronLocalExplorer;
