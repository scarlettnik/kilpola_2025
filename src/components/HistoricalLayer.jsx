import {FeatureGroup, GeoJSON, TileLayer} from "react-leaflet";
import L from "leaflet";
import React from "react";
import {HISTORICAL_MAP, HISTORICAL_MAX_ZOOM, HISTORICAL_MIN_ZOOM, HISTORICAL_OPACITY} from "../constants.jsx";

const HistoricalLayer = ({
                             layer,
                             index,
                             visibleHistorical,
                             visibleOverlays,
                             onFeatureClick,
                             onFeatureMouseover,
                             onFeatureMouseout,
                             getFeatureStyle
                         }) => {
    const key = `${layer.era}-${index}`;
    const showMap = visibleHistorical[key] && layer.title;
    const showOverlays = visibleOverlays[key];

    console.log(layer.title)

    return (
        <>
            {showMap && (
                <TileLayer
                    key={`map-${key}`}
                    url={`${HISTORICAL_MAP}/${layer.title}/{z}/{x}/{y}.png`}
                    // url={`http://192.168.2.110:8080/Personal_Data/Lichnaya_pomojka_Antonova_Sergeya/${layer.title}/tiles/{z}/{x}/{y}.png`}
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
                                key={`${key}-${shapeIndex}`}
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
                                }}
                                pointToLayer={(feature, latlng) => {
                                    const style = getFeatureStyle(feature, layer.era);
                                    return L.circleMarker(latlng, style);
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