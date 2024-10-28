import React, { useContext } from 'react';
import Button from '@mui/material/Button';
import { AppContext } from '../AppContext';
import { none_selected_id, section_types, root_id, default_alpha } from '../Wrapper';
import { useDesignCanvas } from '../tree/useDesignCanvas';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { TextField, InputAdornment, MenuItem } from '@mui/material';
import './DesignControlPanel.css';

function DesignControlPanel() {
    const { state } = useContext(AppContext);
    const neuronSelected = state.selectedId === root_id;
    const lineSelected = state.selectedId !== none_selected_id && state.selectedId !== root_id;
    const {
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
    } = useDesignCanvas();

    return (
        <>
            {!neuronSelected && !lineSelected ? (
                <div className="emptyHeader">Select a line / point to edit it</div>
            ) : (
                <div className="EditPanel">
                    <Button
                        className="NoCapsButton"
                        variant="outlined"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={() => addNew()}
                    >
                        Add Point
                    </Button>
                    {lineSelected ? (
                        <>
                            <TextField
                                label={'Length [µM]'}
                                variant="filled"
                                type="number"
                                value={getSelectedLength()}
                                onChange={(e) => updateLength(Number(e.target.value))}
                                InputProps={{ inputProps: { min: 0 } }}
                            />
                            <TextField
                                label={'α [Rad]'}
                                variant="filled"
                                type="number"
                                value={getSelectedAlpha()}
                                onChange={(e) => updateAlpha(Number(e.target.value))}
                                InputProps={{
                                    inputProps: { min: 0, max: 2, step: default_alpha },
                                    endAdornment: <InputAdornment position="end">PI</InputAdornment>,
                                }}
                            />
                            <TextField
                                label={'Radius [µM]'}
                                variant="filled"
                                type="number"
                                value={getSelectedRadius()}
                                onChange={(e) => updateSimpleField('radius', Number(e.target.value))}
                                InputProps={{ inputProps: { min: 0, step: 0.1 } }}
                            />
                            <TextField
                                select
                                label="Type"
                                variant="filled"
                                value={getSelectedType()}
                                onChange={(e) => updateSimpleField('tid', Number(e.target.value))}
                            >
                                {section_types.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                            <Button
                                className="NoCapsButton"
                                variant="outlined"
                                color="primary"
                                startIcon={<DeleteIcon />}
                                onClick={() => Delete()}
                            >
                                Delete Point
                            </Button>
                        </>
                    ) : (
                        <TextField
                            label={'Neuron Radius [µM]'}
                            variant="filled"
                            type="number"
                            value={state.designLines[root_id].radius}
                            InputProps={{ inputProps: { min: 0 } }}
                            onChange={(e) => updateNeuronRad(Number(e.target.value))}
                        />
                    )}
                </div>
            )}
        </>
    );
}

export default DesignControlPanel;
