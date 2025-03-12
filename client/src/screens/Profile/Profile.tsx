import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import "./profile.css";

import touristServices, { IApiResponse, ITouristUpdate } from "../../service/touristPlaceService";
import Header from "../../components/Header/Header";
import { useFetchOnce } from "../../hooks/useFetchOnce";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";

function Profile() {
    const [locations, setLocations] = useState<IApiResponse[]>([]);
    const [editingLocation, setEditingLocation] = useState<IApiResponse | null>(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [locationToDelete, setLocationToDelete] = useState<string | null>(null);
    const token = localStorage.getItem("authToken");

    const fetchLocations = async () => {
        try {
            console.log(token);
            const response = await touristServices.fetchTouristLocationsByUser(token);
            console.log(response);
            if (response) setLocations(response);
        } catch (error) {
            console.error("Erro ao buscar locais turísticos:", error);
        }
    };

    const handleEdit = (location: IApiResponse) => {
        console.log(location);
        setEditingLocation(location);
    };

    const handleSave = async () => {
        if (!token) {
            console.error("Token de autenticação não encontrado");
            return;
        }

        if (editingLocation) {
            // Criar objeto separado para atualização
            const updatedLocation: ITouristUpdate = {
                name: editingLocation.name,
                description: editingLocation.description,
                category: editingLocation.category,
                phone: editingLocation.phone,
                address: {
                    street: "", // Adicione o valor apropriado
                    number: "", // Adicione o valor apropriado
                    city: "", // Adicione o valor apropriado
                    state: "", // Adicione o valor apropriado
                    country: "", // Adicione o valor apropriado
                    postalcode: "" // Adicione o valor apropriado
                }
            };

            try {
                console.log(editingLocation._id, updatedLocation, token);
                await touristServices.updateTouristLocation(editingLocation._id, updatedLocation, token);
                setLocations(prev =>
                    prev.map(location => (location._id === editingLocation._id ? { ...location, ...updatedLocation } : location))
                );
                setEditingLocation(null);
            } catch (error) {
                console.error("Erro ao salvar local turístico:", error);
            }
        }
    };

    const handleDelete = (id: string) => {
        setLocationToDelete(id);
        setShowConfirmModal(true);
    };

    const confirmDelete = async () => {
        if (locationToDelete) {
            try {
                await touristServices.deleteTouristLocation(locationToDelete, token);
                setLocations(locations.filter(location => location._id !== locationToDelete));
            } catch (error) {
                console.error("Erro ao excluir local turístico:", error);
            }
        }
        setShowConfirmModal(false);
        setLocationToDelete(null);
    };


    const handleCloseModal = () => {
        setEditingLocation(null);
    };

    useFetchOnce(fetchLocations);

    return (
        <div className="container-profile">
            <Header />
            <div id="main-profile" className="content-main">
                <div className="title-section">
                    <h3>My Tourist Locations</h3>
                </div>
                <div className="container-locations">
                    {locations.length > 0 ? (
                        <div className="section-locations">
                            {locations.map(location => (
                                <div className="content-card" key={location._id}>
                                    <h4 className="title-card">{location.name}</h4>
                                    <h6 className="coordinates">
                                        {location.location.coordinates[1]}, {location.location.coordinates[0]}
                                    </h6>
                                    <p className="description">{location.description}</p>
                                    <div className="card-actions">
                                        <FontAwesomeIcon
                                            icon={faEdit}
                                            className="icon edit-icon"
                                            title="Edit"
                                            onClick={() => handleEdit(location)}
                                        />
                                        <FontAwesomeIcon
                                            icon={faTrash}
                                            className="icon delete-icon"
                                            title="Delete"
                                            onClick={() => handleDelete(location._id)}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="no-locations">Nenhum local turístico encontrado.</p>
                    )}
                </div>
            </div>

            <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmar Exclusão</DialogTitle>
                    </DialogHeader>
                    <p>Tem certeza de que deseja excluir este local turístico?</p>
                    <DialogFooter>
                        <Button variant="destructive" onClick={confirmDelete}>Excluir</Button>
                        <Button variant="outline" onClick={() => setShowConfirmModal(false)}>Cancelar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {editingLocation && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <form
                        className="form-modal"
                        onSubmit={event => event.preventDefault()}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="data-event">
                            <h2>Editar Local Turístico</h2>
                        </div>

                        <div className="element-modal">
                            <label htmlFor="name">Nome</label>
                            <input
                                id="name-input"
                                type="text"
                                name="name"
                                value={editingLocation.name || ""}
                                onChange={event =>
                                    setEditingLocation(prev =>
                                        prev ? { ...prev, name: event.target.value } : null
                                    )
                                }
                                placeholder="Nome"
                                required
                            />
                        </div>
                        <div className="element-modal">
                            <label htmlFor="description">Descrição</label>
                            <textarea
                                id="description-input"
                                name="description"
                                value={editingLocation.description || ""}
                                onChange={event =>
                                    setEditingLocation(prev =>
                                        prev ? { ...prev, description: event.target.value } : null
                                    )
                                }
                                rows={5}
                                placeholder="Descrição"
                                required
                            />
                        </div>
                        <div className="element-submit-modal">
                            <input type="button" value="Salvar" onClick={handleSave} />
                            <input type="button" value="Fechar" onClick={handleCloseModal} />
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

export default Profile;
