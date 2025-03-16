import React, { useContext, useState } from 'react';
import { AppContext } from '../AppContext';
import { section_color, color_labels } from '../util/colors';
import './ColorControlPanel.css';

interface ColorState {
    hex: string;
    opacity: number;
}

interface LocalColorState {
    [key: string]: ColorState;
}

const ColorControlPanel = () => {
    const { state, setState } = useContext(AppContext);
    const [localColors, setLocalColors] = useState<LocalColorState>(
        Object.entries(state.sectionColors).reduce((acc, [id, color]) => {
            const isRgba = color.startsWith('rgba');
            if (isRgba) {
                const [r, g, b, a] = color.match(/[\d.]+/g) || [];
                const hex = `#${Number(r).toString(16).padStart(2, '0')}${Number(g).toString(16).padStart(2, '0')}${Number(b).toString(16).padStart(2, '0')}`;
                acc[id] = { hex, opacity: Number(a) };
            } else {
                acc[id] = { hex: color, opacity: 1 };
            }
            return acc;
        }, {} as LocalColorState),
    );

    const handleColorChange = (sectionId: string, hex: string) => {
        setLocalColors((prev) => ({
            ...prev,
            [sectionId]: { ...(prev[sectionId] || { opacity: 1 }), hex },
        }));
    };

    const handleOpacityChange = (sectionId: string, opacity: number) => {
        setLocalColors((prev) => ({
            ...prev,
            [sectionId]: { ...(prev[sectionId] || { hex: section_color[sectionId] }), opacity },
        }));
    };

    const handleVisibilityChange = (sectionId: string, visible: boolean) => {
        setState({
            ...state,
            section3DVisibility: {
                ...state.section3DVisibility,
                [sectionId]: visible,
            },
        });
    };

    const handleColorComplete = (sectionId: string) => {
        const colorState = localColors[sectionId] || { hex: section_color[sectionId], opacity: 1 };
        const newColor =
            colorState.opacity === 1
                ? colorState.hex
                : `rgba(${parseInt(colorState.hex.slice(1, 3), 16)}, ${parseInt(colorState.hex.slice(3, 5), 16)}, ${parseInt(colorState.hex.slice(5, 7), 16)}, ${colorState.opacity})`;
        const newSectionColors = { ...state.sectionColors, [sectionId]: newColor };
        setState({ ...state, sectionColors: newSectionColors });
    };

    // Only show controls for sections that have labels defined
    const validSectionIds = Object.keys(color_labels);

    return (
        <div className="ColorControlPanel">
            <h3>Section Colors</h3>
            <div className="ColorGrid">
                {validSectionIds.map((id) => {
                    const colorState = localColors[id] || {
                        hex: section_color[id],
                        opacity: 1,
                    };
                    return (
                        <div key={id} className="ColorControl">
                            <label>{color_labels[id]}</label>
                            <div className="ColorInputs">
                                <input
                                    type="color"
                                    value={colorState.hex}
                                    onChange={(e) => handleColorChange(id, e.target.value)}
                                    onBlur={() => handleColorComplete(id)}
                                />
                                {state.is3D ? (
                                    <label className="visibility-toggle">
                                        <input
                                            type="checkbox"
                                            checked={state.section3DVisibility[id]}
                                            onChange={(e) => handleVisibilityChange(id, e.target.checked)}
                                        />
                                        <span className="slider"></span>
                                    </label>
                                ) : (
                                    <>
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.1"
                                            value={colorState.opacity}
                                            onChange={(e) => handleOpacityChange(id, parseFloat(e.target.value))}
                                            onMouseUp={() => handleColorComplete(id)}
                                            onTouchEnd={() => handleColorComplete(id)}
                                            title="Opacity"
                                        />
                                        <span className="opacity-value">{Math.round(colorState.opacity * 100)}%</span>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ColorControlPanel;
