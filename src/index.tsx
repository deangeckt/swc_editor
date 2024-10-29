import React from 'react';
import ReactDOM from 'react-dom/client';
import Wrapper from './Wrapper';
import Design from './design/Design';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
    <Wrapper>
        <Design />
    </Wrapper>,
);
