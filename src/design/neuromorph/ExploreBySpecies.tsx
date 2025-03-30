import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../AppContext';
import { importFile } from '../../util/swcUtils';
import { API_BASE_URL, NeuronApiResponse, cleanSWCData } from './neuronUtils';
import NeuronButton from './NeuronButton';

const ExploreBySpecies: React.FC = () => {
    const { state, setState } = useContext(AppContext);

    // Species state
    const [availableSpecies, setAvailableSpecies] = useState<string[]>([]);
    const [activeSpecies, setActiveSpecies] = useState<string>('');
    const [isLoadingSpecies, setIsLoadingSpecies] = useState<boolean>(false);
    const [isLoadingSWC, setIsLoadingSWC] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Results state
    const [exampleNeurons, setExampleNeurons] = useState<NeuronApiResponse[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [selectedNeuronId, setSelectedNeuronId] = useState<number | null>(null);

    // Try to restore previously selected species from localStorage
    useEffect(() => {
        const savedSpecies = localStorage.getItem('neuromorph_active_species');
        if (savedSpecies) {
            setActiveSpecies(savedSpecies);
        }
    }, []);

    // Save active species to localStorage
    useEffect(() => {
        if (activeSpecies) {
            localStorage.setItem('neuromorph_active_species', activeSpecies);
            fetchNeuronsBySpecies(activeSpecies);
        }
    }, [activeSpecies]);

    // Fetch available species when component mounts
    useEffect(() => {
        const fetchAvailableSpecies = async () => {
            try {
                setIsLoadingSpecies(true);
                const response = await fetch(`${API_BASE_URL}/neuron/fields/species`);
                if (response.ok) {
                    const data = await response.json();
                    // The API returns an array of species in the 'fields' property
                    setAvailableSpecies(data.fields || []);
                } else {
                    console.error('Failed to fetch species:', response.status);
                    setError('Failed to load species list. Please try again.');
                }
            } catch (err) {
                console.error('Error fetching species:', err);
                setError('Failed to load species list. Please try again.');
            } finally {
                setIsLoadingSpecies(false);
            }
        };

        fetchAvailableSpecies();
    }, []);

    // Fetch neurons by species from the API - limit to just a few examples
    const fetchNeuronsBySpecies = async (species: string, page: number = 0, limit: number = 5) => {
        if (!species) return;

        setIsLoadingSpecies(true);
        setError(null);

        try {
            const response = await fetch(
                `${API_BASE_URL}/neuron?page=${page}&size=${limit}&sort=neuron_name,asc&q=species:${species}`,
            );

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            setExampleNeurons(data._embedded.neuronResources);
            setTotalPages(data.page.totalPages);
            setCurrentPage(data.page.number);
        } catch (err) {
            setError('Failed to fetch neurons. Please try again.');
            console.error('Error fetching neurons:', err);
        } finally {
            setIsLoadingSpecies(false);
        }
    };

    // Load the neuron data into the application
    const loadNeuronData = async (neuronId: number, neuronName: string, archive: string) => {
        try {
            setIsLoadingSWC(true);
            setSelectedNeuronId(neuronId);
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

            setState({
                ...state,
                ...result,
                file: `api-neuron-${neuronId}`,
                currentNeuronName: neuronName,
            });
        } catch (error) {
            console.error('Error loading neuron from API:', error);
            setError('Failed to load neuron. Please try using the Download SWC File button to download it manually.');
        } finally {
            setIsLoadingSWC(false);
        }
    };

    return (
        <div className="explore-by-species">
            <h3>Explore by Species</h3>

            <div className="species-grid">
                {availableSpecies.map((species) => (
                    <button
                        key={`species-${species}`}
                        className={`species-button ${activeSpecies === species ? 'active' : ''}`}
                        onClick={() => setActiveSpecies(species)}
                    >
                        {species}
                    </button>
                ))}
            </div>

            {error && <div className="error-message">{error}</div>}

            {isLoadingSpecies && !exampleNeurons.length && <div className="loading-indicator">Loading species...</div>}

            {activeSpecies && exampleNeurons.length > 0 && (
                <div className="species-results">
                    <h3>Example Neurons ({activeSpecies})</h3>
                    <div className="neuron-list">
                        {exampleNeurons.map((neuron) => (
                            <NeuronButton
                                key={`neuron-${neuron.neuron_id}`}
                                neuron={neuron}
                                onClick={loadNeuronData}
                                isSelected={selectedNeuronId === neuron.neuron_id}
                                isLoading={selectedNeuronId === neuron.neuron_id && isLoadingSWC}
                            />
                        ))}
                    </div>

                    {/* Pagination controls */}
                    {totalPages > 1 && (
                        <div className="pagination">
                            <button
                                disabled={currentPage === 0}
                                onClick={() => fetchNeuronsBySpecies(activeSpecies, currentPage - 1)}
                            >
                                Previous
                            </button>
                            <span>
                                Page {currentPage + 1} of {totalPages}
                            </span>
                            <button
                                disabled={currentPage === totalPages - 1}
                                onClick={() => fetchNeuronsBySpecies(activeSpecies, currentPage + 1)}
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

export default ExploreBySpecies;
