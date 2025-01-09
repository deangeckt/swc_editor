import React from 'react';
import ReactDOM from 'react-dom/client';
import Wrapper from './Wrapper';
import Design from './design/Design';
import './index.css';
import { StageProvider } from 'src/tree/useStageRef';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
    <Wrapper>
        <StageProvider>
            <Design />
        </StageProvider>
    </Wrapper>,
);
