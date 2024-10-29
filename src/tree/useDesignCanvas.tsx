import { useContext } from 'react';
import { AppContext } from '../AppContext';
import { lengthToPoint, pointToLength } from '../util/swcUtils';
import {
    default_alpha,
    default_length,
    default_radius,
    default_tid,
    ILine,
    none_selected_id,
    root_id,
} from '../Wrapper';

export function useDesignCanvas() {
    const { state, setState } = useContext(AppContext);

    const getChildren = (id: string): string[] => {
        return state.designLines[id].children;
    };

    const getLinesArrayNoRoot = (): ILine[] => {
        const ents = Object.values(state.designLines);
        return ents.filter((line) => {
            return line.id !== root_id;
        });
    };

    const updateChildsRecur = (pid: string): void => {
        const childsIds = getChildren(pid);
        childsIds.forEach((child) => {
            const currLine = state.designLines[child];
            const father = state.designLines[currLine.pid];

            currLine.points[0] = father.points[2];
            currLine.points[1] = father.points[3];

            updateLinePoint(currLine);
            updateChildsRecur(child);
        });
    };

    const updateChildsBelow = (startId: string, rootX: number, rootY: number): void => {
        state.designLines[root_id].points = [-1, -1, rootX, rootY];
        updateChildsRecur(startId);
    };

    const updateLinePoint = (line: ILine) => {
        const prevX = line.points[0];
        const prevY = line.points[1];
        const [newX, newY] = lengthAlphaToXy(line.length, line.alpha, prevX, prevY);
        line.points[2] = newX;
        line.points[3] = newY;
    };

    const lengthAlphaToXy = (d: number, alpha: number, prevX: number, prevY: number) => {
        return [prevX + d * Math.cos(alpha * Math.PI), prevY - d * Math.sin(alpha * Math.PI)];
    };

    const setSelectedId = (id: string) => {
        setState({ ...state, selectedId: id });
    };

    const checkDeselect = (e: any) => {
        const clickedOnEmpty = e.target === e.target.getStage();
        if (clickedOnEmpty) {
            setSelectedId(none_selected_id);
        }
    };

    const addNewPoints = (prevX: number, prevY: number, childs: string[]) => {
        const alphas = childs.map((c) => state.designLines[c]?.alpha);
        const max_alpha = alphas.length > 0 ? Math.max(...alphas) : 0;
        const newAngle = max_alpha + default_alpha;
        const [newX, newY] = lengthAlphaToXy(lengthToPoint(default_length), newAngle, prevX, prevY);
        const newPoints = [prevX, prevY, newX, newY];
        return { newPoints, newAngle };
    };

    const addNew = () => {
        const lines = { ...state.designLines };
        const selectedLine = lines[state.selectedId];
        const newId = (Number(state.designLastAddedId) + 1).toString();

        const prevX = selectedLine.points[2];
        const prevY = selectedLine.points[3];
        const r = addNewPoints(prevX, prevY, getChildren(selectedLine.id));
        const newPoints = r.newPoints;
        const newPid = selectedLine.id;

        lines[newPid].children.push(newId);
        lines[newId] = {
            id: newId,
            points: newPoints,
            pid: newPid,
            radius: default_radius,
            tid: default_tid,
            length: lengthToPoint(default_length),
            alpha: r.newAngle,
            children: [],
            z: 0,
        };
        setState({ ...state, designLines: lines, selectedId: newId, designLastAddedId: newId });
    };

    const getSelectedRadius = () => {
        const selectedLine = state.designLines[state.selectedId];
        return selectedLine ? selectedLine.radius : default_radius;
    };

    const getSelectedType = () => {
        const selectedLine = state.designLines[state.selectedId];
        return selectedLine ? selectedLine.tid : default_tid;
    };

    const getSelectedAlpha = () => {
        const selectedLine = state.designLines[state.selectedId];
        const alpha = selectedLine ? selectedLine.alpha : default_alpha;
        return alpha;
    };

    const getSelectedLength = () => {
        const selectedLine = state.designLines[state.selectedId];
        return selectedLine ? pointToLength(selectedLine.length) : default_length;
    };

    const updateSimpleField = (field: 'tid' | 'radius', value: number) => {
        const lines = { ...state.designLines };
        const selectedLine = lines[state.selectedId];
        if (!selectedLine) return;
        (selectedLine as any)[field] = value;
        setState({ ...state, designLines: lines });
    };

    const updateAlpha = (value: number) => {
        const lines = { ...state.designLines };
        const selectedLine = lines[state.selectedId];
        if (!selectedLine) return;

        selectedLine.alpha = value;
        updateLinePoint(selectedLine);
        updateChildsBelow(selectedLine.id, state.stage.rootX, state.stage.rootY);
        setState({ ...state, designLines: lines });
    };

    const updateLength = (value: number) => {
        const lines = { ...state.designLines };
        const selectedLine = lines[state.selectedId];
        if (!selectedLine) return;

        selectedLine.length = lengthToPoint(value);
        updateLinePoint(selectedLine);
        updateChildsBelow(selectedLine.id, state.stage.rootX, state.stage.rootY);
        setState({ ...state, designLines: lines });
    };

    const updateNeuronRad = (value: number) => {
        const lines = { ...state.designLines };
        lines[root_id].radius = value;
        setState({ ...state, designLines: lines });
    };

    const deleteChildsRecur = (lines: Record<string, ILine>, pid: string): void => {
        const childsIds = getChildren(pid);
        childsIds.forEach((child) => {
            deleteChildsRecur(lines, child);
            delete lines[child];
        });
    };

    const Delete = () => {
        const lines = { ...state.designLines };
        const pid = lines[state.selectedId].pid;
        const selectedIdIdxInParent = lines[pid].children.findIndex((c) => c === state.selectedId);
        lines[pid].children.splice(selectedIdIdxInParent, 1);
        deleteChildsRecur(lines, state.selectedId);
        delete lines[state.selectedId];
        setState({ ...state, designLines: lines, selectedId: pid });
    };

    return {
        getLinesArrayNoRoot,
        updateChildsBelow,
        setSelectedId,
        checkDeselect,
        addNew,
        Delete,
        getSelectedLength,
        getSelectedAlpha,
        getSelectedRadius,
        getSelectedType,
        updateSimpleField,
        updateAlpha,
        updateLength,
        updateNeuronRad,
    };
}
