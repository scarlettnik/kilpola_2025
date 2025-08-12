import React, { useState, useEffect } from 'react';
import { useMapEvents } from 'react-leaflet';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Иконка для текущей позиции
const positionIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    shadowSize: [41, 41]
});

const directionIcon = L.divIcon({
    html: `<div style="
    width: 0; 
    height: 0; 
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-bottom: 16px solid #3388ff;
    transform: rotate(0deg);
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
    const [compassWatchId, setCompassWatchId] = useState(null);

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
                    const { latitude, longitude } = pos.coords;
                    updatePosition(L.latLng(latitude, longitude));

                    // Если доступно направление
                    if (pos.coords.heading) {
                        setHeading(pos.coords.heading);
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

        if ('ondeviceorientationabsolute' in window) {
            const compassId = window.addEventListener('deviceorientationabsolute', handleCompass);
            setCompassWatchId(compassId);
        } else if ('ondeviceorientation' in window) {
            const compassId = window.addEventListener('deviceorientation', handleCompass);
            setCompassWatchId(compassId);
        }

        return () => {
            if (watchId) navigator.geolocation.clearWatch(watchId);
            if (compassWatchId) {
                window.removeEventListener('deviceorientation', handleCompass);
                window.removeEventListener('deviceorientationabsolute', handleCompass);
            }
        };
    }, [map]);

    const handleCompass = (event) => {
        if (event.alpha !== null) {
            setHeading(event.alpha);
        }
    };

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
                    icon={directionIcon}
                    rotationAngle={heading}
                    rotationOrigin="center"
                >
                    <Popup>Направление: {Math.round(heading)}°</Popup>
                </Marker>
            )}
        </>
    ) : null;
};
// КНОПКА ЧТОБЫ ВОЗВРАЩАТ К СВОЕМУ МЕСТОПОЛОЖЕНИЮ
// export const LocateControl = () => {
//     const map = useMap();
//     const [isLocating, setIsLocating] = useState(false);
//
//     const handleClick = useCallback(() => {
//         setIsLocating(true);
//         map.locate({
//             setView: true,
//             enableHighAccuracy: true,
//             timeout: 10000
//         }).on('locationerror', () => {
//             setIsLocating(false);
//             map.openPopup(
//                 "Не удалось определить местоположение",
//                 map.getCenter()
//             );
//         }).on('locationfound', () => {
//             setIsLocating(false);
//         });
//     }, [map]);
//
//     return (
//         <div className="leaflet-bar leaflet-control">
//             <a
//                 className="leaflet-control-locate"
//                 onClick={handleClick}
//                 title="Показать мое местоположение"
//                 style={{
//                     width: '30px',
//                     height: '30px',
//                     lineHeight: '30px',
//                     display: 'block',
//                     textAlign: 'center',
//                     textDecoration: 'none',
//                     color: '#333',
//                     backgroundColor: isLocating ? '#e6e6e6' : '#fff',
//                     cursor: 'pointer'
//                 }}
//             >
//                 <span style={{ fontSize: '20px' }}>
//                     {isLocating ? '⏳' : '📍'}
//                 </span>
//             </a>
//         </div>
//     );
// };