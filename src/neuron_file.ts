export interface NeuronFile {
    file_path: string;
    neuron_name: string;
    cell_type: string;
    brain_region: string;
    species: string;
    link: string;
}

export const example_file = '23P_864691137198691137.swc';

export const neuron_files: NeuronFile[] = [
    {
        file_path: example_file,
        neuron_name: 'L2/3 Pyramidal (MICrONS)',
        cell_type: 'Excitatory L2/3 Pyramidal',
        brain_region: 'V1',
        species: 'Mouse',
        link: 'https://www.microns-explorer.org/cortical-mm3#skeletons',
    },
    {
        file_path: '5P-ET_864691135163324717.swc',
        neuron_name: 'L5P-ET (MICrONS)',
        cell_type: 'Excitatory L5P-ET',
        brain_region: 'V1',
        species: 'Mouse',
        link: 'https://www.microns-explorer.org/cortical-mm3#skeletons',
    },
    {
        file_path: 'BC_864691135341342405.swc',
        neuron_name: 'Basket (MICrONS)',
        cell_type: 'Inhibitory Basket',
        brain_region: 'V1',
        species: 'Mouse',
        link: 'https://www.microns-explorer.org/cortical-mm3#skeletons',
    },
    {
        file_path: 'H16-06-008-21-02-01_685741524_m_dendriteaxon.swc',
        neuron_name: 'Hippocampus',
        cell_type: 'Principal cell, granule',
        brain_region: 'Hippocampus, Dentate Gyrus',
        species: 'Human',
        link: 'https://neuromorpho.org/neuron_info.jsp?neuron_name=H16-06-008-21-02-01_685741524_m_dendriteaxon',
    },
    {
        file_path: 'AIBS-glutamatergic23human-Lein_Final.swc',
        neuron_name: 'Neocortex',
        cell_type: 'Excitatory L2/3 Pyramidal, principal cell',
        brain_region: 'Neocortex frontal',
        species: 'Human',
        link: 'https://neuromorpho.org/neuron_info.jsp?neuron_name=576110753_transformed',
    },
    {
        file_path: '758319694_transformed.swc',
        neuron_name: 'Neocortex',
        cell_type: 'Excitatory L2 Pyramidal, principal cell',
        brain_region: 'Neocortex temporal',
        species: 'Human',
        link: 'https://neuromorpho.org/neuron_info.jsp?neuron_name=758319694_transformed',
    },
];

export const neuron_files_display_name = neuron_files.map((neuron) => neuron.neuron_name);

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
