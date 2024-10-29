import React, { useContext } from 'react';
import DesignControlPanel from './DesignControlPanel';
import DesignTopPanel from './DesignTopPanel';
import TreeCanvas from '../tree/TreeCanvas';
import TreeNavigation from '../tree/TreeNavigation';
import { none_selected_id } from '../Wrapper';
import { AppContext } from '../AppContext';
import { useMediaQuery } from 'react-responsive';
import './Design.css';

const Design = () => {
    const is_horiz = useMediaQuery({
        query: '(orientation: landscape)',
    });
    const isMobile = useMediaQuery({
        query: '(max-width: 768px)',
    });

    const should_turn_screen = (): boolean => {
        if (window.innerWidth === window.innerHeight) return false;
        return !is_horiz && isMobile;
    };

    const { state } = useContext(AppContext);
    return (
        <div className="Design">
            <div className="TopPanel">
                <DesignTopPanel />
            </div>
            <div className="MainPanel">
                {should_turn_screen() ? (
                    <p style={{ fontSize: '1.25em' }}>Please turn the screen horizontally</p>
                ) : (
                    <>
                        <div className="Canvas" id="Canvas">
                            <TreeCanvas />
                        </div>
                        <div className="ControlPanel">
                            <DesignControlPanel />
                            <div className="EditPanel">
                                {state.selectedId !== none_selected_id ? <TreeNavigation /> : null}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
export default Design;
