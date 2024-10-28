/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useContext, useEffect } from 'react';
import { lineRadiusAddition, neuronRadToSize } from '../util/swcUtils';
import { Stage, Layer, Circle, Line } from 'react-konva';
import { AppContext } from '../AppContext';
import { useDesignCanvas } from './useDesignCanvas';
import { getStage, RenderILine, root_id, root_key } from '../Wrapper';
import { neuron_color, section_color } from '../util/colors';
import { useTreeCanvasCommon } from './useTreeCanvasCommon';

const TreeCanvas = () => {
    const { state, setState } = useContext(AppContext);
    const design = true;
    const root = design ? root_id : root_key;
    const { checkDeselect, setSelectedId, getLinesArrayNoRoot } = useDesignCanvas();
    const { updateChildsBelow } = useDesignCanvas();
    const { handleWheel } = useTreeCanvasCommon();

    const widSize = window.document.getElementById('Canvas')?.offsetWidth;
    const [camera, setCamera] = React.useState({ x: 0, y: 0 });
    const [stageScale, setStageScale] = React.useState(1);
    const [stageCoord, setStageCoord] = React.useState({ x: 0, y: 0 });

    useEffect(() => {
        if (widSize && widSize !== state.stage.width) {
            console.log('changing stage size');
            const newStage = getStage('Canvas');
            if (design) {
                const lines = { ...state.designLines };
                updateChildsBelow('1', newStage.rootX, newStage.rootY);
                setState({ ...state, designLines: lines, stage: newStage });
            }
        }
    }, [setState, state, state.designLines, widSize]);

    const handleDragEnd = (e: any) => {
        setCamera({
            x: -e.target.x(),
            y: -e.target.y(),
        });
    };

    const handleWheelLocal = (e: any) => {
        handleWheel(e, setStageCoord, setStageScale);
    };

    return (
        <>
            <Stage
                pixelRatio={1}
                width={state.stage.width}
                height={state.stage.height}
                draggable
                onMouseDown={checkDeselect}
                onTouchStart={checkDeselect}
                onDragEnd={handleDragEnd}
                onWheel={handleWheelLocal}
                scaleX={stageScale}
                scaleY={stageScale}
                x={stageCoord.x}
                y={stageCoord.y}
            >
                <Layer>
                    <Circle
                        radius={neuronRadToSize(state.designLines[root_id].radius)}
                        fill={neuron_color}
                        opacity={state.selectedId === root ? 0.8 : 0.3}
                        x={state.stage.rootX}
                        y={state.stage.rootY}
                        draggable={false}
                        onClick={() => setSelectedId(root)}
                    />
                    {getLinesArrayNoRoot().map((l: RenderILine) => {
                        return (
                            <Line
                                key={l.id}
                                id={l.id}
                                stroke={state.selectedId === l.id ? 'black' : section_color[l.tid]}
                                points={[...l.points]}
                                perfectDrawEnabled={false}
                                isSelected={l.id === state.selectedId}
                                onClick={() => setSelectedId(l.id)}
                                opacity={state.selectedId === l.id ? 0.6 : 1}
                                draggable={false}
                                strokeWidth={state.selectedId === l.id ? 23 : l.radius + lineRadiusAddition}
                            />
                        );
                    })}
                </Layer>
            </Stage>
        </>
    );
};

export default TreeCanvas;
