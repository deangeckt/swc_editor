import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../AppContext';
import { importFile } from '../util/swcUtils';
import './NeuroMorphExplorer.css';
import NeuronButton from './neuromorph/NeuronButton';

// API base URL
const API_BASE_URL = 'http://cng.gmu.edu:8080/api';

// Define interfaces for API responses
interface NeuronApiResponse {
    neuron_id: number;
    neuron_name: string;
    species: string;
    brain_region: string[];
    cell_type: string[];
    archive: string;
    png_url: string;
    // Add other properties as needed
}

interface NeuroMorphExplorerProps {
    onBack: () => void;
}

type ExplorerMode = 'search' | 'explore';

const NeuroMorphExplorer: React.FC<NeuroMorphExplorerProps> = ({ onBack }) => {
    const { state, setState } = useContext(AppContext);
    const [activeSpecies, setActiveSpecies] = useState<string>('');
    const [mode, setMode] = useState<ExplorerMode>('search');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [searchType, setSearchType] = useState<'id' | 'name'>('name');
    const [apiNeurons, setApiNeurons] = useState<NeuronApiResponse[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [availableSpecies, setAvailableSpecies] = useState<string[]>([]);
    const [selectedNeuronId, setSelectedNeuronId] = useState<number | null>(null);

    // Fetch neurons by species from the API - limit to just a few examples
    const fetchNeuronsBySpecies = async (species: string, page: number = 0, limit: number = 5) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `${API_BASE_URL}/neuron?page=${page}&size=${limit}&sort=neuron_name,asc&q=species:${species}`,
            );

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            setApiNeurons(data._embedded.neuronResources);
            setTotalPages(data.page.totalPages);
            setCurrentPage(data.page.number);
        } catch (err) {
            setError('Failed to fetch neurons. Please try again.');
            console.error('Error fetching neurons:', err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch a neuron by ID or name
    const searchNeuron = async () => {
        if (!searchQuery.trim()) return;

        setLoading(true);
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
            // For single neuron searches, create an array with the single result
            setApiNeurons([data]);
        } catch (err) {
            setError('Neuron not found. Please check your search query.');
            console.error('Error searching neuron:', err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch available species when component mounts
    useEffect(() => {
        const fetchAvailableSpecies = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/neuron/fields/species`);
                if (response.ok) {
                    const data = await response.json();
                    // The API returns an array of species in the 'fields' property
                    // console.log('Available species:', data.fields);
                    setAvailableSpecies(data.fields || []);
                } else {
                    console.error('Failed to fetch species:', response.status);
                    setError('Failed to load species list. Please try again.');
                }
            } catch (err) {
                console.error('Error fetching species:', err);
                setError('Failed to load species list. Please try again.');
            }
        };

        fetchAvailableSpecies();
    }, []);

    // Fetch the SWC file and load it into the application
    const loadNeuronFromApi = async (neuronId: number, neuronName: string, archive: string) => {
        try {
            setLoading(true);
            setSelectedNeuronId(neuronId);
            setError(null);

            // First, we need to get more details about the neuron to build the URL
            const detailsResponse = await fetch(`${API_BASE_URL}/neuron/id/${neuronId}`);

            if (!detailsResponse.ok) {
                throw new Error(`Failed to get neuron details: ${detailsResponse.status}`);
            }

            const neuronDetails = await detailsResponse.json();

            // The archive name and/or neuron name from the API response might need formatting
            // Some archive names have capital letters in the API but lowercase in the URL
            const archiveName = (neuronDetails.archive || archive).toLowerCase().replace(/\s+/g, '_');
            const neuronNameFormatted = neuronDetails.neuron_name || neuronName;

            // Construct the download URL based on the pattern seen in real examples
            const downloadUrl = `https://neuromorpho.org/dableFiles/${archiveName}/CNG%20version/${neuronNameFormatted}.CNG.swc`;

            // Try to download the SWC file
            const response = await fetch(downloadUrl);

            if (!response.ok) {
                throw new Error(`Failed to download SWC file: ${response.status}. URL: ${downloadUrl}`);
            }

            const swcData = await response.text();
            return processSwcData(swcData, neuronId, neuronNameFormatted);
        } catch (error) {
            console.error('Error loading neuron from API:', error);
            setError('Failed to load neuron. Please try using the Download SWC File button to download it manually.');
            setLoading(false);
            setSelectedNeuronId(null);
        }
    };

    // Helper function to thoroughly clean SWC data from various sources
    const cleanSWCData = (rawData: string): string => {
        try {
            // Split into lines for processing
            const lines = rawData.split('\n');
            const cleanedLines = lines.map((line) => {
                const trimmedLine = line.trim();

                // Handle comment lines
                if (trimmedLine.startsWith('#')) {
                    return trimmedLine;
                }

                // Handle empty lines
                if (trimmedLine === '') {
                    return '';
                }

                // Handle data lines - we expect integers or decimal values separated by spaces
                // Some SWC files have inconsistent spacing or extra spaces between values
                if (/^\s*\d/.test(trimmedLine)) {
                    // Line starts with a digit (possibly after whitespace)
                    // Split by any whitespace, filter out empty entries, then rejoin with single spaces
                    const cleanValues = trimmedLine.split(/\s+/).filter(Boolean).join(' ');
                    return cleanValues;
                }

                // For any other lines, just return them trimmed
                return trimmedLine;
            });

            // Join back into a single string, filtering out empty lines
            return cleanedLines.filter((line) => line !== '').join('\n');
        } catch (err) {
            console.error('Error cleaning SWC data:', err);
            return rawData; // Return original data if cleaning fails
        }
    };

    // Helper function to process the SWC data once downloaded
    const processSwcData = (swcData: string, neuronId: number, neuronName: string) => {
        try {
            const cleanedSwcData = cleanSWCData(swcData);
            const result = importFile(cleanedSwcData, state.stage.rootX, state.stage.rootY);
            setState({
                ...state,
                ...result,
                file: `api-neuron-${neuronId}`,
                currentNeuronName: neuronName,
            });
            setLoading(false);
            setSelectedNeuronId(null);
        } catch (error) {
            console.error('Error processing SWC data:', error);
            setError('Failed to process neuron data. The file may be in an unsupported format.');
            setLoading(false);
            setSelectedNeuronId(null);
        }
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
                    onClick={() => setMode('search')}
                >
                    Search by Name/ID
                </button>
                <button
                    className={`mode-button ${mode === 'explore' ? 'active' : ''}`}
                    onClick={() => {
                        setMode('explore');
                        setApiNeurons([]);
                    }}
                >
                    Explore by Species
                </button>
            </div>

            {/* Search mode UI */}
            {mode === 'search' && (
                <div className="search-section">
                    <div className="search-controls">
                        <select value={searchType} onChange={(e) => setSearchType(e.target.value as 'id' | 'name')}>
                            <option value="id">Neuron ID</option>
                            <option value="name">Neuron Name</option>
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
                </div>
            )}

            {/* Explore mode UI */}
            {mode === 'explore' && (
                <div className="explore-section">
                    <h3>Select a Species</h3>
                    <div className="species-grid">
                        {availableSpecies.map((species) => (
                            <button
                                key={`api-${species}`}
                                className={`species-button ${activeSpecies === species ? 'active' : ''}`}
                                onClick={() => {
                                    setActiveSpecies(species);
                                    fetchNeuronsBySpecies(species);
                                }}
                            >
                                {species}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Error message */}
            {error && <div className="error-message">{error}</div>}

            {/* Loading indicator */}
            {loading && (
                <div className="loading-overlay">
                    <div className="loading-spinner">
                        <div className="spinner"></div>
                        <div>Loading neuron data...</div>
                    </div>
                </div>
            )}

            {/* Display API neurons */}
            {apiNeurons.length > 0 && (
                <div className="neuron-results">
                    <h3>{mode === 'explore' ? `Example Neurons (${activeSpecies})` : 'Search Results'}</h3>
                    <div className="neuron-list api-neurons">
                        {apiNeurons.map((neuron) => (
                            <NeuronButton
                                key={`api-neuron-${neuron.neuron_id}`}
                                neuron={neuron}
                                onClick={loadNeuronFromApi}
                                isSelected={selectedNeuronId === neuron.neuron_id}
                                isLoading={loading && selectedNeuronId === neuron.neuron_id}
                            />
                        ))}
                    </div>

                    {/* Pagination controls */}
                    {totalPages > 1 && (
                        <div className="pagination">
                            <button
                                disabled={currentPage === 0}
                                onClick={() => {
                                    if (mode === 'explore') {
                                        fetchNeuronsBySpecies(activeSpecies, currentPage - 1);
                                    }
                                }}
                            >
                                Previous
                            </button>
                            <span>
                                Page {currentPage + 1} of {totalPages}
                            </span>
                            <button
                                disabled={currentPage === totalPages - 1}
                                onClick={() => {
                                    if (mode === 'explore') {
                                        fetchNeuronsBySpecies(activeSpecies, currentPage + 1);
                                    }
                                }}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NeuroMorphExplorer;
