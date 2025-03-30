import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../../AppContext';
import { importFile } from '../../util/swcUtils';
import { API_BASE_URL, NeuronApiResponse, cleanSWCData } from './neuronUtils';
import NeuronButton from './NeuronButton';

const SearchBySpecies: React.FC = () => {
    const { state, setState } = useContext(AppContext);

    // Species state
    const [availableSpecies, setAvailableSpecies] = useState<string[]>([]);
    const [activeSpecies, setActiveSpecies] = useState<string>('');
    const [isLoadingSpecies, setIsLoadingSpecies] = useState<boolean>(false);
    const [isLoadingSWC, setIsLoadingSWC] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [searchInitiated, setSearchInitiated] = useState<boolean>(false);

    // Results state
    const [exampleNeurons, setExampleNeurons] = useState<NeuronApiResponse[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [selectedNeuronId, setSelectedNeuronId] = useState<number | null>(null);

    // We no longer auto-load from localStorage
    // Only fetch available species when component mounts
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

    // Explicitly call this function only when a user clicks a species
    const handleSpeciesSelection = (species: string) => {
        // Clear any existing state
        setExampleNeurons([]);
        setSelectedNeuronId(null);
        setError(null);
        setCurrentPage(0);
        setTotalPages(0);

        // Set the new active species
        setActiveSpecies(species);

        // Mark that a search has been initiated
        setSearchInitiated(true);

        // Fetch neurons for the selected species
        fetchNeuronsBySpecies(species);
    };

    // Fetch neurons by species from the API - limit to just a few examples
    const fetchNeuronsBySpecies = async (species: string, page: number = 0, limit: number = 5) => {
        if (!species) return;

        setIsLoadingSpecies(true);
        setError(null);

        try {
            // From the API docs, use the 'q' parameter with specific format:
            // http://cng.gmu.edu:8080/api/neuron?q=species:human
            const url = `${API_BASE_URL}/neuron?page=${page}&size=${limit}&sort=neuron_name,asc&q=species:"${encodeURIComponent(species)}"`;
            console.log('Fetching neurons with URL:', url);

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            console.log('API Response:', data);

            if (!data._embedded || !data._embedded.neuronResources) {
                setExampleNeurons([]);
                setError('No neurons found in the API response');
                return;
            }

            // Verify the results are for the correct species
            const resultsSpecies = data._embedded.neuronResources[0]?.species;
            console.log(`API returned results with species: ${resultsSpecies}`);

            // Double-check the response to ensure we're displaying only the requested species
            const filteredNeurons = data._embedded.neuronResources.filter(
                (neuron: NeuronApiResponse) => neuron.species.toLowerCase() === species.toLowerCase(),
            );

            console.log(`Found ${filteredNeurons.length} neurons for species: ${species}`);

            // If there are any neurons that match exactly, use those
            if (filteredNeurons.length > 0) {
                setExampleNeurons(filteredNeurons);
                setTotalPages(Math.ceil(filteredNeurons.length / limit));
                setCurrentPage(page);
            } else {
                // Try one more approach if needed
                await tryAlternativeQuery(species, page, limit);
            }
        } catch (err) {
            setError('Failed to fetch neurons. Please try again.');
            console.error('Error fetching neurons:', err);
            // Try the alternative query if the first one fails
            await tryAlternativeQuery(species, page, limit);
        } finally {
            setIsLoadingSpecies(false);
        }
    };

    // Try an alternative query approach if the first one doesn't work
    const tryAlternativeQuery = async (species: string, page: number = 0, limit: number = 10) => {
        try {
            // Try a more direct search approach
            // This URL format comes from examining the API's documentation for "Select query"
            const url = `${API_BASE_URL}/neuron/select?q=species:${encodeURIComponent(species)}&page=${page}&size=${limit}`;
            console.log('Trying alternative query URL:', url);

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            console.log('Alternative API Response:', data);

            if (!data._embedded || !data._embedded.neuronResources || data._embedded.neuronResources.length === 0) {
                setExampleNeurons([]);
                setError(`No neurons found for species: ${species}. The database may not have ${species} neurons.`);
                return;
            }

            // Check if any results match our search
            const matchingNeurons = data._embedded.neuronResources.filter(
                (neuron: NeuronApiResponse) =>
                    neuron.species.toLowerCase() === species.toLowerCase() ||
                    neuron.species.toLowerCase().includes(species.toLowerCase()) ||
                    species.toLowerCase().includes(neuron.species.toLowerCase()),
            );

            if (matchingNeurons.length > 0) {
                console.log(`Found ${matchingNeurons.length} neurons with alternative query`);
                setExampleNeurons(matchingNeurons);
                setTotalPages(Math.ceil(matchingNeurons.length / limit));
                setCurrentPage(page);
            } else {
                // If we still get results but they don't match our species, show a more informative error
                const firstNeuron = data._embedded.neuronResources[0];
                if (firstNeuron) {
                    console.log(`Warning: Requested '${species}' but API returned '${firstNeuron.species}'`);
                    setError(
                        `Note: The API returned ${firstNeuron.species} neurons when searching for ${species}. The database might not have ${species} neurons available.`,
                    );
                } else {
                    setExampleNeurons([]);
                    setError(`No neurons found for species: ${species}. Please try another search.`);
                }
            }
        } catch (err) {
            console.error('Error in alternative query:', err);
            setError(`No neurons found for species: ${species}. Please try another search.`);
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
                        onClick={() => handleSpeciesSelection(species)}
                    >
                        {species}
                    </button>
                ))}
            </div>

            {error && <div className="error-message">{error}</div>}

            {isLoadingSpecies && <div className="loading-indicator">Loading neurons...</div>}

            {searchInitiated && activeSpecies && exampleNeurons.length > 0 && (
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

            {searchInitiated && activeSpecies && exampleNeurons.length === 0 && !isLoadingSpecies && (
                <div className="no-results">
                    <p>No neurons found for species: {activeSpecies}</p>
                    <p>Try selecting a different species or check back later.</p>
                </div>
            )}
        </div>
    );
};

export default SearchBySpecies;
