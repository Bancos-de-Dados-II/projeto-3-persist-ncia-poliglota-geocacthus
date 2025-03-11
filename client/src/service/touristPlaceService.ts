import axios, { AxiosRequestConfig } from "axios";
import { LatLngTuple } from "leaflet";


interface ITouristPlaceResponse {
    _id: string;
    name: string;
    description: string;
    category: string;
    images: string[];
    phone: string;
    location: {
        crs: {
            type: string;
            properties: {
                name: string;
            };
        };
        type: string;
        coordinates: LatLngTuple;
    };
}

interface ITouristPlace {
    name: string;
    description: string;
    category: string;
    image: string;
    phone: string;
    address: {
        street?: string;
        number?: string;
        city: string;
        state: string;
        country: string;
        postalcode: string;
    };
}

interface ITouristUpdate {
    name: string;
    description: string;
    category: string;
    phone: string;
    address: {
        street: string;
        number: string;
        city: string;
        state: string;
        country: string;
        postalcode: string;
    };
}

interface ITouristLocationBase {
    id: string;
    name: string;
    description: string;
    category: string;
    images: string[];
    phone: string;
    position: LatLngTuple;
}

const API_URL = "http://localhost:3000/api";

const requestHandler = async <T>(
    method: "get" | "post" | "put" | "delete",
    endpoint: string,
    token?: string | null,
    data?: object | FormData
): Promise<T | null> => {
    try {
        const config: AxiosRequestConfig = {
            method,
            url: `${API_URL}${endpoint}`,
            headers: {
                Authorization: token ? `Bearer ${token}` : undefined,
                "Content-Type": data instanceof FormData ? "multipart/form-data" : "application/json",
            },
            data,
        };

        const response = await axios(config);
        return response.data;
    } catch (error) {
        console.error(`Erro na requisição (${method.toUpperCase()} ${endpoint}):`, (error as Error).message);
        return null;
    }
};


const fetchTouristLocations = async (): Promise<ITouristLocationBase[] | null> => {
    const data = await requestHandler<ITouristPlaceResponse[]>("get", "/tourist-place/");
    return data
        ? data.map(({ _id, name, description, category, images, phone, location }) => ({
              id: _id,
              name,
              description,
              category,
              images,
              phone,
              position: [location.coordinates[1], location.coordinates[0]] as LatLngTuple,
          }))
        : null;
};

const createTouristLocation = async (touristPlace: FormData, token: string) => {
    console.log(touristPlace);
    requestHandler("post", "/tourist-place", token, touristPlace);
}

const updateTouristLocation = async (touristID: string, touristPlace: ITouristUpdate, token: string) =>
    requestHandler("put", `/tourist-place/${touristID}`, token, touristPlace);

const deleteTouristLocation = async (id: string, token: string | null) =>
    requestHandler("delete", `/tourist-place/${id}`, token);

const fetchTouristLocationsByUser = async (token: string | null) =>
    requestHandler("get", "/users/tourist-places/my-places", token);


export default { fetchTouristLocations, fetchTouristLocationsByUser, createTouristLocation, deleteTouristLocation, updateTouristLocation };
export type { ITouristLocationBase, ITouristPlaceResponse, ITouristUpdate, ITouristPlace };