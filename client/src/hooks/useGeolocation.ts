import { useState, useEffect } from "react";

type Location = {
    latitude: number;
    longitude: number;
} | null;

const useGeolocation = () => {
    const [location, setLocation] = useState<Location>(null);
    const [error, setError] = useState<string | null>(null);

    const getLocation = () => {
        if (!navigator.geolocation) {
            setError("Geolocalização não é suportada pelo seu navegador.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
                setError(null);
            },
            (err) => {
                setError(`Erro ao obter localização: ${err.message}`);
                setLocation(null);
            }
        );
    };

    useEffect(() => {
        getLocation();
    }, []);

    return { location, error, getLocation };
};

export default useGeolocation;
