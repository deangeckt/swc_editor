import React, { useContext } from 'react';
import DesignControlPanel from './DesignControlPanel';
import DesignTopPanel from './DesignTopPanel';
import TreeCanvas from '../tree/TreeCanvas';
import TreeCanvas3D from '../tree/TreeCanvas3D';
import TreeNavigation from '../tree/TreeNavigation';
import { none_selected_id, root_id } from '../Wrapper';
import { AppContext } from '../AppContext';
import { useDesign } from './useDesign';
import ColorControlPanel from './ColorControlPanel';
import ZScaleControl from './ZScaleControl';
import './Design.css';

const Design = () => {
    const { should_turn_screen } = useDesign();
    const { state } = useContext(AppContext);
    const neuronSelected = state.selectedId === root_id;
    const lineSelected = state.selectedId !== none_selected_id && state.selectedId !== root_id;

    return (
        <div className="Design">
            <DesignTopPanel />
            <div className="MainPanel">
                {should_turn_screen() ? (
                    <p style={{ fontSize: '1.25em' }}>Please turn the screen horizontally</p>
                ) : (
                    <>
                        <div className="Canvas" id="Canvas">
                            {state.is3D ? <TreeCanvas3D /> : <TreeCanvas />}
                        </div>
                        <div className="ControlPanel">
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
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
export default Design;
