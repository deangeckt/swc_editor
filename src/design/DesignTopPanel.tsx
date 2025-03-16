import React, { useContext, RefObject } from 'react';
import Button from '@mui/material/Button';
import { AppContext } from '../AppContext';
import { useDesignCanvas } from '../tree/useDesignCanvas';
import { downloadSwcFile } from '../util/exportUtils';
import { downloadURI } from '../util/exportUtils';
import { Snackbar, Alert } from '@mui/material';
import { useDesign } from './useDesign';
import UploadIcon from '@mui/icons-material/Upload';
import DownloadIcon from '@mui/icons-material/Download';
import logo_img from 'src/logo192.webp';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ImageIcon from '@mui/icons-material/Image';
import ThreeDRotationIcon from '@mui/icons-material/ThreeDRotation';
import './DesignTopPanel.css';
import { TreeCanvas3DRef } from '../tree/TreeCanvas3D';

interface DesignTopPanelProps {
    canvas3DRef: RefObject<TreeCanvas3DRef>;
}

function DesignTopPanel({ canvas3DRef }: DesignTopPanelProps) {
    const { state, setState } = useContext(AppContext);
    const { getLinesArrayNoRoot, exportStageToURI } = useDesignCanvas();
    const { error, closeErrorBar, uploadSwcFile, restart_designer, open_github_page } = useDesign();

    const toggle3DView = () => {
        setState({ ...state, is3D: !state.is3D });
    };

    const handleExportImage = () => {
        if (state.is3D) {
            const uri = canvas3DRef.current?.captureImage();
            if (uri) {
                const pngFileName = state.file.replace('.swc', '.png');
                downloadURI(uri, pngFileName);
            }
        } else {
            exportStageToURI(state.file);
        }
    };

    return (
        <div className="TopPanel">
            <Snackbar open={error !== ''} autoHideDuration={6000} onClose={closeErrorBar}>
                <Alert variant="outlined" severity="error" onClose={closeErrorBar}>
                    {error}
                </Alert>
            </Snackbar>
            <div className="topPanelTitle">
                <img className="logo_img" src={logo_img} alt="Logo" onClick={() => open_github_page()} />
                <h1 style={{ cursor: 'pointer' }} onClick={() => open_github_page()}>
                    Neuron SWC editor
                </h1>
            </div>

            <div className="topPanelSide">
                <div className="topPanelButtons">
                    <Button
                        className="NoCapsButton"
                        variant="text"
                        color="primary"
                        size="small"
                        component="label"
                        startIcon={<UploadIcon />}
                    >
                        Upload SWC
                        <input type="file" accept={'.txt, .swc'} hidden onChange={(e) => uploadSwcFile(e)} />
                    </Button>
                    <Button
                        className="NoCapsButton"
                        variant="text"
                        color="primary"
                        size="small"
                        onClick={() => downloadSwcFile(state, getLinesArrayNoRoot())}
                        startIcon={<DownloadIcon />}
                    >
                        Download SWC
                    </Button>
                    <Button
                        className="NoCapsButton"
                        variant="text"
                        color="primary"
                        size="small"
                        onClick={handleExportImage}
                        startIcon={<ImageIcon />}
                    >
                        Download PNG
                    </Button>
                    <Button
                        className="NoCapsButton"
                        variant="text"
                        color="primary"
                        size="small"
                        onClick={() => restart_designer()}
                        startIcon={<RestartAltIcon />}
                    >
                        Restart
                    </Button>
                    <Button
                        className="NoCapsButton"
                        variant="text"
                        color="primary"
                        size="small"
                        onClick={toggle3DView}
                        startIcon={<ThreeDRotationIcon />}
                    >
                        Switch to {state.is3D ? '2D' : '3D'}
                    </Button>
                </div>
                <p style={{ margin: 0, fontSize: 13 }}>file: {state.file}</p>
            </div>
        </div>
    );
}

export default DesignTopPanel;
