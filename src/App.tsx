import React from 'react';
import CameraComponent from './components/ocr';

const App: React.FC = () => {
    return (
        <div>
            <h1>영양제 분석</h1>
            <CameraComponent/>
        </div>
    );
};

export default App;
