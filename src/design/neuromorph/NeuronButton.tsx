import React from 'react';
import { NeuronApiResponse, getDownloadUrl, openLinkInNewTab, ensureHttps } from './neuronUtils';
import { LocalNeuron } from './localNeuronTypes';

interface NeuronButtonProps {
    neuron: NeuronApiResponse | LocalNeuron;
    onClick: (neuronId: string | number, neuronName: string, archive: string) => void;
    isSelected?: boolean;
    isLoading?: boolean;
    detailsLink?: string;
    showDownload?: boolean;
}

const NeuronButton: React.FC<NeuronButtonProps> = ({
    neuron,
    onClick,
    isSelected = false,
    isLoading = false,
    detailsLink,
    showDownload = true,
}) => {
    const handleClick = () => {
        if (isSelected) return;
        console.log('handleClick', neuron.neuron_id, neuron.neuron_name, neuron.archive);
        onClick(neuron.neuron_id, neuron.neuron_name, neuron.archive);
    };

    const handleLinkClick = (e: React.MouseEvent, link: string) => {
        e.preventDefault();
        e.stopPropagation();
        openLinkInNewTab(link);
    };

    return (
        <button
            className={`neuron-button ${isSelected ? 'selected' : ''} ${isLoading ? 'loading' : ''}`}
            onClick={handleClick}
            disabled={isLoading}
        >
            <span className="neuron-name" title={neuron.neuron_name}>
                {neuron.neuron_name}
            </span>
            <div className="neuron-details">
                <span>Species: {neuron.species}</span>
                <span>Cell Type: {neuron.cell_type?.join(', ')}</span>
                <span>Brain Region: {neuron.brain_region?.join(', ')}</span>
            </div>
            {neuron.png_url && (
                <img
                    src={ensureHttps(neuron.png_url)}
                    alt={`Preview of ${neuron.neuron_name}`}
                    className="neuron-preview"
                />
            )}
            <div className="neuron-actions">
                {showDownload && (
                    <a
                        className="neuron-download"
                        href={getDownloadUrl(neuron.neuron_id, neuron.neuron_name, neuron.archive)}
                        download={`${neuron.neuron_name}.swc`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                    >
                        Download SWC File
                    </a>
                )}
                {detailsLink && (
                    <a
                        href={detailsLink}
                        onClick={(e) => handleLinkClick(e, detailsLink)}
                        className="neuron-link"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        View Details
                    </a>
                )}
            </div>
        </button>
    );
};

export default NeuronButton;
