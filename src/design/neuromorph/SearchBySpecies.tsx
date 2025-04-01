import React, { useState, useEffect } from 'react';
import { importFile } from '../../util/swcUtils';
import { API_BASE_URL, NeuronApiResponse, cleanSWCData } from './neuronUtils';
import NeuronButton from './NeuronButton';
import { IAppState } from '../../Wrapper';

interface SearchBySpeciesProps {
    selectedNeuronId: string | number | null;
    onNeuronSelect: (id: string | number | null) => void;
    state: IAppState;
    setState: React.Dispatch<React.SetStateAction<IAppState>>;
}

type SelectionStep = 'species' | 'brain_region' | 'cell_type' | 'neuron';

const SearchBySpecies: React.FC<SearchBySpeciesProps> = ({ selectedNeuronId, onNeuronSelect, state, setState }) => {
    // Step state
    const [currentStep, setCurrentStep] = useState<SelectionStep>('species');
    const [selectedSpecies, setSelectedSpecies] = useState<string>('');
    const [selectedBrainRegion, setSelectedBrainRegion] = useState<string>('');
    const [selectedCellType, setSelectedCellType] = useState<string>('');

    // Available options state
    const [availableSpecies, setAvailableSpecies] = useState<string[]>([]);
    const [availableBrainRegions, setAvailableBrainRegions] = useState<string[]>([]);
    const [availableCellTypes, setAvailableCellTypes] = useState<string[]>([]);
    const [availableNeurons, setAvailableNeurons] = useState<NeuronApiResponse[]>([]);

    // Loading and error states
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoadingSWC, setIsLoadingSWC] = useState<boolean>(false);

    // Fetch available species when component mounts
    useEffect(() => {
        const fetchAvailableSpecies = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`${API_BASE_URL}/neuron/fields/species`);
                if (response.ok) {
                    const data = await response.json();
                    setAvailableSpecies(data.fields || []);
                } else {
                    throw new Error(`Failed to fetch species: ${response.status}`);
                }
            } catch (err) {
                console.error('Error fetching species:', err);
                setError('Failed to load species list. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchAvailableSpecies();
    }, []);

    // Fetch available brain regions when species is selected
    useEffect(() => {
        const fetchBrainRegions = async () => {
            if (!selectedSpecies) return;

            try {
                setIsLoading(true);
                setSelectedBrainRegion(''); // Clear previous brain region selection

                // Using neuron/select with q parameter for species
                const url = new URL(`${API_BASE_URL}/neuron/select`);
                url.searchParams.append('q', `species:"${selectedSpecies}"`);
                url.searchParams.append('size', '100');

                // Convert %20 to + for spaces in the URL
                const urlString = url.toString().replace(/%20/g, '+');
                console.log('Fetching brain regions with URL:', urlString);

                const response = await fetch(urlString);

                if (!response.ok) {
                    throw new Error(`Failed to fetch brain regions: ${response.status}`);
                }

                const data = await response.json();

                if (!data._embedded?.neuronResources) {
                    setAvailableBrainRegions([]);
                    setSelectedBrainRegion(''); // Clear selection if no results
                    setError(`No data found for species: ${selectedSpecies}`);
                    return;
                }

                // Extract all brain regions from returned neurons
                const brainRegionsSet = new Set<string>();

                data._embedded.neuronResources.forEach((neuron: NeuronApiResponse) => {
                    if (Array.isArray(neuron.brain_region)) {
                        neuron.brain_region.forEach((region) => brainRegionsSet.add(region));
                    } else if (neuron.brain_region) {
                        brainRegionsSet.add(neuron.brain_region);
                    }
                });

                const uniqueBrainRegions = Array.from(brainRegionsSet);
                console.log(`Found ${uniqueBrainRegions.length} unique brain regions for ${selectedSpecies}`);

                if (uniqueBrainRegions.length > 0) {
                    setAvailableBrainRegions(uniqueBrainRegions);
                } else {
                    setError(`No brain regions found for species: ${selectedSpecies}`);
                    setAvailableBrainRegions([]);
                    setSelectedBrainRegion(''); // Clear selection if no results
                }
            } catch (err) {
                console.error('Error fetching brain regions:', err);
                setError('Failed to load brain regions. Please try again.');
                setAvailableBrainRegions([]);
                setSelectedBrainRegion(''); // Clear selection on error
            } finally {
                setIsLoading(false);
            }
        };

        fetchBrainRegions();
    }, [selectedSpecies]);

    // Fetch available cell types when brain region is selected
    useEffect(() => {
        const fetchCellTypes = async () => {
            if (!selectedSpecies || !selectedBrainRegion) return;

            try {
                setIsLoading(true);
                setSelectedCellType(''); // Clear previous cell type selection

                // Using neuron/select with q parameter for species and fq for brain region
                const url = new URL(`${API_BASE_URL}/neuron/select`);
                url.searchParams.append('q', `species:"${selectedSpecies}"`);
                url.searchParams.append('fq', `brain_region:${selectedBrainRegion}`);
                url.searchParams.append('size', '100');

                // Convert %20 to + for spaces in the URL
                const urlString = url.toString().replace(/%20/g, '+');
                console.log('Fetching cell types with URL:', urlString);

                const response = await fetch(urlString);

                if (!response.ok) {
                    throw new Error(`Failed to fetch cell types: ${response.status}`);
                }

                const data = await response.json();

                if (!data._embedded?.neuronResources) {
                    setAvailableCellTypes([]);
                    setSelectedCellType(''); // Clear selection if no results
                    setError(`No data found for species: ${selectedSpecies} and brain region: ${selectedBrainRegion}`);
                    return;
                }

                // Extract all cell types from returned neurons
                const cellTypesSet = new Set<string>();

                data._embedded.neuronResources.forEach((neuron: NeuronApiResponse) => {
                    if (Array.isArray(neuron.cell_type)) {
                        neuron.cell_type.forEach((type) => cellTypesSet.add(type));
                    } else if (neuron.cell_type) {
                        cellTypesSet.add(neuron.cell_type);
                    }
                });

                const uniqueCellTypes = Array.from(cellTypesSet);
                console.log(
                    `Found ${uniqueCellTypes.length} unique cell types for ${selectedSpecies} in ${selectedBrainRegion}`,
                );

                if (uniqueCellTypes.length > 0) {
                    setAvailableCellTypes(uniqueCellTypes);
                } else {
                    setError(`No cell types found for ${selectedSpecies} in ${selectedBrainRegion}`);
                    setAvailableCellTypes([]);
                    setSelectedCellType(''); // Clear selection if no results
                }
            } catch (err) {
                console.error('Error fetching cell types:', err);
                setError('Failed to load cell types. Please try again.');
                setAvailableCellTypes([]);
                setSelectedCellType(''); // Clear selection on error
            } finally {
                setIsLoading(false);
            }
        };

        fetchCellTypes();
    }, [selectedSpecies, selectedBrainRegion]);

    // Fetch available neurons when cell type is selected
    useEffect(() => {
        const fetchNeurons = async () => {
            if (!selectedSpecies || !selectedBrainRegion || !selectedCellType) return;

            try {
                setIsLoading(true);

                // Using the neuron/select endpoint with proper q and fq parameters format
                const url = new URL(`${API_BASE_URL}/neuron/select`);
                url.searchParams.append('q', `species:"${selectedSpecies}"`);
                url.searchParams.append('fq', `brain_region:${selectedBrainRegion}`);
                url.searchParams.append('fq', `cell_type:${selectedCellType}`);
                url.searchParams.append('size', '5');

                // Convert %20 to + for spaces in the URL
                const urlString = url.toString().replace(/%20/g, '+');
                console.log('Fetching neurons with URL:', urlString);

                const response = await fetch(urlString);

                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error(`Failed to fetch neurons: ${response.status}`);
                    }
                    throw new Error(`Failed to fetch neurons: ${response.status}`);
                }

                const data = await response.json();
                if (data._embedded?.neuronResources) {
                    setAvailableNeurons(data._embedded.neuronResources);

                    if (data._embedded.neuronResources.length === 0) {
                        setError('No matching neurons found with the selected criteria.');
                    }
                } else {
                    setAvailableNeurons([]);
                    setError('No matching neurons found with the selected criteria.');
                }
            } catch (err) {
                console.error('Error fetching neurons:', err);
                setError('Failed to load neurons. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchNeurons();
    }, [selectedSpecies, selectedBrainRegion, selectedCellType]);

    // Handle selection of each step
    const handleSpeciesSelect = (species: string) => {
        setSelectedSpecies(species);
        setSelectedBrainRegion('');
        setSelectedCellType('');
        setAvailableNeurons([]);
        setCurrentStep('brain_region');
    };

    const handleBrainRegionSelect = (region: string) => {
        setSelectedBrainRegion(region);
        setSelectedCellType('');
        setAvailableNeurons([]);
        setCurrentStep('cell_type');
    };

    const handleCellTypeSelect = (cellType: string) => {
        setSelectedCellType(cellType);
        setCurrentStep('neuron');
    };

    // Handle going back to previous step
    const handleBack = () => {
        setError(null);

        switch (currentStep) {
            case 'brain_region':
                setCurrentStep('species');
                // Clear all subsequent selections when going back to species
                setSelectedBrainRegion('');
                setSelectedCellType('');
                setAvailableBrainRegions([]);
                setAvailableCellTypes([]);
                setAvailableNeurons([]);
                break;
            case 'cell_type':
                setCurrentStep('brain_region');
                // Clear cell type and neuron selections when going back to brain region
                setSelectedCellType('');
                setAvailableCellTypes([]);
                setAvailableNeurons([]);
                break;
            case 'neuron':
                setCurrentStep('cell_type');
                // Clear neuron selections when going back to cell type
                setAvailableNeurons([]);
                break;
        }
    };

    // Handle clicking on a step in the step indicator
    const handleStepClick = (step: SelectionStep) => {
        // Only allow navigation to completed steps or the current step
        if (
            step === 'species' ||
            (step === 'brain_region' && selectedSpecies) ||
            (step === 'cell_type' && selectedSpecies && selectedBrainRegion) ||
            (step === 'neuron' && selectedSpecies && selectedBrainRegion && selectedCellType)
        ) {
            setCurrentStep(step);
            setError(null);

            // Clean up state when navigating to previous steps
            if (step === 'species') {
                setSelectedBrainRegion('');
                setSelectedCellType('');
                setAvailableBrainRegions([]);
                setAvailableCellTypes([]);
                setAvailableNeurons([]);
            } else if (step === 'brain_region') {
                setSelectedCellType('');
                setAvailableCellTypes([]);
                setAvailableNeurons([]);
            } else if (step === 'cell_type') {
                setAvailableNeurons([]);
            }
        }
    };

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

            // Format the archive name and neuron name - preserve spaces in archive name
            const archiveName = (neuronDetails.archive || archive).toLowerCase();
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

    // Render the current step
    const renderStep = () => {
        switch (currentStep) {
            case 'species':
                return (
                    <div className="selection-step">
                        <h3>Select a Species</h3>
                        <div className="options-grid">
                            {availableSpecies.map((species) => (
                                <button
                                    key={`species-${species}`}
                                    className={`option-button ${selectedSpecies === species ? 'active' : ''}`}
                                    onClick={() => handleSpeciesSelect(species)}
                                >
                                    {species}
                                </button>
                            ))}
                        </div>
                    </div>
                );

            case 'brain_region':
                return (
                    <div className="selection-step">
                        <h3>Select a Brain Region for {selectedSpecies}</h3>
                        <div className="options-grid">
                            {availableBrainRegions.length > 0 ? (
                                availableBrainRegions.map((region) => (
                                    <button
                                        key={`region-${region}`}
                                        className={`option-button ${selectedBrainRegion === region ? 'active' : ''}`}
                                        onClick={() => handleBrainRegionSelect(region)}
                                    >
                                        {region}
                                    </button>
                                ))
                            ) : (
                                <div className="no-options-message">No brain regions found for {selectedSpecies}</div>
                            )}
                        </div>
                        <div className="step-navigation">
                            <button className="back-button" onClick={handleBack}>
                                ← Back to Species
                            </button>
                        </div>
                    </div>
                );

            case 'cell_type':
                return (
                    <div className="selection-step">
                        <h3>Select a Cell Type for {selectedBrainRegion}</h3>
                        <div className="options-grid">
                            {availableCellTypes.length > 0 ? (
                                availableCellTypes.map((cellType) => (
                                    <button
                                        key={`cell-type-${cellType}`}
                                        className={`option-button ${selectedCellType === cellType ? 'active' : ''}`}
                                        onClick={() => handleCellTypeSelect(cellType)}
                                    >
                                        {cellType}
                                    </button>
                                ))
                            ) : (
                                <div className="no-options-message">
                                    No cell types found for {selectedSpecies} in {selectedBrainRegion}
                                </div>
                            )}
                        </div>
                        <div className="step-navigation">
                            <button className="back-button" onClick={handleBack}>
                                ← Back to Brain Region
                            </button>
                        </div>
                    </div>
                );

            case 'neuron':
                return (
                    <div className="selection-step">
                        <h3>Select a Neuron</h3>
                        <div className="neuron-list">
                            {availableNeurons.length > 0 ? (
                                availableNeurons.map((neuron) => (
                                    <NeuronButton
                                        key={`neuron-${neuron.neuron_id}`}
                                        neuron={neuron}
                                        onClick={loadNeuronData}
                                        isSelected={selectedNeuronId === neuron.neuron_id}
                                        isLoading={selectedNeuronId === neuron.neuron_id && isLoadingSWC}
                                    />
                                ))
                            ) : (
                                <div className="no-options-message">
                                    No neurons found matching all selected criteria
                                </div>
                            )}
                        </div>
                        <div className="step-navigation">
                            <button className="back-button" onClick={handleBack}>
                                ← Back to Cell Type
                            </button>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="explore-by-species">
            <div className="step-indicator">
                <div
                    className={`step ${currentStep === 'species' ? 'active' : ''} ${selectedSpecies ? 'completed' : ''}`}
                    onClick={() => handleStepClick('species')}
                >
                    Species
                </div>
                <div
                    className={`step ${currentStep === 'brain_region' ? 'active' : ''} ${selectedBrainRegion ? 'completed' : ''}`}
                    onClick={() => handleStepClick('brain_region')}
                >
                    Brain Region
                </div>
                <div
                    className={`step ${currentStep === 'cell_type' ? 'active' : ''} ${selectedCellType ? 'completed' : ''}`}
                    onClick={() => handleStepClick('cell_type')}
                >
                    Cell Type
                </div>
                <div
                    className={`step ${currentStep === 'neuron' ? 'active' : ''}`}
                    onClick={() => handleStepClick('neuron')}
                >
                    Neuron
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            {isLoading && <div className="loading-indicator">Loading options...</div>}

            {renderStep()}
        </div>
    );
};

export default SearchBySpecies;
