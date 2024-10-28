import React from 'react';
import ReactDOM from 'react-dom/client';
import Home from './Home';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Wrapper from './Wrapper';
import './index.css';
import Design from './design/Design';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
    <Wrapper>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/design" element={<Design />} />
            </Routes>
        </BrowserRouter>
    </Wrapper>,
);
