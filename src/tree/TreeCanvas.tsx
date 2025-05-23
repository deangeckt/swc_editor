import React, { useContext, useEffect } from 'react';
import { lineRadiusAddition, neuronRadToSize } from '../util/swcUtils';
import { Stage, Layer, Circle, Line } from 'react-konva';
import { AppContext } from '../AppContext';
import { useDesignCanvas } from './useDesignCanvas';
import { getStage, RenderILine, root_id, root_key } from '../Wrapper';
import { selected_color, section_color } from '../util/colors';
import { useSharedStageRef } from './useStageRef';

const TreeCanvas = () => {
    const { setStageRef } = useSharedStageRef();
    const { state, setState } = useContext(AppContext);
    const design = true;
    const root = design ? root_id : root_key;
    const { checkDeselect, setSelectedId, getLinesArrayNoRoot, updateChildsBelow } = useDesignCanvas();

    const widSize = window.document.getElementById('Canvas')?.offsetWidth;

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

    // const handleDragEnd = (e: any) => {
    //     setCamera({
    //         x: -e.target.x(),
    //         y: -e.target.y(),
    //     });
    // };

    const handleWheelLocal = (e: any) => {
        e.evt.preventDefault();
        const scaleBy = 1.15;
        const stage = e.target.getStage();
        const oldScale = stage.scaleX();
        const mousePointTo = {
            x: stage.getPointerPosition().x / oldScale - stage.x() / oldScale,
            y: stage.getPointerPosition().y / oldScale - stage.y() / oldScale,
        };

        const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
        const newStageCoord = {
            x: -(mousePointTo.x - stage.getPointerPosition().x / newScale) * newScale,
            y: -(mousePointTo.y - stage.getPointerPosition().y / newScale) * newScale,
        };
        setState({ ...state, stageScale: newScale, stageCoord: newStageCoord });
    };

    const onMouseLeave = (e: any) => {
        const container = e.target.getStage().container();
        container.style.cursor = 'default';
    };

    const onMouseEnter = (e: any) => {
        const container = e.target.getStage().container();
        container.style.cursor = 'pointer';
    };

    const getLineColor = (tid: number, isSelected: boolean) => {
        if (isSelected) return selected_color;
        // Use the user-defined color if available, otherwise fall back to the default section color
        // If neither exists, use a default color
        return state.sectionColors[tid] || section_color[tid] || section_color[0];
    };

    return (
        <>
            <Stage
                ref={setStageRef}
                pixelRatio={1}
                width={state.stage.width}
                height={state.stage.height}
                draggable
                onMouseDown={checkDeselect}
                onTouchStart={checkDeselect}
                // onTouchEnd={handleDragEnd}
                // onDragEnd={handleDragEnd}
                onWheel={handleWheelLocal}
                scaleX={state.stageScale}
                scaleY={state.yAxisInverted ? state.stageScale : -state.stageScale}
                x={state.stageCoord.x}
                y={state.stageCoord.y}
            >
                <Layer>
                    <Circle
                        radius={neuronRadToSize(state.designLines[root_id].radius)}
                        fill={state.sectionColors['1']}
                        opacity={state.selectedId === root ? 0.95 : 0.5}
                        x={state.stage.rootX}
                        y={state.stage.rootY}
                        draggable={false}
                        onClick={() => setSelectedId(root)}
                        onTouchEnd={() => setSelectedId(root)}
                        onMouseEnter={onMouseEnter}
                        onMouseLeave={onMouseLeave}
                    />
                    {getLinesArrayNoRoot().map((l: RenderILine) => {
                        return (
                            <Line
                                key={l.id}
                                id={l.id}
                                stroke={getLineColor(l.tid, state.selectedId === l.id)}
                                points={[...l.points]}
                                perfectDrawEnabled={false}
                                isSelected={l.id === state.selectedId}
                                onClick={() => setSelectedId(l.id)}
                                onTouchEnd={() => setSelectedId(l.id)}
                                opacity={state.selectedId === l.id ? 0.5 : 1}
                                draggable={false}
                                strokeWidth={state.selectedId === l.id ? 23 : l.radius + lineRadiusAddition}
                                onMouseEnter={onMouseEnter}
                                onMouseLeave={onMouseLeave}
                            />
                        );
                    })}
                </Layer>
            </Stage>
        </>
    );
};

export default TreeCanvas;
