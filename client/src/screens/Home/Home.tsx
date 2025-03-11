import { useState } from "react"
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet"
import "./home.css"

import touristServices, { ITouristLocationBase } from "../../service/touristPlaceService"
import Header from "../../components/Header/Header";
import { useFetchOnce } from "../../hooks/useFetchOnce";
import ReviewList from "../../components/Review/ReviewList";
import LocationInfoBox from "../../components/LocalInfoBox/LocalInfoBox";
import useGeolocation from "../../hooks/useGeolocation";


function RecenterMap({ location }: { location: { latitude: number; longitude: number } | null }) {
    const map = useMap();
    if (location) {
        map.setView([location.latitude, location.longitude], 13);
    }
    return null;
}


function Home() {
    const [touristLocations, setTouristLocations] = useState<ITouristLocationBase[]>([]);
    const [selectedLocation, setSelectedLocation] = useState<ITouristLocationBase | null>(null);
    const { location, error } = useGeolocation();

    useFetchOnce(async () => {
        try {
            const locations = await touristServices.fetchTouristLocations();
            if (locations) setTouristLocations(locations);
        } catch (error) {
            console.log("Erro ao buscar locais turisticos" + (error as Error).message);
        }
    })

    return (
        <div className="home-container">
            <Header />
            <div className="content-main">
                <LocationInfoBox selectedLocation={selectedLocation} />

                <div className="box-map">
                    {error && <p className="text-red-500">{error}</p>}

                    <MapContainer
                        center={location ? [location.latitude, location.longitude] : [-7.135, -34.876]}
                        zoom={13}
                        style={{ height: "100%", width: "100%" }}
                    >

                        <RecenterMap location={location} />
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        {touristLocations.map((location) => (
                            <Marker
                                key={location.id}
                                position={location.position}
                                eventHandlers={{
                                    click: () => {
                                        setSelectedLocation(location);
                                    }
                                }}
                            >
                                <Popup>
                                    <strong>{location.name}</strong>
                                    <br />
                                    {location.description}
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>
            </div>
        </div>
    )
}

export default Home