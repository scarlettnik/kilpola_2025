import {FeatureGroup, GeoJSON, TileLayer} from "react-leaflet";
import L from "leaflet";
import React from "react";

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

    return (
        <>
            {showMap && (
                <TileLayer
                    key={`map-${key}`}
                    url={`http://192.168.2.110:8080/Personal_Data/Lichnaya_pomojka_Antonova_Sergeya/${layer.title}/tiles/{z}/{x}/{y}.png`}
                    tms={true}
                    opacity={0.7}
                    minZoom={0}
                    maxZoom={20}
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