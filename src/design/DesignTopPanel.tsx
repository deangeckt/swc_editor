import React, { useContext } from 'react';
import Button from '@mui/material/Button';
import { AppContext } from '../AppContext';
import { useDesignCanvas } from '../tree/useDesignCanvas';
import { downloadSwcFile } from '../util/exportUtils';
import { Snackbar, Alert } from '@mui/material';
import { useDesign } from './useDesign';
import UploadIcon from '@mui/icons-material/Upload';
import DownloadIcon from '@mui/icons-material/Download';
import logo_img from 'src/logo192.webp';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ImageIcon from '@mui/icons-material/Image';
import './DesignTopPanel.css';

function DesignTopPanel() {
    const { state } = useContext(AppContext);
    const { getLinesArrayNoRoot, exportStageToURI } = useDesignCanvas();
    const { error, closeErrorBar, uploadSwcFile, should_turn_screen, restart_designer, open_github_page } = useDesign();

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

            {!should_turn_screen() && (
                <div className="topPanelSide">
                    <div>
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
                            onClick={() => exportStageToURI(state.file)}
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
                    </div>
                    <p style={{ margin: 0, fontSize: 13 }}>file: {state.file}</p>
                </div>
            )}
        </div>
    );
}

export default DesignTopPanel;
