import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import DataTable from "react-data-table-component";
import axios from "axios";
import "../../StyleCss/Crud.css";
import { FaTrash, FaSearch, FaPlus } from "react-icons/fa";

export default function Conge() {
  const [annee, setAnnee] = useState(new Date().getFullYear());
  const [idEmploye, setIdEmploye] = useState("");
  const [soldeList, setSoldeList] = useState([]);
  const [employes, setEmployes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchSolde();
    fetchEmployes();
  }, []);

  // Récupérer tous les soldes
  const fetchSolde = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/solde-conge");
      setSoldeList(res.data);
    } catch (error) {
      console.error("Erreur chargement solde :", error);
    }
  };

  // Récupérer tous les employés
  const fetchEmployes = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/employes");
      setEmployes(res.data);
    } catch (error) {
      console.error("Erreur chargement employés :", error);
    }
  };

  // Ouvrir le modal pour ajouter un solde
  const handleAdd = () => {
    setAnnee(new Date().getFullYear());
    setIdEmploye("");
    setModalOpen(true);
  };

  // Supprimer un solde
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
          await axios.delete(`http://127.0.0.1:8000/api/solde-conge/${id}`);
          Swal.fire("Supprimé !", "Solde supprimé avec succès.", "success");
          fetchSolde();
        } catch (err) {
          Swal.fire("Erreur", "Impossible de supprimer le solde", "error");
        }
      }
    });
  };

  // Ajouter un solde
  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      annee,
      id_employe: idEmploye,
    };

    try {
      await axios.post("http://127.0.0.1:8000/api/solde-conge/create", payload);
      Swal.fire("Ajouté !", "Solde ajouté avec succès.", "success");
      setModalOpen(false);
      fetchSolde();
    } catch (error) {
      if (error.response && error.response.status === 409) {
        Swal.fire("Erreur", "Solde déjà créé pour cette année.", "error");
      } else {
        Swal.fire("Erreur", "Vérifiez les données saisies.", "error");
      }
    }
  };

  
 // Filtrer les soldes par ID employé en vérifiant que id_employe existe
const filteredSolde = soldeList.filter((s) =>
  s.employe_id ? s.employe_id.toString().includes(searchTerm) : false
);


  // Colonnes du tableau
  const columns = [
     {
      name: "Employé lié",
      selector: (row) =>
        row.employe
          ? `${row.employe.nom_employe} ${row.employe.prenom_employe}`
          : "—",
    },
    { name: "Année", selector: (row) => row.annee },
    { name: "Jours Acquis", selector: (row) => row.jours_acquis },
    { name: "Jours Consommés", selector: (row) => row.jours_consommes },
    { name: "Jours Restants", selector: (row) => row.jours_restants },
    {
      name: "Actions",
      cell: (row) => (
        <div className="crud-actions-buttons">
          <button className="crud-btn-icon delete" onClick={() => handleDelete(row.id_solde)}>
            <FaTrash />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="crud-container">
      <h2 className="crud-table-title">Gestion des Soldes de Congés</h2>

      <div className="crud-header">
        <button className="crud-add-btn" onClick={handleAdd}>
          <FaPlus /> Ajouter un solde
        </button>
        <div className="crud-search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Rechercher par ID employé..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredSolde}
        pagination
        highlightOnHover
        striped
        noDataComponent="Aucun solde trouvé."
      />

      {modalOpen && (
        <div className="crud-modal-overlay">
          <div className="crud-modal-content">
            <span className="crud-close-btn" onClick={() => setModalOpen(false)}>
              &times;
            </span>
            <h2>Ajouter un solde</h2>

            <form onSubmit={handleSubmit} className="crud-form">
              <div className="crud-form-group">
                <label>Employé</label>
                <select value={idEmploye} onChange={(e) => setIdEmploye(e.target.value)} required>
                  <option value="">-- Sélectionner un employé --</option>
                  {employes.map((emp) => (
                    <option key={emp.id_employe} value={emp.id_employe}>
                      {emp.nom_employe} {emp.prenom_employe}
                    </option>
                  ))}
                </select>
              </div>

              <div className="crud-form-group">
                <label>Année</label>
                <input
                  type="number"
                  value={annee}
                  onChange={(e) => setAnnee(e.target.value)}
                  required
                />
              </div>

              <div className="crud-form-actions">
                <button type="button" onClick={() => setModalOpen(false)} className="crud-cancel-btn">
                  Annuler
                </button>
                <button type="submit" className="crud-submit-btn">Ajouter</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
