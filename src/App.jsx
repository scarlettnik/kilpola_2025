import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import MapView from './components/MapView.jsx';


const EditorContainer = styled.div`
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100vw;
`;

const App = () => {
    const [mapCenter] = useState([61.785020, 34.346881]);
    const [zoom] = useState(10);
    const [rasterLayers, setRasterLayers] = useState([]);
    const mapRef = useRef();

    return (
        <EditorContainer>
            <MapView
                mapCenter={mapCenter}
                zoom={zoom}
                mapRef={mapRef}
                rasterLayers={rasterLayers}

            />
        </EditorContainer>
    );
};

export default App;