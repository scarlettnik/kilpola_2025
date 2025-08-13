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
        border-bottom: 30px solid #3388ff;
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
    const [permissionDenied, setPermissionDenied] = useState(false);
    const [orientationOffset, setOrientationOffset] = useState(0);

    const map = useMapEvents({
        locationfound(e) {
            updatePosition(e.latlng);
            setError(null);
            setPermissionDenied(false);
        },
        locationerror(e) {
            if (e.code === 1) {
                setPermissionDenied(true);
            }
            setError("Не удалось определить местоположение");
            console.error("Ошибка геолокации:", e.message);
        }
    });

    const updatePosition = (newPos) => {
        setPosition(newPos);
        map.flyTo(newPos, 16);
    };

    const requestLocationPermission = () => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    updatePosition(L.latLng(latitude, longitude));
                    setError(null);
                    setPermissionDenied(false);
                },
                (err) => {
                    if (err.code === 1) {
                        setPermissionDenied(true);
                    }
                    setError("Доступ к геолокации запрещен");
                    console.error("Ошибка доступа:", err);
                },
                { enableHighAccuracy: true, timeout: 10000 }
            );
        } else {
            setError("Геолокация не поддерживается вашим браузером");
        }
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
                    const { latitude, longitude, heading: geoHeading } = pos.coords;
                    updatePosition(L.latLng(latitude, longitude));
                    if (typeof geoHeading === 'number' && !isNaN(geoHeading)) {
                        setHeading(geoHeading);
                    }
                },
                (err) => {
                    if (err.code === 1) {
                        setPermissionDenied(true);
                    }
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
        } else {
            setError("Геолокация не поддерживается вашим браузером");
        }

        const handleDeviceOrientation = (event) => {
            if (event.webkitCompassHeading !== undefined) {
                setHeading(event.webkitCompassHeading);
            } else if (event.alpha !== null) {
                const alpha = event.alpha;
                const orientation = screen.orientation.angle;
                const newHeading = (360 - alpha + orientation) % 360;
                setHeading(newHeading);
            }
        };

        const updateScreenOrientation = () => {
            setOrientationOffset(screen.orientation.angle);
        };

        // Обработка разрешений для deviceorientation
        if (window.DeviceOrientationEvent !== undefined) {
            if (typeof window.DeviceOrientationEvent.requestPermission === 'function') {
                window.DeviceOrientationEvent.requestPermission()
                    .then(response => {
                        if (response === 'granted') {
                            window.addEventListener('deviceorientation', handleDeviceOrientation, true);
                        }
                    })
                    .catch(console.error);
            } else {
                window.addEventListener('deviceorientation', handleDeviceOrientation, true);
            }
        }

        window.addEventListener('orientationchange', updateScreenOrientation);

        return () => {
            if (watchId) navigator.geolocation.clearWatch(watchId);
            window.removeEventListener('deviceorientation', handleDeviceOrientation);
            window.removeEventListener('orientationchange', updateScreenOrientation);
        };
    }, [map, watchId]);

    // ... (rest of the component) ...
    // В рендере у нас есть {heading !== null && ...}, поэтому дополнительной логики не нужно

    if (error) {
        return (
            <Popup position={map.getCenter()} closeButton={false}>
                <div style={{ textAlign: 'center' }}>
                    <strong>{error}</strong>
                    {permissionDenied ? (
                        <>
                            <p>Пожалуйста, разрешите доступ к геолокации в настройках браузера</p>
                            <button
                                onClick={requestLocationPermission}
                                style={{
                                    padding: '5px 10px',
                                    background: '#4CAF50',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Повторить попытку
                            </button>
                        </>
                    ) : (
                        <p>Проверьте, включена ли геолокация на вашем устройстве</p>
                    )}
                </div>
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