import React, { useEffect, useState, useRef, useCallback } from "react";
import {
    MapContainer,
    TileLayer,
    useMapEvents,
    ZoomControl
} from "react-leaflet";
import L from "leaflet";
import shp from "shpjs";
import "leaflet/dist/leaflet.css";
import ReactDOMServer from 'react-dom/server';
import SidebarLayerControl from "./SidebarContorl.jsx";
import HistoricalLayer from "./HistoricalLayer.jsx";
import EraMusicPlayer from "./EraMusicPlayer.jsx";
import {ERA_COLORS, GETGEOJSONBOUNDS, HISTORICAL_LAYERS, LIGHTEN_COLOR} from "./Constants.jsx";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png"
});


const MapClickHandler = ({ onClick }) => {
    useMapEvents({
        click: () => onClick()
    });
    return null;
};

const MapView = ({
                     historicalLayers = HISTORICAL_LAYERS,
                     showBaseMap = true,
                     initialZoom = 13,
                     minZoom = 10
                 }) => {
    const [layers, setLayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedFeature, setSelectedFeature] = useState(null);
    const mapRef = useRef(null);
    const originalStyles = useRef(new WeakMap());
    const [selectedBaseLayer, setSelectedBaseLayer] = useState('osm');
    const [visibleHistorical, setVisibleHistorical] = useState({});
    const [visibleOverlays, setVisibleOverlays] = useState({});
    const [activeEra, setActiveEra] = useState(null);
    const [musicPaused, setMusicPaused] = useState(false);

    const getFeatureType = feature =>
        feature.geometry.type === "Point"
            ? "points"
            : feature.geometry.type === "LineString"
                ? "lines"
                : "polygons";

    const getFeatureStyle = useCallback((feature, era) => {
        const type = getFeatureType(feature);
        const baseColor = ERA_COLORS[era] || "#800080";

        const fillColor = type === "polygons"
            ? LIGHTEN_COLOR(baseColor, 50)
            : baseColor;

        return {
            color: baseColor,
            fillColor: fillColor,
            weight: type === ("lines" || 'points') ? 5 : 1,
            opacity: 1,
            fillOpacity: type === "polygons" ? 0.5 : 0.8,
            radius: 6
        };
    }, []);

    const getHoverStyle = useCallback((feature, era) => {
        const baseStyle = getFeatureStyle(feature, era);
        return {
            ...baseStyle,
            weight: baseStyle.weight * 2,
            fillOpacity: Math.min(baseStyle.fillOpacity + 0.2, 1),
            radius: baseStyle.radius ? baseStyle.radius * 2 : undefined
        };
    }, [getFeatureStyle]);

    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        setError(null);

        const loadAllData = async () => {
            try {
                const loadedLayers = await Promise.all(historicalLayers.map(async (layer) => {
                    try {
                        const loadedShapes = await Promise.all(layer.shapes.map(async (shape) => {
                            try {
                                const response = await fetch(`/${shape.zip}`);
                                if (!response.ok) throw new Error(`Не удалось загрузить ${shape.zip}`);
                                const buffer = await response.arrayBuffer();
                                const geojson = await shp(buffer);
                                if (!geojson || geojson.type !== "FeatureCollection") {
                                    throw new Error(`Неверный формат GeoJSON для ${shape.zip}`);
                                }
                                return {
                                    ...shape,
                                    geojson,
                                    bounds: GETGEOJSONBOUNDS(geojson),
                                    error: null
                                };
                            } catch (e) {
                                return {
                                    ...shape,
                                    error: e.message,
                                    geojson: null
                                };
                            }
                        }));

                        return {
                            ...layer,
                            shapes: loadedShapes,
                            error: null
                        };
                    } catch (e) {
                        return {
                            ...layer,
                            error: e.message,
                            shapes: []
                        };
                    }
                }));

                if (isMounted) {
                    setLayers(loadedLayers);
                }
            } catch (e) {
                if (isMounted) {
                    console.error("Общая ошибка загрузки:", e);
                    setError(e.message);
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadAllData();
        return () => { isMounted = false; };
    }, [historicalLayers]);

    const handleMapClick = () => {
        if (mapRef.current) {
            mapRef.current.closePopup();
        }
        setSelectedFeature(null);
    };

    const handleFeatureMouseover = useCallback((e, era) => {
        const layer = e.target;
        const feature = layer.feature;

        if (!originalStyles.current.has(layer)) {
            originalStyles.current.set(layer, {...layer.options});
        }

        if (layer.setStyle) {
            const hoverStyle = getHoverStyle(feature, era);
            layer.setStyle(hoverStyle);
        }
    }, [getHoverStyle]);

    const handleFeatureMouseout = useCallback((e) => {
        const layer = e.target;
        const originalStyle = originalStyles.current.get(layer);

        if (originalStyle && layer.setStyle) {
            layer.setStyle(originalStyle);
        }
    }, []);

    const renderPopupContent = useCallback((feature) => {
        if (!feature?.properties) return null
        console.log(feature.properties)
        return ReactDOMServer.renderToString(
            <div style={{ maxWidth: '300px' }}>
                <h4 style={{ marginTop: 0 }}>{feature.properties.name || 'Объект'}</h4>
                {feature.properties.image && (
                    <img src={feature.properties.image} alt={feature.properties.name || ''} style={{ maxWidth: '100%' }} />
                )}

            </div>
        );
    }, []);

    const handleFeatureClick = useCallback((feature, layer) => {
        if (mapRef.current) {
            mapRef.current.closePopup();
        }

        if (feature.properties?.url) {
            setSelectedFeature(feature);
            console.log(ft)
        } else {
            const popupContent = renderPopupContent(feature);
            layer.bindPopup(popupContent).openPopup();
        }
    }, [renderPopupContent]);

    useEffect(() => {
        let foundActiveEra = null;
        let activeErasCount = 0;

        historicalLayers.forEach((layer, index) => {
            const key = `${layer.era}-${index}`;
            const hasMap = layer.title != null;

            const isEraActive =
                (hasMap && visibleHistorical[key] && visibleOverlays[key]) ||
                (!hasMap && visibleOverlays[key]);

            if (isEraActive) {
                foundActiveEra = layer.era;
                activeErasCount++;
            }
        });

        if (activeErasCount === 1) {
            setActiveEra(foundActiveEra);
        } else {
            setActiveEra(null);
        }
    }, [visibleHistorical, visibleOverlays, historicalLayers]);

    const handleMusicPause = () => {
        setMusicPaused(prev => !prev);
    };

    return (
        <div style={{ position:"relative", height:"100%", width:"100%", overflow: 'hidden'}}>
            <SidebarLayerControl
                baseLayers={[
                    { key: 'osm', name: 'OpenStreetMap' },
                    { key: 'esri', name: 'Спутник' }
                ]}
                selectedBase={selectedBaseLayer}
                onSelectBase={setSelectedBaseLayer}
                historicalLayers={layers}
                visibleHistorical={visibleHistorical}
                onToggleHistorical={(key) => setVisibleHistorical(prev => ({ ...prev, [key]: !prev[key] }))}
                visibleOverlays={visibleOverlays}
                onToggleOverlay={(key) => setVisibleOverlays(prev => ({ ...prev, [key]: !prev[key] }))}
                activeEra={activeEra}
                musicPaused={musicPaused}
                onMusicPause={handleMusicPause}
            />

            <EraMusicPlayer
                activeEra={activeEra}
                musicPaused={musicPaused}
                onMusicPause={handleMusicPause}
            />

            <MapContainer
                zoomControl={false}
                whenCreated={map => {
                    mapRef.current = map;
                }}
                center={[61.18474,29.97479]}
                zoom={initialZoom}
                minZoom={minZoom}
                style={{ height:"100%", width:"100%" }}
                maxZoom={19}
                attributionControl={false}
            >
                <MapClickHandler onClick={handleMapClick} />
                <ZoomControl position="topright" />

                {selectedBaseLayer === 'osm' && (
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                )}

                {selectedBaseLayer === 'esri' && (
                    <TileLayer
                        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                    />
                )}

                {layers.map((layer, index) => (
                    <HistoricalLayer
                        key={`${layer.era}-${index}`}
                        layer={layer}
                        index={index}
                        visibleHistorical={visibleHistorical}
                        visibleOverlays={visibleOverlays}
                        getFeatureStyle={getFeatureStyle}
                        onFeatureClick={(feature, leafletLayer) => {
                            handleFeatureClick(feature, leafletLayer);
                            setSelectedFeature(feature);
                        }}
                        onFeatureMouseover={handleFeatureMouseover}
                        onFeatureMouseout={handleFeatureMouseout}
                    />
                ))}
            </MapContainer>

            {selectedFeature?.properties?.url && (
                <div style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: '30vw',
                    height: '100vh',
                    zIndex: 1000,
                    background: "white",
                    border: "1px solid #ccc",
                    borderRadius: 8,
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
                    color: 'black'
                }}>
                    <div style={{
                        padding: "10px 15px",
                        background: "#f8f9fa",
                        borderBottom: "1px solid #dee2e6",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                    }}>
                        <h3 style={{ margin: 0 }}>{selectedFeature.properties.name || 'Объект'}</h3>
                        <button
                            onClick={() => setSelectedFeature(null)}
                            style={{
                                background: "none",
                                border: "none",
                                fontSize: "1.5rem",
                                cursor: "pointer",
                                color: "#6c757d"
                            }}
                        >
                            ×
                        </button>
                    </div>
                    <iframe
                        src={`${selectedFeature.properties?.url}?useformat=mobile`}
                        title="Feature info"
                        style={{
                            flex: 1,
                            border: "none",
                            width: "100%",
                            height: "100%",
                            borderRadius: "0 0 8px 8px"
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default MapView;