import React, { useState, useEffect } from 'react';
import { importFile } from '../../util/swcUtils';
import { API_BASE_URL, NeuronApiResponse, cleanSWCData, getDetailsLink } from './neuronUtils';
import NeuronButton from './NeuronButton';
import { IAppState } from '../../Wrapper';

interface SearchByNameIdProps {
    selectedNeuronId: string | number | null;
    onNeuronSelect: (id: string | number | null) => void;
    state: IAppState;
    setState: React.Dispatch<React.SetStateAction<IAppState>>;
}

const SearchByNameId: React.FC<SearchByNameIdProps> = ({ selectedNeuronId, onNeuronSelect, state, setState }) => {
    // Search state
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [searchType, setSearchType] = useState<'id' | 'name'>('name');
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [isLoadingSWC, setIsLoadingSWC] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Results state
    const [foundNeuron, setFoundNeuron] = useState<NeuronApiResponse | null>(null);

    // Restore previous search from localStorage if available
    useEffect(() => {
        const savedFoundNeuron = localStorage.getItem('neuromorph_search_found_neuron');
        if (savedFoundNeuron) {
            setFoundNeuron(JSON.parse(savedFoundNeuron));
        }
    }, []);

    // Save found neuron to localStorage
    useEffect(() => {
        if (foundNeuron) {
            localStorage.setItem('neuromorph_search_found_neuron', JSON.stringify(foundNeuron));
        } else {
            localStorage.removeItem('neuromorph_search_found_neuron');
        }
    }, [foundNeuron]);

    // Load the neuron data into the application
    const loadNeuronData = async (neuronId: string | number, neuronName: string, archive: string) => {
        try {
            setIsLoadingSWC(true);
            onNeuronSelect(neuronId);
            setError(null);

            // First, get more details about the neuron to build the URL
            const detailsResponse = await fetch(`${API_BASE_URL}/neuron/id/${neuronId}`);

            if (!detailsResponse.ok) {
                throw new Error(`Failed to get neuron details: ${detailsResponse.status}`);
            }

            const neuronDetails = await detailsResponse.json();

            // Format the archive name and neuron name
            const archiveName = (neuronDetails.archive || archive).toLowerCase().replace(/\s+/g, '_');
            const neuronNameFormatted = neuronDetails.neuron_name || neuronName;

            // Construct the download URL
            const downloadUrl = `https://neuromorpho.org/dableFiles/${archiveName}/CNG%20version/${neuronNameFormatted}.CNG.swc`;

            console.log('Downloading from:', downloadUrl);

            // Download the SWC file
            const response = await fetch(downloadUrl);

            if (!response.ok) {
                throw new Error(`Failed to download SWC file: ${response.status}`);
            }

            const swcData = await response.text();

            // Clean and process the SWC data
            const cleanedSwcData = cleanSWCData(swcData);
            const result = importFile(cleanedSwcData, state.stage.rootX, state.stage.rootY);

            setState((prev) => ({
                ...prev,
                ...result,
                file: `api-neuron-${neuronId}`,
                currentNeuronName: neuronName,
            }));
        } catch (error) {
            console.error('Error loading neuron from API:', error);
            setError('Failed to load neuron. Please try using the Download SWC File button to download it manually.');
        } finally {
            setIsLoadingSWC(false);
        }
    };

    // Fetch a neuron by ID or name
    const searchNeuron = async () => {
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        setError(null);

        try {
            let endpoint = '';
            if (searchType === 'id') {
                endpoint = `${API_BASE_URL}/neuron/id/${searchQuery}`;
            } else {
                endpoint = `${API_BASE_URL}/neuron/name/${searchQuery}`;
            }

            const response = await fetch(endpoint);

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            setFoundNeuron(data);
        } catch (err) {
            setError('Neuron not found. Please check your search query.');
            console.error('Error searching neuron:', err);
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="search-by-name-id">
            <h3>Search for a Neuron</h3>

            <div className="search-controls">
                <select value={searchType} onChange={(e) => setSearchType(e.target.value as 'id' | 'name')}>
                    <option value="name">Neuron Name</option>
                    <option value="id">Neuron ID</option>
                </select>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Search by ${searchType}`}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                            searchNeuron();
                        }
                    }}
                />
                <button className="search-button" onClick={searchNeuron} disabled={!searchQuery.trim()}>
                    Search
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            {isSearching && <div className="loading-indicator">Searching for neuron...</div>}

            {foundNeuron && (
                <div className="search-results">
                    <NeuronButton
                        neuron={foundNeuron}
                        onClick={loadNeuronData}
                        isSelected={selectedNeuronId === foundNeuron.neuron_id}
                        isLoading={isLoadingSWC && selectedNeuronId === foundNeuron.neuron_id}
                        detailsLink={getDetailsLink(foundNeuron.neuron_name)}
                    />
                </div>
            )}
        </div>
    );
};

export default SearchByNameId;
