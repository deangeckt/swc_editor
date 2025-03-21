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
import NeuronExplorer from './NeuronExplorer';
import YAxisRevert from './YAxisRevert';
import './Design.css';

const Design = () => {
    const { should_turn_screen } = useDesign();
    const { state } = useContext(AppContext);
    const neuronSelected = state.selectedId === root_id;
    const lineSelected = state.selectedId !== none_selected_id && state.selectedId !== root_id;
    const canvas3DRef = useRef<TreeCanvas3DRef>(null);
    const [showNeuronExplorer, setShowNeuronExplorer] = useState(false);

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
                            <button
                                className="explore-neurons-btn"
                                onClick={() => setShowNeuronExplorer(!showNeuronExplorer)}
                            >
                                {showNeuronExplorer ? 'Back' : 'Explore more neurons'}
                            </button>
                            {showNeuronExplorer ? (
                                <NeuronExplorer />
                            ) : (
                                <>
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
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
export default Design;
