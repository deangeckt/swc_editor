import React, { useState } from 'react';
import { AppContext } from './AppContext';
import { importFile } from './util/swcUtils';

export interface Dictionary<T> {
    [Key: string]: T;
}

export interface IStageSize {
    width: number;
    height: number;
    rootX: number;
    rootY: number;
}

export const section_types = [
    {
        value: 0,
        label: 'undefined',
    },
    {
        value: 1,
        label: 'soma',
    },
    {
        value: 2,
        label: 'axon',
    },
    {
        value: 3,
        label: 'basal dendrite',
    },
    {
        value: 4,
        label: 'apical dendrite',
    },
    {
        value: 5,
        label: 'custom',
    },
];

export const section_short_labels: Dictionary<string> = {
    0: 'undef',
    1: 'soma',
    2: 'axon',
    3: 'basal',
    4: 'apic',
    5: 'custom',
};

export type RenderILine = Pick<ILine, 'id' | 'pid' | 'points' | 'children' | 'tid' | 'radius'>;

export interface ILine {
    id: string;
    pid: string;
    tid: number;
    cid?: number;
    points: number[]; // [x1, y1, x2,y2]
    radius: number;
    length: number;
    alpha: number;
    children: string[];
    z?: number; // Optional z-coordinate
}

export interface IStageCoord {
    x: number;
    y: number;
}

export interface IAppState {
    file: string;
    stage: IStageSize;
    designLines: Record<string, ILine>;
    designLastAddedId: string;
    selectedId: string;
    // canvas
    stageScale: number;
    stageCoord: IStageCoord;
    stageRef?: any;
}

export const getStage = (canvasId: string): IStageSize => {
    const canvas_part_size = 0.85;
    const canvas_hegiht = window.document.getElementById(canvasId)?.offsetHeight ?? window.innerHeight;
    const canvas_width = window.document.getElementById(canvasId)?.offsetWidth ?? window.innerWidth * canvas_part_size;
    return {
        width: canvas_width,
        height: canvas_hegiht,
        rootX: canvas_width / 2,
        rootY: canvas_hegiht / 2,
    };
};

export const root_id = '1';
export const none_selected_id = '-1';
export const root_key = '0_1';
export const none_selected_key = '-1';

export const default_neuron_rad = 3; // in micro
export const default_radius = 0.1; // in micro
export const default_tid = 0;
export const default_length = 10; //in micro
export const default_alpha = 0.1; // in rad [PI]
export const default_section_value = 0.5;

export const example_file = '23P_864691137198691137.swc';
export const reset_file = 'New.swc';

export const design_init_root_line = () => {
    const stage = getStage('Canvas');
    return {
        id: root_id,
        pid: '-1',
        points: [-1, -1, stage.rootX, stage.rootY],
        children: [],
        tid: 1,
        radius: default_neuron_rad,
        length: 0,
        alpha: 0,
        z: undefined, // Will be set when loading from SWC
    };
};

const init_app_state: IAppState = {
    stage: getStage('Canvas'),
    designLines: {
        1: design_init_root_line(),
    },
    selectedId: root_id,
    designLastAddedId: root_id,
    file: example_file,
    stageScale: 1,
    stageCoord: { x: 0, y: 0 },
};

const Wrapper = (props: any) => {
    const [state, setState] = useState<IAppState>(init_app_state);

    React.useEffect(() => {
        const fetchFileContent = async () => {
            try {
                const response = await fetch(`${process.env.PUBLIC_URL}/${example_file}`);
                const text = await response.text();
                const r = importFile(text as string, state.stage.rootX, state.stage.rootY);
                setState({ ...state, ...r });
            } catch (error) {
                console.error('Error fetching the file:', error);
            }
        };

        fetchFileContent();
    }, []);

    return <AppContext.Provider value={{ state, setState }}>{props.children}</AppContext.Provider>;
};

export default Wrapper;
