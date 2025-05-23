import React, { useContext } from 'react';
import { AppContext } from '../AppContext';
import './YAxisRevert.css';
import './Controls.css';

const YAxisRevert = () => {
    const { state, setState } = useContext(AppContext);

    return (
        <div className="control-group">
            <h3>Y-Axis Invert</h3>
            <label className="y-axis-toggle">
                <input
                    type="checkbox"
                    checked={state.yAxisInverted}
                    onChange={() => setState({ ...state, yAxisInverted: !state.yAxisInverted })}
                />
                <span className="slider"></span>
            </label>
        </div>
    );
};

export default YAxisRevert;
