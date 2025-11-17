// src//Site_Admin/PageAdmin/Absence.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import DataTable from "react-data-table-component";
import Modal from "react-modal";
import "../../StyleCss/AbsenceAdmin.css";
import { FaEye, FaFilePdf } from "react-icons/fa";

Modal.setAppElement('#root'); // Pour l'accessibilité

function Absence() {
  const [absences, setAbsences] = useState([]);
  const [filteredAbsences, setFilteredAbsences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Modal
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedAbsence, setSelectedAbsence] = useState(null);

  useEffect(() => {
    fetchAbsences();
  }, []);

  const fetchAbsences = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://127.0.0.1:8000/api/admin/absences");
      if (Array.isArray(res.data)) {
        setAbsences(res.data);
        setFilteredAbsences(res.data);
      }
    } catch (err) {
      setError(err.message);
      Swal.fire("Erreur", err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => (date ? new Date(date).toLocaleDateString('fr-FR') : "N/A");

  const getStatutBadge = (statut) => {
    const classes = {
      'En attente': 'badge-warning',
      'Validée': 'badge-success',
      'Refusée': 'badge-danger'
    };
    return classes[statut] || 'badge-secondary';
  };

  const handleFilter = () => {
    if (!startDate || !endDate) return setFilteredAbsences(absences);
    const start = new Date(startDate);
    const end = new Date(endDate);
    setFilteredAbsences(absences.filter(a => new Date(a.date_debut) <= end && new Date(a.date_fin) >= start));
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.put(`http://127.0.0.1:8000/api/admin/absences/${id}/statut`, { statut_absence: newStatus });
      Swal.fire("Succès", "Le statut a été mis à jour", "success");
      fetchAbsences();
    } catch (err) {
      Swal.fire("Erreur", "Impossible de valider car votre congé a un limite", "error");
    }
  };

  const openModal = (absence) => {
    setSelectedAbsence(absence);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setSelectedAbsence(null);
    setModalIsOpen(false);
  };

  const generatePDF = (id_absence) => {
    window.open(`http://127.0.0.1:8000/api/admin/absence/${id_absence}/pdf`, "_blank");
  };

  const columns = [
    { name: "Employé", selector: row => row.employe ? `${row.employe.nom_employe} ${row.employe.prenom_employe || ''}`.trim() : "Employé supprimé", sortable: true },
    { name: "Date Début", selector: row => formatDate(row.date_debut), sortable: true },
    { name: "Date Fin", selector: row => formatDate(row.date_fin), sortable: true },
    { name: "Motif", selector: row => row.motif_absence, sortable: true },
    { name: "Statut", cell: row => <span className={`badge ${getStatutBadge(row.statut_absence)}`}>{row.statut_absence}</span>, sortable: true },
    {
      name: "Action",
      cell: row => (
        <>
          <select 
            value={row.statut_absence} 
            onChange={(e) => handleStatusChange(row.id_absence, e.target.value)}
          >
            <option value="En attente">En attente</option>
            <option value="Validée">Validée</option>
            <option value="Refusée">Refusée</option>
          </select>
          <button className="btn-show" onClick={() => openModal(row)}>
            <FaEye />
          </button>
          <button
            className="crud-btn-icon"
            onClick={() => generatePDF(row.id_absence)}
            title="Générer PDF"
             style={{
              color: "#dc2626",
              margin: "5px",
              backgroundColor: "rgba(220, 38, 38, 0.1)",
            }}
          >
            <FaFilePdf size={16} />
          </button>
        </>
      ),
      ignoreRowClick: true,
      width: "250px"
    }
  ];

  // --- NOUVELLE FONCTION DE CALCUL DES JOURS ---
  const calculateDays = (dateDebut, dateFin) => {
    if (!dateDebut || !dateFin) return "N/A";
    
    const start = new Date(dateDebut);
    const end = new Date(dateFin);

    // On s'assure que les dates sont valides
    if (isNaN(start) || isNaN(end)) return "N/A";

    // Calcul de la différence en millisecondes
    const diffTime = Math.abs(end.getTime() - start.getTime());

    // Conversion des millisecondes en jours (1000 ms/s * 60 s/min * 60 min/h * 24 h/j)
    // On ajoute 1 jour car une absence du 01/01 au 01/01 est 1 jour, pas 0.
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    return diffDays;
  };

  return (
    <div className="absence-admin-container">
      <h1>Gestion des Absences</h1>

      <div className="filter-container">
        <label>Date début:<input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} /></label>
        <label>Date fin:<input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} /></label>
        <button onClick={handleFilter}>Filtrer</button>
        <button onClick={() => { setStartDate(""); setEndDate(""); setFilteredAbsences(absences); }}>Réinitialiser</button>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Chargement des absences...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <p className="error-message"> Erreur: {error}</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredAbsences}
          pagination
          highlightOnHover
          responsive
          noDataComponent="📋 Aucune absence trouvée"
        />
      )}

      {/* Modal */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Détails de l'absence"
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        {selectedAbsence && (
          <div>
            <h2>Détails de l'absence</h2>
            <p><strong>Employé:</strong> {selectedAbsence.employe ? `${selectedAbsence.employe.nom_employe} ${selectedAbsence.employe.prenom_employe}` : 'Supprimé'}</p>
            <p><strong>Date Début:</strong> {formatDate(selectedAbsence.date_debut)}</p>
            <p><strong>Date Fin:</strong> {formatDate(selectedAbsence.date_fin)}</p>
            <p><strong>Nombre de jours:</strong> {calculateDays(selectedAbsence.date_debut, selectedAbsence.date_fin)}</p>
            <p><strong>Motif:</strong> {selectedAbsence.motif_absence}</p>
            <p><strong>Statut:</strong> {selectedAbsence.statut_absence}</p>
            <p><strong>Justificatif:</strong> {selectedAbsence.justificatif ? <a href={`http://127.0.0.1:8000/storage/${selectedAbsence.justificatif}`} target="_blank" rel="noopener noreferrer">📄 Voir</a> : 'Aucun'}</p>
            <p><strong>Message:</strong> {selectedAbsence.message || '-'}</p>
            <button onClick={closeModal}>Fermer</button>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default Absence;