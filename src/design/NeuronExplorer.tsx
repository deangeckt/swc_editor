import React, { useContext, useState } from 'react';
import { AppContext } from '../AppContext';
import { getNeuronsBySpecies } from '../neuron_file';
import { importFile } from '../util/swcUtils';
import NeuronButton from './neuromorph/NeuronButton';
import './NeuronExplorer.css';

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
}

const NeuronExplorer: React.FC<NeuronExplorerProps> = ({ onBack }) => {
    const { state, setState } = useContext(AppContext);
    const neuronsBySpecies = getNeuronsBySpecies();
    const [loadingNeuronId, setLoadingNeuronId] = useState<string | null>(null);

    const handleSpeciesChange = (species: string) => {
        setState({ ...state, activeSpecies: species });
    };

    const handleNeuronChange = async (neuronId: number, neuronName: string) => {
        try {
            // Find the local neuron data to get the file path
            const localNeuron = Object.values(neuronsBySpecies)
                .flat()
                .find((n) => n.display_name === neuronName);

            if (!localNeuron) {
                console.error('Could not find local neuron data');
                return;
            }

            setLoadingNeuronId(localNeuron.file_path);
            const response = await fetch(`${process.env.PUBLIC_URL}/${localNeuron.file_path}`);
            const text = await response.text();
            const result = importFile(text, state.stage.rootX, state.stage.rootY);
            setState({ ...state, ...result, file: localNeuron.file_path });
            // onBack(); // Return to editor view after loading
        } catch (error) {
            console.error('Error loading neuron file:', error);
        } finally {
            setLoadingNeuronId(null);
        }
    };

    return (
        <div className="NeuronExplorer">
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
                {neuronsBySpecies[state.activeSpecies].map((neuron) => (
                    <NeuronButton
                        key={neuron.file_path}
                        neuron={{
                            neuron_id: parseInt(neuron.file_path.split('_')[1]) || 0,
                            neuron_name: neuron.display_name,
                            species: neuron.species,
                            brain_region: [neuron.description],
                            cell_type: [neuron.display_name.split(' ')[0]],
                            archive: 'Local',
                            png_url: '',
                        }}
                        onClick={handleNeuronChange}
                        isSelected={state.file === neuron.file_path}
                        isLoading={loadingNeuronId === neuron.file_path}
                        detailsLink={neuron.link}
                        showDownload={false}
                    />
                ))}
            </div>
        </div>
    );
};

export default NeuronExplorer;
