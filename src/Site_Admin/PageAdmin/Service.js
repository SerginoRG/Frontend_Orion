import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import DataTable from "react-data-table-component";
import axios from "axios";
import "../../StyleCss/Crud.css";
import { FaEdit, FaTrash, FaSearch, FaPlus } from "react-icons/fa";

export default function Service() {
  const [nomService, setNomService] = useState("");
  const [descriptionService, setDescriptionService] = useState("");
  const [services, setServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Charger la liste des services
  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/services");
      setServices(res.data);
    } catch (error) {
      console.error("Erreur de chargement :", error);
    }
  };

  const handleAdd = () => {
    setEditingId(null);
    setNomService("");
    setDescriptionService("");
    setModalOpen(true);
  };

  const handleEdit = (row) => {
    setEditingId(row.id_service);
    setNomService(row.nom_service);
    setDescriptionService(row.description_service);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Êtes-vous sûr ?",
      text: "Cette action est irréversible !",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://127.0.0.1:8000/api/services/${id}`);
          Swal.fire("Supprimé !", "Service supprimé avec succès.", "success");
          fetchServices();
        } catch (err) {
          Swal.fire("Erreur", "Impossible de supprimer le service", "error");
        }
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      nom_service: nomService,
      description_service: descriptionService,
    };

    try {
      if (editingId) {
        await axios.put(`http://127.0.0.1:8000/api/services/${editingId}`, payload);
        Swal.fire("Modifié !", "Service mis à jour avec succès.", "success");
      } else {
        await axios.post("http://127.0.0.1:8000/api/services", payload);
        Swal.fire("Ajouté !", "Service ajouté avec succès.", "success");
      }
      setModalOpen(false);
      fetchServices();
    } catch (error) {
      Swal.fire("Erreur", "Vérifiez les données saisies.", "error");
    }
  };

  const filteredService = services.filter((srv) =>
    srv.nom_service.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { name: "Nom", selector: (row) => row.nom_service },
    { name: "Description", selector: (row) => row.description_service },
    {
      name: "Actions",
      cell: (row) => (
        <div className="crud-actions-buttons">
          <button className="crud-btn-icon edit" onClick={() => handleEdit(row)}>
            <FaEdit />
          </button>
          <button
            className="crud-btn-icon delete"
            onClick={() => handleDelete(row.id_service)}
          >
            <FaTrash />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="crud-container">
      <h2 className="crud-table-title">Gestion des Services</h2>

      <div className="crud-header">
        <button className="crud-add-btn" onClick={handleAdd}>
         <FaPlus /> Ajouter un service
        </button>
        <div className="crud-search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Rechercher un service..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredService}
        pagination
        highlightOnHover
        striped
        noDataComponent="Aucun service trouvé."
      />

      {modalOpen && (
        <div className="crud-modal-overlay">
          <div className="crud-modal-content">
            <span className="crud-close-btn" onClick={() => setModalOpen(false)}>
              &times;
            </span>
            <h2>{editingId ? "Modifier un service" : "Ajouter un service"}</h2>

            <form onSubmit={handleSubmit} className="crud-form">
              <div className="crud-form-group">
                <label>Nom</label>
                <input
                  type="text"
                  placeholder="Ex: INFORMATIQUE"
                  value={nomService}
                  onChange={(e) => setNomService(e.target.value)}
                  required
                />
              </div>

                <div className="crud-form-group">
                  <label>Description</label>
                  <textarea
                    value={descriptionService}
                     placeholder="Entrez le contenu de la description..."
                    onChange={(e) => {
                      const words = e.target.value.trim().split(/\s+/); // découpe en mots
                      if (words.length <= 10) {
                        setDescriptionService(e.target.value);
                      } else {
                        Swal.fire(
                          "Limite atteinte",
                          "La description ne peut pas dépasser 10 mots.",
                          "warning"
                        );
                      }
                    }}
                    required
                  />
                  <small style={{ color: "gray" }}>
                    {descriptionService.trim().split(/\s+/).filter(Boolean).length}/10 mots
                  </small>
                </div>


              <div className="crud-form-actions">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="crud-cancel-btn"
                >
                  Annuler
                </button>
                <button type="submit" className="crud-submit-btn">
                  {editingId ? "Modifier" : "Ajouter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
