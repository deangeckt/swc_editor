import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Wrapper from './Wrapper';
import Design from './design/Design';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
    <Wrapper>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Design />} />
            </Routes>
        </BrowserRouter>
    </Wrapper>,
);
