export interface NeuronFile {
    file_path: string;
    display_name: string;
    description: string;
    species: string;
    link?: string;
}

export const example_file = '23P_864691137198691137.swc';

export const neuron_files: NeuronFile[] = [
    {
        file_path: example_file,
        display_name: 'Excitatory L2/3 Pyramidal',
        description: 'Layer 2/3 Pyramidal neuron from MICrONS dataset',
        species: 'Mouse',
    },
    {
        file_path: '5P-ET_864691135163324717.swc',
        display_name: 'Excitatory L5P-ET',
        description: 'Layer 5 Pyramidal neuron from MICrONS dataset',
        species: 'Mouse',
    },
    {
        file_path: 'BC_864691135341342405.swc',
        display_name: 'Inhibitory Basket',
        description: 'Basket cell from MICrONS dataset',
        species: 'Mouse',
    },
    {
        file_path: 'H16-06-008-21-02-01_685741524_m_dendriteaxon.swc',
        display_name: 'Hippocampus',
        description: 'Granule cell, Dentate gyrus',
        species: 'Human',
        link: 'https://neuromorpho.org/neuron_info.jsp?neuron_name=H16-06-008-21-02-01_685741524_m_dendriteaxon',
    },
    {
        file_path: 'AIBS-glutamatergic23human-Lein_Final.swc',
        display_name: 'Excitatory L2/3 Pyramidal',
        description: 'Intratelencephalic (IT), neocortex',
        species: 'Human',
        link: 'https://neuromorpho.org/neuron_info.jsp?neuron_name=576110753_transformed',
    },
    {
        file_path: '758319694_transformed.swc',
        display_name: 'Excitatory L2 Pyramidal',
        description: 'Intratelencephalic (IT), neocortex',
        species: 'Human',
        link: 'https://neuromorpho.org/neuron_info.jsp?neuron_name=758319694_transformed',
    },
];

export const neuron_files_display_name = neuron_files.map((neuron) => neuron.display_name);

// Helper function to group neurons by species
export const getNeuronsBySpecies = () => {
    return neuron_files.reduce(
        (acc, neuron) => {
            if (!acc[neuron.species]) {
                acc[neuron.species] = [];
            }
            acc[neuron.species].push(neuron);
            return acc;
        },
        {} as Record<string, NeuronFile[]>,
    );
};
