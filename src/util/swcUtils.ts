import { IAppState, ILine, design_init_root_line, root_id } from '../Wrapper';

export const lenPointRatio = 5;
export const neuronRadiusRatio = 4.5;
export const lineRadiusAddition = 8;
export const swcAttr = 7;

export function lengthToPoint(length: number) {
    return length * lenPointRatio;
}

export function pointToLength(point: number) {
    return point / lenPointRatio;
}

export function neuronRadToSize(r: number) {
    return r * neuronRadiusRatio;
}

export function sizeToNeuronRad(s: number) {
    return s / neuronRadiusRatio;
}

export function exportFile(lines: ILine[], neuronRadius: number, rootX: number, rootY: number): BlobPart[] {
    let res = '# SWC file generated using the editor in: https://deangeckt.github.io/swc_editor/';
    res = res.concat(`1 1 0.0 0.0 0.0 ${neuronRadius} -1\n`);
    lines.forEach((line) => {
        const x = pointToLength(line.points[2] - rootX);
        const y = pointToLength(rootY - line.points[3]);
        const lineStr = `${line.id} ${line.tid} ${x} ${y} ${line.z} ${line.radius} ${line.pid}\n`;
        res = res.concat(lineStr);
    });
    return [res];
}

function lineSplitToFields(line: string) {
    const fields = line.split(' ');
    if (fields.length !== swcAttr) throw new Error('SWC file bad format');
    return fields;
}

function convertAlpha(y0: number, y1: number, x0: number, x1: number) {
    const delta_x = x1 - x0;
    const delta_y = y0 - y1;

    if (delta_x === 0) return delta_y > 0 ? 0.5 : 1.5;
    if (delta_y === 0) return delta_x > 0 ? 0 : 1;

    let radianAlpha = Math.atan(delta_y / delta_x);

    if (delta_y > 0 && delta_x > 0) radianAlpha += 0;
    else if (delta_y < 0 && delta_x > 0) radianAlpha += 2 * Math.PI;
    else radianAlpha += 1 * Math.PI;

    const alpha = radianAlpha / Math.PI;
    return alpha % 2;
}

function textLineToILine(
    ilines: Record<string, ILine>,
    line: string,
    screenRootX: number,
    screenRootY: number,
    rootX: number,
    rootY: number,
): ILine {
    const fields = lineSplitToFields(line);
    const id = fields[0];
    const tid = Number(fields[1]);
    const x = Number(fields[2]);
    const y = Number(fields[3]);
    const z = Number(fields[4]);
    const radius = Number(fields[5]);
    const pid = fields[6].replace('\r', '');

    let points: number[] = [];
    const x1 = lengthToPoint(x - rootX) + screenRootX;
    const y1 = screenRootY - lengthToPoint(y - rootY);

    const father = ilines[pid];

    if (!father) throw new Error('SWC file bad format');
    ilines[pid].children.push(id);
    const x0 = father.points[2];
    const y0 = father.points[3];

    points = [x0, y0, x1, y1];
    const length = Number(Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2)).toFixed(2));
    const alpha = convertAlpha(y0, y1, x0, x1);
    return {
        id: id,
        tid: tid,
        points: points,
        radius: radius,
        pid: pid,
        length: length,
        alpha: alpha,
        children: [],
        z: z,
    };
}

export function importFile(text: string, screenRootX: number, screenRootY: number): Partial<IAppState> {
    const ilines: Record<string, ILine> = {};
    ilines[root_id] = design_init_root_line;
    let neuronRad = -1;
    let x = 0;
    let y = 0;

    const lines = text.split('\n');
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.startsWith('#')) continue;
        if (line === '') continue;

        if (neuronRad === -1) {
            const fields = lineSplitToFields(line);
            const id = fields[0];
            if (id === root_id) {
                x = Number(fields[2]);
                y = Number(fields[3]);
                neuronRad = Number(fields[5]);
                ilines[root_id].radius = neuronRad;
            }
        } else {
            const iline = textLineToILine(ilines, line, screenRootX, screenRootY, x, y);
            ilines[iline.id] = iline;
        }
    }
    if (neuronRad === -1) {
        throw new Error('SWC file bad format - missing neuron line');
    }
    return { designLines: ilines, designLastAddedId: lines.length.toString() };
}
