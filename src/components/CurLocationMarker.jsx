import React, { useState, useEffect } from 'react';
import { useMapEvents } from 'react-leaflet';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const positionIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    shadowSize: [41, 41]
});

const directionIcon = (heading) => L.divIcon({
    html: `<div style="
        width: 0; 
        height: 0; 
        border-left: 8px solid transparent;
        border-right: 8px solid transparent;
        border-bottom: 16px solid #3388ff;
        transform: rotate(${heading}deg);
        transform-origin: 50% 100%;
    "></div>`,
    className: '',
    iconSize: [16, 16],
    iconAnchor: [8, 8]
});

export const LocationMarker = () => {
    const [position, setPosition] = useState(null);
    const [heading, setHeading] = useState(null);
    const [error, setError] = useState(null);
    const [watchId, setWatchId] = useState(null);

    const map = useMapEvents({
        locationfound(e) {
            updatePosition(e.latlng);
            setError(null);
        },
        locationerror(e) {
            setError("Не удалось определить местоположение");
            console.error("Ошибка геолокации:", e.message);
        }
    });

    const updatePosition = (newPos) => {
        setPosition(newPos);
        map.flyTo(newPos, 16);
    };

    useEffect(() => {
        map.locate({
            setView: false,
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        });

        if ('geolocation' in navigator) {
            const id = navigator.geolocation.watchPosition(
                (pos) => {
                    const { latitude, longitude, heading } = pos.coords;
                    updatePosition(L.latLng(latitude, longitude));
                    if (typeof heading === 'number' && !isNaN(heading)) {
                        setHeading(heading);
                    }
                },
                (err) => {
                    setError("Ошибка отслеживания местоположения");
                    console.error("Ошибка отслеживания:", err);
                },
                {
                    enableHighAccuracy: true,
                    maximumAge: 0,
                    timeout: 5000
                }
            );
            setWatchId(id);
        }

        const handleOrientation = (event) => {
            if (event.webkitCompassHeading !== undefined) {
                setHeading(360 - event.webkitCompassHeading);
            } else if (event.alpha !== null) {
                const alpha = event.alpha;
                if (typeof alpha === 'number') {
                    setHeading(alpha);
                }
            }
        };

        if (window.DeviceOrientationEvent !== undefined) {
            if (typeof window.DeviceOrientationEvent.requestPermission === 'function') {
                // iOS 13+ требуется запрос разрешения
                window.DeviceOrientationEvent.requestPermission()
                    .then(response => {
                        if (response === 'granted') {
                            window.addEventListener('deviceorientation', handleOrientation, true);
                        }
                    })
                    .catch(console.error);
            } else {
                // Для других устройств
                window.addEventListener('deviceorientation', handleOrientation, true);
            }
        }

        return () => {
            if (watchId) navigator.geolocation.clearWatch(watchId);
            window.removeEventListener('deviceorientation', handleOrientation);
        };
    }, [map]);

    if (error) {
        return (
            <Popup position={map.getCenter()}>
                {error}<br/>
                Проверьте разрешения браузера
            </Popup>
        );
    }

    return position ? (
        <>
            <Marker
                position={position}
                icon={positionIcon}
            >
                <Popup>Вы здесь</Popup>
            </Marker>

            {heading !== null && (
                <Marker
                    position={position}
                    icon={directionIcon(heading)}
                >
                    <Popup>Направление: {Math.round(heading)}°</Popup>
                </Marker>
            )}
        </>
    ) : null;
};