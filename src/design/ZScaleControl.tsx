import React, { useContext } from 'react';
import { AppContext } from '../AppContext';
import './ZScaleControl.css';

const ZScaleControl = () => {
    const { state, setState } = useContext(AppContext);

    const handleZScaleChange = (value: number) => {
        setState({ ...state, zScale: value });
    };

    return (
        <div className="ZScaleControl">
            <h3>Z Scale</h3>
            <div className="ZScaleInputs">
                <input
                    type="range"
                    min="1"
                    max="10"
                    step="0.5"
                    value={state.zScale}
                    onChange={(e) => handleZScaleChange(parseFloat(e.target.value))}
                    title="Z Scale"
                />
                <span className="scale-value">×{state.zScale}</span>
            </div>
        </div>
    );
};

export default ZScaleControl;
