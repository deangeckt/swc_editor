import { IAppState, ILine, root_id } from '../Wrapper';
import { exportFile } from './swcUtils';

const downloadAux = (blobContent: BlobPart[], type: string, fileName: string) => {
    const element = document.createElement('a');
    const file = new Blob(blobContent, { type: type });
    element.href = URL.createObjectURL(file);
    element.download = fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
};

export const downloadSwcFile = (state: IAppState, linesArray: ILine[]) => {
    const content = exportFile(linesArray, state.designLines[root_id].radius, state.stage.rootX, state.stage.rootY);
    downloadAux(content, 'text/plain;charset=utf-8', state.file);
};

export const downloadURI = (uri: string, name: string) => {
    const link = document.createElement('a');
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
