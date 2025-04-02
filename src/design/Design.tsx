import React, { useContext, useRef, useState } from 'react';
import DesignControlPanel from './DesignControlPanel';
import DesignTopPanel from './DesignTopPanel';
import TreeCanvas from '../tree/TreeCanvas';
import TreeCanvas3D, { TreeCanvas3DRef } from '../tree/TreeCanvas3D';
import TreeNavigation from '../tree/TreeNavigation';
import { none_selected_id, root_id } from '../Wrapper';
import { AppContext } from '../AppContext';
import { useDesign } from './useDesign';
import ColorControlPanel from './ColorControlPanel';
import ZScaleControl from './ZScaleControl';
import NeuroMorphExplorer from './neuromorph/NeuroMorphExplorer';
import YAxisRevert from './YAxisRevert';
import './Design.css';
import NeuronLocalExplorer from './NeuronLocalExplorer';

type ViewMode = 'editor' | 'local' | 'neuromorph';

const Design = () => {
    const { should_turn_screen } = useDesign();
    const { state, setState } = useContext(AppContext);
    const neuronSelected = state.selectedId === root_id;
    const lineSelected = state.selectedId !== none_selected_id && state.selectedId !== root_id;
    const canvas3DRef = useRef<TreeCanvas3DRef>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('editor');

    const handleBackToEditor = () => {
        setViewMode('editor');
    };

    return (
        <div className="Design">
            <DesignTopPanel canvas3DRef={canvas3DRef} />
            <div className="MainPanel">
                {should_turn_screen() ? (
                    <div style={{ fontSize: '1.25em', textAlign: 'center' }}>
                        <p>Please turn the screen horizontally</p>
                        <p>Use the 3D view</p>
                    </div>
                ) : (
                    <>
                        <div className="Canvas" id="Canvas">
                            {state.is3D ? <TreeCanvas3D ref={canvas3DRef} /> : <TreeCanvas />}
                        </div>
                        <div className="ControlPanel">
                            {viewMode === 'editor' && (
                                <>
                                    <div className="view-controls">
                                        <button className="view-button" onClick={() => setViewMode('local')}>
                                            Browse Local Neurons
                                        </button>
                                        <button className="view-button" onClick={() => setViewMode('neuromorph')}>
                                            Browse NeuroMorpho.org
                                        </button>
                                    </div>
                                    <YAxisRevert />
                                    {state.is3D && <ZScaleControl />}
                                    <ColorControlPanel />

                                    {!state.is3D && (
                                        <>
                                            {!neuronSelected && !lineSelected ? (
                                                <p className="emptyHeader">
                                                    Select a line / point to edit it.
                                                    <br></br>
                                                    <br></br>
                                                    <span>To zoom in, use the wheel.</span>
                                                </p>
                                            ) : (
                                                <>
                                                    <DesignControlPanel />
                                                    <div className="EditPanel">
                                                        {state.selectedId !== none_selected_id && <TreeNavigation />}
                                                    </div>
                                                </>
                                            )}
                                        </>
                                    )}
                                </>
                            )}

                            {viewMode === 'local' && (
                                <NeuronLocalExplorer onBack={handleBackToEditor} state={state} setState={setState} />
                            )}
                            {viewMode === 'neuromorph' && (
                                <NeuroMorphExplorer onBack={handleBackToEditor} state={state} setState={setState} />
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Design;
