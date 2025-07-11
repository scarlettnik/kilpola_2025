import React from "react";
import "./Control.css";
import { ERA_COLORS } from "./Constants.jsx";

const SidebarLayerControl = ({
                                 baseLayers,
                                 selectedBase,
                                 onSelectBase,
                                 historicalLayers,
                                 visibleHistorical,
                                 onToggleHistorical,
                                 visibleOverlays,
                                 onToggleOverlay,
                                 activeEra,
                                 musicPaused,
                                 onMusicPause
                             }) => {
    // Получаем цвет для активной эпохи
    const activeEraColor = activeEra ? ERA_COLORS[activeEra] || "#888" : "#888";

    return (
        <div className="sidebar-container">
            <h3 className="sidebar-title">Базовые карты</h3>
            <div className="section">
                {baseLayers.map(layer => (
                    <label key={layer.key} className="radio-label">
                        <input
                            type="radio"
                            name="baseLayer"
                            value={layer.key}
                            checked={selectedBase === layer.key}
                            onChange={() => onSelectBase(layer.key)}
                        />
                        <span className="custom-radio" />
                        {layer.name}
                    </label>
                ))}
            </div>

            <h3 className="sidebar-title">Исторические карты</h3>
            {historicalLayers.map((layer, index) => {
                const key = `${layer.era}-${index}`;
                const color = ERA_COLORS[layer.era] || "#888";
                return (
                    <div key={key} className="layer-block" style={{ borderLeft: `6px solid ${color}` }}>
                        {layer.title && <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={!!visibleHistorical[key]}
                                onChange={() => onToggleHistorical(key)}
                            />
                            <span className="custom-checkbox" style={{ borderColor: color }} />
                            <span className="layer-name">{layer.era}</span>
                            <span className="layer-tag">Карта</span>
                        </label>}
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={!!visibleOverlays[key]}
                                onChange={() => onToggleOverlay(key)}
                            />
                            <span className="custom-checkbox" style={{ borderColor: color }} />
                            <span className="layer-name">{layer.era}</span>
                            <span className="layer-tag">Объекты</span>
                        </label>
                    </div>
                );
            })}
            {activeEra && (
                <div className="music-control-block">
                    <button
                        onClick={onMusicPause}
                        className="music-button"
                        style={{
                            backgroundColor: activeEraColor,
                        }}
                    >
                        {musicPaused ? '▶' : '⏸'}
                    </button>
                </div>
            )}
        </div>
    );
};
export default SidebarLayerControl;