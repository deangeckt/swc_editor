// API base URL
// export const API_BASE_URL = 'http://cng.gmu.edu:8080/api';
export const API_BASE_URL = 'https://neuromorpho.org/api';
// Define interfaces for API responses
export interface NeuronApiResponse {
    neuron_id: number;
    neuron_name: string;
    species: string;
    brain_region: string[];
    cell_type: string[];
    archive: string;
    png_url: string;
}

// Generate download URL for a neuron
export const getDownloadUrl = (neuronId: string | number, neuronName: string, archive: string): string => {
    // Format the archive name to match URL requirements (lowercase, underscores)
    const archiveName = archive.toLowerCase().replace(/\s+/g, '_');
    return `https://neuromorpho.org/dableFiles/${archiveName}/CNG%20version/${neuronName}.CNG.swc`;
};

// Helper function to thoroughly clean SWC data from various sources
export const cleanSWCData = (rawData: string): string => {
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

// Open link in new tab
export const openLinkInNewTab = (link: string) => {
    const newWindow = window.open('', '_blank');
    if (newWindow) {
        newWindow.location.href = link;
    }
};
