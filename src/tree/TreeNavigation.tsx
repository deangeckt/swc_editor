import React from 'react';
import Button from '@mui/material/Button';

import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import CallSplitIcon from '@mui/icons-material/CallSplit';
import { useDesignTreeNavigation } from './useDesignTreeNavigation';

function TreeNavigation() {
    const { setNextChildSelected, setBackChildSelected, setBrotherChildSelected } = useDesignTreeNavigation();

    return (
        <>
            <Button
                className="NoCapsButton"
                variant="outlined"
                color="primary"
                startIcon={<NavigateNextIcon />}
                onClick={() => setNextChildSelected()}
            >
                Select Child
            </Button>
            <Button
                className="NoCapsButton"
                variant="outlined"
                color="primary"
                startIcon={<NavigateBeforeIcon />}
                onClick={() => setBackChildSelected()}
            >
                Select Parent
            </Button>
            <Button
                className="NoCapsButton"
                variant="outlined"
                color="primary"
                startIcon={<CallSplitIcon />}
                onClick={() => setBrotherChildSelected()}
            >
                Select Sibling
            </Button>
        </>
    );
}

export default TreeNavigation;
