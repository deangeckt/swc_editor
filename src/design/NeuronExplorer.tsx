import React, { useContext } from 'react';
import { AppContext } from '../AppContext';
import { neuron_files, neuron_files_display_name } from '../Wrapper';
import { importFile } from '../util/swcUtils';
import './NeuronExplorer.css';

const NeuronExplorer = () => {
    const { state, setState } = useContext(AppContext);

    const handleNeuronChange = async (fileName: string) => {
        try {
            const response = await fetch(`${process.env.PUBLIC_URL}/${fileName}`);
            const text = await response.text();
            const result = importFile(text, state.stage.rootX, state.stage.rootY);
            setState({ ...state, ...result, file: fileName });
        } catch (error) {
            console.error('Error loading neuron file:', error);
        }
    };

    return (
        <div className="NeuronExplorer">
            <div className="neuron-list">
                {neuron_files.map((fileName, index) => (
                    <button
                        key={fileName}
                        className={`neuron-button ${state.file === fileName ? 'selected' : ''}`}
                        onClick={() => handleNeuronChange(fileName)}
                    >
                        {neuron_files_display_name[index]}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default NeuronExplorer;
