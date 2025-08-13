import {FeatureGroup, GeoJSON, TileLayer} from "react-leaflet";
import L from "leaflet";
import React from "react";
import {HISTORICAL_MAP, HISTORICAL_MAX_ZOOM, HISTORICAL_MIN_ZOOM, HISTORICAL_OPACITY} from "../constants.jsx";
import '../styles/Layer.css'

const HistoricalLayer = ({
                             layer,
                             index,
                             visibleHistorical,
                             visibleOverlays,
                             onFeatureClick,
                             onFeatureMouseover,
                             onFeatureMouseout,
                             getFeatureStyle,
                             showLabels
                         }) => {
    const key = `${layer.era}-${index}`;
    const showMap = visibleHistorical[key] && layer.title;
    const showOverlays = visibleOverlays[key];

    return (
        <>
            {showMap && (
                <TileLayer
                    key={`map-${key}`}
                    url={`${HISTORICAL_MAP}/${layer.title}/{z}/{x}/{y}.png`}
                    tms={true}
                    opacity={HISTORICAL_OPACITY}
                    minZoom={HISTORICAL_MIN_ZOOM}
                    maxZoom={HISTORICAL_MAX_ZOOM}
                />
            )}

            {showOverlays && (
                <FeatureGroup key={`objects-${key}`}>
                    {layer.shapes.map((shape, shapeIndex) => {
                        if (!shape.geojson) return null;

                        return (
                            <GeoJSON
                                key={`${key}-${shapeIndex}-${showLabels}`} // Добавляем showLabels в ключ
                                data={shape.geojson}
                                style={(feature) => getFeatureStyle(feature, layer.era)}
                                onEachFeature={(feature, leafletLayer) => {
                                    leafletLayer.on({
                                        mouseover: (e) => onFeatureMouseover(e, layer.era),
                                        mouseout: onFeatureMouseout,
                                        click: (e) => {
                                            onFeatureClick(feature, leafletLayer);
                                        }
                                    });
                                    if (showLabels && feature.properties.name) {
                                        const label = L.tooltip({
                                            permanent: true,
                                            direction: 'bottom',
                                            className: 'feature-label',
                                            offset: [0, -5]
                                        }).setContent(feature.properties.name);
                                        leafletLayer.bindTooltip(label);
                                    } else {
                                        leafletLayer.unbindTooltip();
                                    }
                                }}
                                pointToLayer={(feature, latlng) => {
                                    const style = getFeatureStyle(feature, layer.era);
                                    const marker = L.circleMarker(latlng, style);

                                    if (showLabels && feature.properties.name) {
                                        marker.bindTooltip(feature.properties.name, {
                                            permanent: true,
                                            direction: 'bottom',
                                            className: 'feature-label',
                                            offset: [0, -5]
                                        });
                                    }

                                    return marker;
                                }}
                            />
                        );
                    })}
                </FeatureGroup>
            )}
        </>
    );
};

export default HistoricalLayer;