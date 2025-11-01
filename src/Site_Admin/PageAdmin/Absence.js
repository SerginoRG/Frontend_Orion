// src//Site_Admin/PageAdmin/Absence.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import DataTable from "react-data-table-component";
import Modal from "react-modal";
import "../../StyleCss/AbsenceAdmin.css";

Modal.setAppElement('#root'); // Pour l’accessibilité

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
      Swal.fire("Erreur", "Impossible de modifier le statut", "error");
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

  const columns = [
    { name: "ID", selector: row => row.id_absence, sortable: true, width: "70px" },
    { name: "Employé", selector: row => row.employe ? `${row.employe.nom_employe} ${row.employe.prenom_employe || ''}`.trim() : "Employé supprimé", sortable: true },
    { name: "Date Début", selector: row => formatDate(row.date_debut), sortable: true },
    { name: "Date Fin", selector: row => formatDate(row.date_fin), sortable: true },
    { name: "Motif", selector: row => row.motif_absence, sortable: true },
    { name: "Statut", cell: row => <span className={`badge ${getStatutBadge(row.statut_absence)}`}>{row.statut_absence}</span>, sortable: true },
    { name: "Action",
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
          <button className="btn-show" onClick={() => openModal(row)}>👁️</button>
        </>
      ),
      ignoreRowClick: true,
      width: "180px"
    }
  ];

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
          <p className="error-message">❌ Erreur: {error}</p>
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
