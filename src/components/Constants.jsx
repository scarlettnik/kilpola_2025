export const HISTORICAL_LAYERS = [
    {
        era: "Финский период",
        title: 'finmap',
        shapes: [
            { type: 'polygons', zip: 'fin/poligons/fin-poligons.zip', name: 'Полигоны' },
            { type: 'points', zip: 'fin/points/fin-points.zip', name: 'Точки' },
            { type: 'lines', zip: 'fin/lines/fin-lines.zip', name: 'Линии' },
        ]
    },
    {
        era: "Карельский период",
        title: 'karmap',
        shapes: [
            { type: 'polygons', zip: 'kar/poligons/kar-poligons.zip', name: 'Полигоны' },
            { type: 'points', zip: 'kar/points/kar-points.zip', name: 'Точки' },
            { type: 'lines', zip: 'kar/lines/kar-lines.zip', name: 'Линии' },
        ]
    },
    {
        era: "Советский период",
        shapes: [
            { type: 'polygons', zip: 'sov/poligons/sov-poligons.zip', name: 'Полигоны' },
            { type: 'points', zip: 'sov/points/sov-points.zip', name: 'Точки' },
            { type: 'lines', zip: 'sov/lines/sov-lines.zip', name: 'Линии' },
        ]
    },
    {
        era: "Современный период",
        shapes: [
            { type: 'points', zip: 'modern/points/modern-points.zip', name: 'Точки' },
        ]
    },
]

export const ERA_COLORS = {
    "Карельский период": "#FF8C00",
    "Финский период": "#1E90FF",
    "Советский период": "#FF0000",
    "Современный период": "#9b00ff",
};

    export const LIGHTEN_COLOR = (color, percent = 50) => {
    const num = parseInt(color.replace("#",""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = ((num >> 8) & 0x00ff) + amt;
    const B = (num & 0x0000ff) + amt;
    return "#" + (0x1000000 +
        (R<255?R<1?0:R:255)*0x10000 +
        (G<255?G<1?0:G:255)*0x100 +
        (B<255?B<1?0:B:255)).toString(16).slice(1);
};

export const GETGEOJSONBOUNDS = (geojson) => {
    if (!geojson || !geojson.features || geojson.features.length === 0) return null;
    const layer = L.geoJSON(geojson);
    const bounds = layer.getBounds();
    return [
        [bounds.getSouthWest().lat, bounds.getSouthWest().lng],
        [bounds.getNorthEast().lat, bounds.getNorthEast().lng]
    ];
};

export const GETFEATURETYPE = feature =>
    feature.geometry.type === "Point"
        ? "points"
        : feature.geometry.type === "LineString"
            ? "lines"
            : "polygons";
