import { SnackbarCloseReason } from '@mui/material';
import React, { useContext } from 'react';
import { useMediaQuery } from 'react-responsive';
import { AppContext } from 'src/AppContext';
import { importFile } from 'src/util/swcUtils';
import { init_app_state } from 'src/Wrapper';

export function useDesign() {
    const { state, setState } = useContext(AppContext);
    const [error, setError] = React.useState('');

    const is_horiz = useMediaQuery({
        query: '(orientation: landscape)',
    });
    const isMobile = useMediaQuery({
        query: '(max-width: 768px)',
    });

    const should_turn_screen = (): boolean => {
        if (window.innerWidth === window.innerHeight) return false;
        return !is_horiz && isMobile;
    };

    const closeErrorBar = (event: React.SyntheticEvent | Event, reason?: SnackbarCloseReason) => {
        setError('');

        if (reason === 'clickaway') {
            return;
        }
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
                } catch (e) {
                    setError((e as Error).message);
                }
            }
        };
        reader.readAsText(e?.target?.files[0]);
    };

    const restart_designer = () => {
        setState({ ...JSON.parse(JSON.stringify(init_app_state)) });
    };

    return { should_turn_screen, uploadSwcFile, error, closeErrorBar, restart_designer };
}
