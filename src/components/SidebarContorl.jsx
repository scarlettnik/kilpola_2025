import React, { useState, useEffect } from "react";
import "../styles/Control.css";
import { ERA_COLORS } from "../constants.jsx";

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
    const [isMobile, setIsMobile] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const activeEraColor = activeEra ? ERA_COLORS[activeEra] || "#888" : "#888";

    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 700);
        };
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const renderBaseLayers = () => (
        <>
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
        </>
    );

    const renderHistoricalLayers = () => (
        <>
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
        </>
    );

    const renderMusicControl = () => activeEra && (
        <div className="music-control-block">
            <button
                onClick={onMusicPause}
                className="music-button"
                style={{ backgroundColor: activeEraColor }}
            >
                {musicPaused ? '▶' : '⏸'}
            </button>
        </div>
    );

    const renderToggleButton = () => (
        <button
            className="mobile-toggle-button"
            style={{
                borderRadius: '50%',
                backgroundColor: activeEraColor,
                position: 'fixed',
                display: 'flex',
                justifyContent: 'center',
                top: '10px',
                right: '10px',
                width: '50px',
                height: '50px',
                alignItems: 'center',
                verticalAlign: 'center'
            }}
            onClick={toggleSidebar}
        >
            <div>{sidebarOpen ? '✕' : '☰'}</div>
        </button>
    );

    const renderSidebarContent = () => (
        <div className={`sidebar-container ${isMobile ? 'mobile-sidebar' : ''}`}>
            {renderBaseLayers()}
            {renderHistoricalLayers()}
            {renderMusicControl()}
        </div>
    );

    if (isMobile) {
        return (
            <>
                {renderToggleButton()}
                {sidebarOpen && renderSidebarContent()}
            </>
        );
    }

    return renderSidebarContent();
};

export default SidebarLayerControl;