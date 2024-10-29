import React, { useContext } from 'react';
import Button from '@mui/material/Button';
import { AppContext } from '../AppContext';
import { useDesignCanvas } from '../tree/useDesignCanvas';
import { downloadSwcFile } from '../util/exportUtils';
import { Snackbar, Alert } from '@mui/material';
import { useDesign } from './useDesign';
import UploadIcon from '@mui/icons-material/Upload';
import DownloadIcon from '@mui/icons-material/Download';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import './DesignTopPanel.css';

function DesignTopPanel() {
    const { state } = useContext(AppContext);
    const { getLinesArrayNoRoot } = useDesignCanvas();
    const { error, closeErrorBar, uploadSwcFile, restart_designer, should_turn_screen } = useDesign();

    return (
        <div className="TopPanel">
            <Snackbar open={error !== ''} autoHideDuration={6000} onClose={closeErrorBar}>
                <Alert variant="outlined" severity="error" onClose={closeErrorBar}>
                    {error}
                </Alert>
            </Snackbar>
            <h1 style={{ paddingLeft: '1em' }}>Neuron SWC editor</h1>
            {!should_turn_screen() && (
                <div className="topPanelButtons">
                    <Button
                        className="NoCapsButton"
                        variant="text"
                        color="primary"
                        size="large"
                        component="label"
                        startIcon={<UploadIcon />}
                    >
                        Upload
                        <input type="file" accept={'.txt, .swc'} hidden onChange={(e) => uploadSwcFile(e)} />
                    </Button>
                    <Button
                        className="NoCapsButton"
                        variant="text"
                        color="primary"
                        size="large"
                        onClick={() => downloadSwcFile(state, getLinesArrayNoRoot())}
                        startIcon={<DownloadIcon />}
                    >
                        Download
                    </Button>
                    <Button
                        className="NoCapsButton"
                        variant="text"
                        color="primary"
                        size="large"
                        onClick={() => restart_designer()}
                        startIcon={<RestartAltIcon />}
                    >
                        Restart
                    </Button>
                </div>
            )}
        </div>
    );
}

export default DesignTopPanel;
