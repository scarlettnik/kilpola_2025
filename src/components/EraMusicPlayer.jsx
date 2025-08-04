import {useEffect, useRef, useState} from "react";
import {ERA_MUSIC} from "../constants.jsx";

const EraMusicPlayer = ({ activeEra, musicPaused, onMusicPause }) => {
    const audioRef = useRef(null);
    const [userInteracted, setUserInteracted] = useState(false);

    useEffect(() => {
        const handleFirstInteraction = () => {
            setUserInteracted(true);
            document.removeEventListener('click', handleFirstInteraction);
        };

        document.addEventListener('click', handleFirstInteraction);
        return () => document.removeEventListener('click', handleFirstInteraction);
    }, []);

    useEffect(() => {
        if (!activeEra) {
            audioRef.current?.pause();
            return;
        }

        if (musicPaused) return;

        const playMusic = async () => {
            try {
                // Если музыка уже играет - ничего не делаем
                if (audioRef.current &&
                    audioRef.current.src.endsWith(ERA_MUSIC[activeEra]) &&
                    !audioRef.current.paused) {
                    return;
                }

                if (audioRef.current) {
                    audioRef.current.pause();
                    audioRef.current.currentTime = 0;
                }

                const audio = new Audio(ERA_MUSIC[activeEra]);
                audio.loop = true;
                audioRef.current = audio;

                if (userInteracted) {
                    await audio.play();
                }
            } catch (err) {
                console.error("Ошибка воспроизведения музыки:", err);
            }
        };

        playMusic();

        return () => {
            audioRef.current?.pause();
        };
    }, [activeEra, musicPaused, userInteracted]);

    useEffect(() => {
        if (musicPaused) {
            audioRef.current?.pause();
        } else if (activeEra && userInteracted) {
            audioRef.current?.play().catch(console.error);
        }
    }, [musicPaused, activeEra, userInteracted]);

    return null;
};

export default EraMusicPlayer;