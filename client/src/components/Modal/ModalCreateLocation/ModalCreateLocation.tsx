import "../CreateTouristPlace.css";
import React, { useCallback, useEffect, useReducer, useState } from "react";
import { useNavigate } from "react-router-dom";
import locationService, { Country, State } from "../../../service/locationService";
import touristServices from "../../../service/touristPlaceService";
import FormField from "../../FormField/FormField";
import FormSelect from "../../FormSelect/FormSelect";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "../../ui/dialog";
import { Button } from "../../ui/button";
import { PhotoIcon } from "@heroicons/react/24/solid";
import ModalUploadImage from "../ModalUploadImage/ModalUploadImage";
import { ToastContainer, toast } from "react-toastify";


interface Address {
    street: string;
    number: string;
    city: string;
    state: string;
    country: string;
    postalcode: string;
}

interface FormData {
    name: string;
    description: string;
    category: string;
    phone: string;
    address: Address;
    files: File[];
}

interface ModalCreateLocationProps {
    isOpen: boolean;
    onClose: () => void;
}

const initialState: FormData = {
    name: "",
    description: "",
    category: "",
    phone: "",
    address: {
        street: "",
        number: "",
        city: "",
        state: "",
        country: "",
        postalcode: "",
    },
    files: [],
};

const formReducer = (state: FormData, action: { type: string; payload: any }) => {
    switch (action.type) {
        case "SET_FIELD":
            return { ...state, [action.payload.field]: action.payload.value };
        case "SET_ADDRESS_FIELD":
            return {
                ...state,
                address: { ...state.address, [action.payload.field]: action.payload.value },
            };
        case "SET_FILES":
            return { ...state, files: action.payload };
        case "RESET":
            return initialState;
        default:
            return state;
    }
};

