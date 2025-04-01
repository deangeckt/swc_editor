import { NeuronApiResponse } from './neuronUtils';

export interface LocalNeuron extends Omit<NeuronApiResponse, 'neuron_id'> {
    neuron_id: string;
}
