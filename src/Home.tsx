import React, { useContext } from 'react';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';
import { AppContext } from './AppContext';
import { importFile } from './util/swcUtils';
import Snackbar, { SnackbarCloseReason } from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { init_app_state } from './Wrapper';
import './Home.css';

function Home(): JSX.Element {
    const navigate = useNavigate();
    const { state, setState } = useContext(AppContext);
    const [error, setError] = React.useState('');

    const handleClose = (event: React.SyntheticEvent | Event, reason?: SnackbarCloseReason) => {
        if (reason === 'clickaway') {
            return;
        }

        setError('');
    };

    const uploadSwcFile = async (e: any) => {
        if (e?.target?.files?.length === 0) return;
        e.preventDefault();
        const reader = new FileReader();
        reader.onload = async (e) => {
            const text = e?.target?.result;
            if (text) {
                try {
                    const r = importFile(text as string, state.stage.rootX, state.stage.rootY);
                    setState({ ...state, ...r });
                    console.log(r);
                    navigate('/design');
                } catch (e) {
                    setError((e as Error).message);
                }
            }
        };
        reader.readAsText(e?.target?.files[0]);
    };

    return (
        <div className="App">
            <Snackbar open={error !== ''} autoHideDuration={6000} onClose={handleClose}>
                <Alert variant="outlined" severity="error" onClose={handleClose}>
                    {error}
                </Alert>
            </Snackbar>
            <div className="Container">
                <Button
                    className="Button"
                    variant="outlined"
                    color="primary"
                    onClick={() => {
                        setState({ ...state, ...init_app_state });
                        navigate('/design');
                    }}
                >
                    New Neuron
                </Button>
                <div className="Divider" />
                <Button className="Button" variant="outlined" color="primary" component="label">
                    Import Neuron
                    <input type="file" accept={'.txt, .swc'} hidden onChange={(e) => uploadSwcFile(e)} />
                </Button>
            </div>
        </div>
    );
}

export default Home;