const ModalCreateLocation: React.FC<ModalCreateLocationProps> = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const [formData, dispatch] = useReducer(formReducer, initialState);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [countries, setCountries] = useState<Country[]>([]);
    const [states, setStates] = useState<State[]>([]);
    const [cities, setCities] = useState<string[]>([]);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadedImages, setUploadedImages] = useState<File[]>([]);
    const [previewImages, setPreviewImages] = useState<string[]>([]);

    useEffect(() => {
        locationService.getCountries()
            .then(data => setCountries(data.sort((a: any, b: any) => a.name.localeCompare(b.name))))
            .catch(error => {
                toast.error("Erro ao carregar países: " + error.message, {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    theme: "dark",
                });
            });
    }, []);

    const handleCountryChange = useCallback(async (event: string) => {
        dispatch({ type: "SET_ADDRESS_FIELD", payload: { field: "country", value: event } });
        if (event === "Brazil") {
            locationService.getStates()
                .then(setStates)
                .catch(error => setError("Erro ao carregar estados: " + error.message));
        } else {
            setStates([]);
            setCities([]);
        }
    }, []);

    const handleStateChange = useCallback(async (event: string) => {
        dispatch({ type: "SET_ADDRESS_FIELD", payload: { field: "state", value: event } });
        locationService.getCities(event)
            .then(setCities)
            .catch(error => setError("Erro ao carregar cidades: " + error.message));
    }, []);

    const handleSave = async () => {
        if (!formData.name || !formData.description || !formData.category || !formData.phone ||
            !formData.address.country || !formData.address.state || !formData.address.city || !formData.address.postalcode) {

            toast.error("Por favor, preencha todos os campos obrigatórios.", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "dark",
            });

            return;
        }

        const token = localStorage.getItem("authToken");
        if (!token) {

            toast.error("Token inválido ou expirado.", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "dark",
            });

            return;
        }

        setLoading(true);

        const formDataToSend = new FormData();
        formDataToSend.append("name", formData.name);
        formDataToSend.append("description", formData.description);
        formDataToSend.append("category", formData.category);
        formDataToSend.append("phone", formData.phone);
        formDataToSend.append("address[street]", formData.address.street);
        formDataToSend.append("address[number]", formData.address.number);
        formDataToSend.append("address[city]", formData.address.city);
        formDataToSend.append("address[state]", formData.address.state);
        formDataToSend.append("address[country]", formData.address.country);
        formDataToSend.append("address[postalcode]", formData.address.postalcode);

        formData.files.forEach((file) => {
            formDataToSend.append("files", file);
        });

        console.log(formData);
        for (const [key, value] of formDataToSend.entries()) {
            console.log(key, value);
        }


        try {
            await touristServices.createTouristLocation(formDataToSend, token);
            toast.success("Local turístico cadastrado com sucesso!", {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "colored",
            });

            setTimeout(() => {
                navigate("/home", { state: { refresh: true } });
                onClose();
            }, 2000);
        } catch (error) {
            toast.error(`Erro ao salvar o local turístico: ${(error as Error).message}`, {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: "dark",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = (images: File[]) => {
        dispatch({ type: "SET_FILES", payload: images });
        setShowUploadModal(false);
    };


    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className={`sm:w-[30%] sm:max-w-[60%] md:max-h-[95%] ${uploadedImages.length > 0 ? 'sm:w-[60%]' : ''}`}>
                <DialogHeader>
                    <DialogTitle>Create Tourist Location</DialogTitle>
                    <DialogDescription>
                        Adicione detalhes sobre o novo local turístico. Clique em salvar quando terminar.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex gap-6 w-full">
                    <div className="flex flex-col gap-6 `w-${uploadedImages.length > 0 ? '2/3' : '3'}">
                        <FormField
                            id="name-input"
                            label="Nome"
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={(e) => dispatch({ type: "SET_FIELD", payload: { field: "name", value: e.target.value } })}
                            placeholder="Nome"
                            required
                        />

                        <FormField
                            id="description-input"
                            label="Descrição"
                            type="text"
                            name="description"
                            value={formData.description}
                            onChange={(e) => dispatch({ type: "SET_FIELD", payload: { field: "description", value: e.target.value } })}
                            placeholder="Descrição"
                            required
                        />

                        <FormField
                            id="category-input"
                            label="Categoria"
                            type="text"
                            name="category"
                            value={formData.category}
                            onChange={(e) => dispatch({ type: "SET_FIELD", payload: { field: "category", value: e.target.value } })}
                            placeholder="Categoria"
                            required
                        />

                        <FormField
                            id="phone-input"
                            label="Telefone"
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={(e) => dispatch({ type: "SET_FIELD", payload: { field: "phone", value: e.target.value } })}
                            placeholder="Telefone"
                            required
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
                            <FormSelect
                                id="country-select"
                                label="País"
                                name="address.country"
                                value={formData.address.country}
                                placeholder="Selecione um país"
                                options={countries.map((c) => ({ value: c.name, label: c.name }))}
                                onChange={handleCountryChange}
                                required
                            />

                            {states.length > 0 && (
                                <FormSelect
                                    id="state-select"
                                    label="Estado"
                                    name="address.state"
                                    value={formData.address.state}
                                    placeholder="Selecione um estado"
                                    options={states.map((s) => ({ value: s.code, label: s.name }))}
                                    onChange={handleStateChange}
                                    required
                                />
                            )}

                            {cities.length > 0 && (
                                <FormSelect
                                    id="city-select"
                                    label="Cidade"
                                    name="address.city"
                                    value={formData.address.city}
                                    placeholder="Selecione uma cidade"
                                    options={cities.map((c) => ({ value: c, label: c }))}
                                    onChange={(e) => dispatch({ type: "SET_ADDRESS_FIELD", payload: { field: "city", value: e } })}
                                    required
                                />
                            )}

                            <FormField
                                id="cep-input"
                                label="CEP"
                                type="text"
                                name="cep"
                                value={formData.address.postalcode}
                                onChange={(e) => dispatch({ type: "SET_ADDRESS_FIELD", payload: { field: "postalcode", value: e.target.value } })}
                                placeholder="00000-000"
                                required
                            />
                        </div>
                    </div>

                    {uploadedImages.length > 0 && (
                        <div className="flex flex-wrap gap-3 overflow-y-auto max-h-72 p-2 rounded-lg">
                            {previewImages.map((image, index) => (
                                <img
                                    key={index}
                                    src={image}
                                    alt={`Preview ${index + 1}`}
                                    className="h-24 w-auto max-w-full object-cover shadow rounded-md"
                                />
                            ))}
                        </div>
                    )}

                </div>
                <DialogFooter className="flex justify-between w-full">
                    <Button
                        type="button"
                        className="ml-auto flex items-center space-x-2"
                        onClick={() => setShowUploadModal(true)}
                    >
                        <PhotoIcon className="h-5 w-5" />
                        <span>Upload Imagens</span>
                    </Button>
                    <Button onClick={handleSave} disabled={loading} type="submit" className="ml-auto">Save</Button>
                </DialogFooter>
            </DialogContent>

            <ModalUploadImage
                isOpen={showUploadModal}
                onClose={() => setShowUploadModal(false)}
                onUpload={handleImageUpload}
            />
        </Dialog>
    );
};

export default ModalCreateLocation;
