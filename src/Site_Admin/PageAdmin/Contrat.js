import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import DataTable from "react-data-table-component";
import axios from "axios";
import "../../StyleCss/Crud.css";
import { FaEdit, FaTrash, FaSearch, FaPlus } from "react-icons/fa";

export default function Contrat() {
  const [typeContrat, setTypeContrat] = useState("");
  const [dateDebutContrat, setDateDebutContrat] = useState("");
  const [dateFinContrat, setDateFinContrat] = useState("");
  const [statutContrat, setStatutContrat] = useState("En cours");
  const [employeId, setEmployeId] = useState("");

  const [contrats, setContrats] = useState([]);
  const [employes, setEmployes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Charger la liste des employés pour le select
  useEffect(() => {
    const fetchEmployes = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/api/employes");
        setEmployes(res.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchEmployes();
  }, []);

  // Charger les contrats
  useEffect(() => {
    const fetchContrats = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/api/contrats");
        setContrats(res.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchContrats();
  }, []);
const formatDate = (date) => (date ? new Date(date).toLocaleDateString('fr-FR') : "N/A");
  const columns = [
    { name: "Employé", selector: (row) => row.employe.nom_employe + " " + row.employe.prenom_employe, sortable: true },
    { name: "Type", selector: (row) => row.type_contrat },
    { name: "Date Début", selector: (row) => formatDate(row.date_debut_contrat) },
    { name: "Date Fin", selector: (row) => formatDate(row.date_fin_contrat) },
    { name: "Statut", selector: (row) => row.statut_contrat },
    {
      name: "Actions",
      cell: (row) => (
        <div className="crud-actions-buttons">
          <button className="crud-btn-icon edit" onClick={() => handleEdit(row)}>
            <FaEdit />
          </button>
          <button className="crud-btn-icon delete" onClick={() => handleDelete(row.id_contrat)}>
            <FaTrash />
          </button>
        </div>
      ),
    },
  ];

  const filteredContrats = contrats.filter(
    (c) =>
      c.employe.nom_employe.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.employe.prenom_employe.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    setEditingId(null);
    setTypeContrat("");
    setDateDebutContrat("");
    setDateFinContrat("");
    setStatutContrat("En cours");
    setEmployeId("");
    setModalOpen(true);
  };

  const handleEdit = (row) => {
    setEditingId(row.id_contrat);
    setTypeContrat(row.type_contrat);
    setDateDebutContrat(row.date_debut_contrat);
    setDateFinContrat(row.date_fin_contrat || "");
    setStatutContrat(row.statut_contrat);
    setEmployeId(row.employe_id);
    setModalOpen(true);
  };

  const handleDelete = (id) => {
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
          await axios.delete(`http://127.0.0.1:8000/api/contrats/${id}`);
          setContrats(contrats.filter((c) => c.id_contrat !== id));
          Swal.fire("Supprimé !", "Contrat supprimé.", "success");
        } catch (error) {
          Swal.fire("Erreur", "Impossible de supprimer le contrat", "error");
        }
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      type_contrat: typeContrat,
      date_debut_contrat: dateDebutContrat,
      date_fin_contrat: dateFinContrat,
      statut_contrat: statutContrat,
      employe_id: employeId,
    };

    try {
      if (editingId) {
        await axios.put(`http://127.0.0.1:8000/api/contrats/${editingId}`, data);
        setContrats(
          contrats.map((c) => (c.id_contrat === editingId ? { ...c, ...data, employe: employes.find(e => e.id_employe == employeId) } : c))
        );
        Swal.fire("Modifié !", "Contrat mis à jour.", "success");
      } else {
        const res = await axios.post("http://127.0.0.1:8000/api/contrats", data);
        setContrats([...contrats, res.data]);
        Swal.fire("Ajouté !", "Contrat ajouté.", "success");
      }
      setModalOpen(false);
    } catch (error) {
      Swal.fire("Erreur", "Vérifiez les champs du formulaire", "error");
      console.error(error);
    }
  };

  return (
    <div className="crud-container">
      <h2 className="crud-table-title">Gestion des Contrats</h2>
      <div className="crud-header">
        <button className="crud-add-btn" onClick={handleAdd}>
          <FaPlus /> Ajouter un contrat
        </button>
        <div className="crud-search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Rechercher un employé..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <DataTable columns={columns} data={filteredContrats} pagination highlightOnHover striped noDataComponent="Aucun contrat trouvé." />

      {modalOpen && (
        <div className="crud-modal-overlay">
          <div className="crud-modal-content">
            <span className="crud-close-btn" onClick={() => setModalOpen(false)}>&times;</span>
            <h2>{editingId ? "Modifier un contrat" : "Ajouter un contrat"}</h2>

            <form onSubmit={handleSubmit} className="crud-form">
              <div className="crud-form-group">
                <label>Type de contrat</label>
                <input type="text" value={typeContrat} onChange={(e) => setTypeContrat(e.target.value)} required />
              </div>

              <div className="crud-form-group">
                <label>Date de début</label>
                <input type="date" value={dateDebutContrat} onChange={(e) => setDateDebutContrat(e.target.value)} required />
              </div>

              <div className="crud-form-group">
                <label>Date de fin</label>
                <input type="date" value={dateFinContrat} onChange={(e) => setDateFinContrat(e.target.value)} />
              </div>

              <div className="crud-form-group">
                <label>Statut</label>
                <select value={statutContrat} onChange={(e) => setStatutContrat(e.target.value)} required>
                  <option value="En cours">En cours</option>
                  <option value="Terminé">Terminé</option>
                  <option value="Renouvelé">Renouvelé</option>
                </select>
              </div>

              <div className="crud-form-group">
                <label>Employé</label>
                <select value={employeId} onChange={(e) => setEmployeId(e.target.value)} required>
                  <option value="">-- Sélectionnez un employé --</option>
                  {employes.map((emp) => (
                    <option key={emp.id_employe} value={emp.id_employe}>
                      {emp.nom_employe} {emp.prenom_employe}
                    </option>
                  ))}
                </select>
              </div>

              <div className="crud-form-actions">
                <button type="button" className="crud-cancel-btn" onClick={() => setModalOpen(false)}>Annuler</button>
                <button type="submit" className="crud-submit-btn">{editingId ? "Modifier" : "Ajouter"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
