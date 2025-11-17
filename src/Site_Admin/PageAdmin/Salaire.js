import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import DataTable from "react-data-table-component";
import { FaSearch, FaTrash, FaEye } from "react-icons/fa";
import "../../StyleCss/Crud.css";

function Salaire() {
  const [salaires, setSalaires] = useState([]);
  const [employes, setEmployes] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSalaire, setSelectedSalaire] = useState(null);
  const [formData, setFormData] = useState({
    mois_salaire: "",
    annee_salaire: "",
    employe_id: "",
    salaire_base: "",
    primes_salaire: 0,
    retenues_salaire: 0,
    cnaps: 0,
    medical: 0,
    irsa: 0,
    salaire_net: 0,
    calcul_auto_retenues: false,
  });
  const [retenuesInfo, setRetenuesInfo] = useState("");

  useEffect(() => {
    fetchSalaires();
    fetchEmployes();
  }, []);

  const fetchSalaires = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/salaires");
      setSalaires(res.data);
    } catch (error) {
      console.error("Erreur de chargement des salaires :", error);
    }
  };

  const fetchEmployes = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/employes");
      setEmployes(res.data);
    } catch (error) {
      console.error("Erreur de chargement des employés :", error);
    }
  };



  

  // Calcul du salaire net
  const calculSalaireNet = (base, primes, retenues, cnaps, medical, irsa) => {
    const salaireBrut = parseFloat(base || 0) + parseFloat(primes || 0);
    return salaireBrut - parseFloat(cnaps || 0) - parseFloat(medical || 0) - parseFloat(irsa || 0) - parseFloat(retenues || 0);
  };

  // Calculer automatiquement les retenues
  const calculerRetenuesAuto = async () => {
  const { employe_id, mois_salaire, annee_salaire, salaire_base } = formData;

  if (!employe_id || !mois_salaire || !annee_salaire || !salaire_base) return;

  try {
    const response = await axios.post(
      "http://localhost:8000/api/salaires/calculer-retenues-preview",
      { employe_id, mois_salaire, annee_salaire, salaire_base }
    );

    const data = response.data;
    const retenues = data.total_retenues;

    setFormData(prev => ({
      ...prev,
      retenues_salaire: retenues,
      salaire_net: calculSalaireNet(prev.salaire_base, prev.primes_salaire, retenues, prev.cnaps, prev.medical, prev.irsa)
    }));

    setRetenuesInfo(`📊 Détails: ${data.nb_absences} absence(s) + ${data.nb_retards} retard(s) = ${retenues} Ar`);
  } catch (error) {
    console.error("Erreur calcul retenues:", error);
    setRetenuesInfo("❌ Erreur lors du calcul automatique");
  }
};


  // Gérer les changements du formulaire
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: type === "checkbox" ? checked : value
      };

      // Recalculer le salaire net si n'importe quelle valeur change
      if (name === "salaire_base" || name === "primes_salaire" || 
          name === "retenues_salaire" || name === "cnaps" || 
          name === "medical" || name === "irsa") {
        const base = name === "salaire_base" ? value : prev.salaire_base;
        const primes = name === "primes_salaire" ? value : prev.primes_salaire;
        const retenues = name === "retenues_salaire" ? value : prev.retenues_salaire;
        const cnaps = name === "cnaps" ? value : prev.cnaps;
        const medical = name === "medical" ? value : prev.medical;
        const irsa = name === "irsa" ? value : prev.irsa;
        
        newData.salaire_net = calculSalaireNet(base, primes, retenues, cnaps, medical, irsa);
      }

      return newData;
    });
  };

  // Gérer le changement d'employé
  const handleEmployeChange = (e) => {
    const employe_id = e.target.value;
    const selectedEmploye = employes.find(emp => emp.id_employe === parseInt(employe_id));
    
    if (selectedEmploye) {
      const base = selectedEmploye.salaire_base_employe;
      
      setFormData(prev => ({
        ...prev,
        employe_id,
        salaire_base: base,
        salaire_net: calculSalaireNet(base, prev.primes_salaire, prev.retenues_salaire, prev.cnaps, prev.medical, prev.irsa)
      }));
    }
  };

  // Gérer le toggle du calcul automatique
  const handleCalculAutoToggle = (e) => {
    const checked = e.target.checked;
    setFormData(prev => ({ ...prev, calcul_auto_retenues: checked }));
    
    if (checked) {
      calculerRetenuesAuto();
    } else {
      setRetenuesInfo("");
      setFormData(prev => ({
        ...prev,
        retenues_salaire: 0,
        salaire_net: calculSalaireNet(prev.salaire_base, prev.primes_salaire, 0, prev.cnaps, prev.medical, prev.irsa)
      }));
    }
  };

  // Ouvrir la modale
  const handleAddSalaire = () => {
    setFormData({
      mois_salaire: "",
      annee_salaire: "",
      employe_id: "",
      salaire_base: "",
      primes_salaire: 0,
      retenues_salaire: 0,
      cnaps: 0,
      medical: 0,
      irsa: 0,
      salaire_net: 0,
      calcul_auto_retenues: false,
    });
    setRetenuesInfo("");
    setShowModal(true);
  };

  // Voir les détails
  const handleViewDetails = (salaire) => {
    setSelectedSalaire(salaire);
    setShowDetailModal(true);
  };

  // Fermer les modales
  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedSalaire(null);
  };

  // Soumettre le formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.mois_salaire || !formData.annee_salaire || !formData.employe_id || !formData.salaire_base) {
      Swal.fire("Erreur", "Veuillez remplir tous les champs obligatoires", "error");
      return;
    }

    try {
      const dataToSend = {
        ...formData,
        annee_salaire: parseInt(formData.annee_salaire),
        salaire_base: parseFloat(formData.salaire_base),
        primes_salaire: parseFloat(formData.primes_salaire),
        retenues_salaire: parseFloat(formData.retenues_salaire),
        cnaps: parseFloat(formData.cnaps),
        medical: parseFloat(formData.medical),
        irsa: parseFloat(formData.irsa),
        salaire_net: parseFloat(formData.salaire_net),
        employe_id: parseInt(formData.employe_id),
      };

      console.log("📤 Données envoyées:", dataToSend);

      const response = await axios.post("http://localhost:8000/api/salaires", dataToSend);
      console.log("✅ Réponse:", response.data);
      
      Swal.fire("Succès", "Salaire ajouté avec succès", "success");
      fetchSalaires();
      handleCloseModal();
    } catch (error) {
      console.error("❌ Erreur complète:", error);
      console.error("📋 Détails erreur:", error.response?.data);
      console.error("🔴 Status:", error.response?.status);
      
      const errorMsg = error.response?.data?.message || 
                      error.response?.data?.error ||
                      JSON.stringify(error.response?.data) ||
                      "Impossible d'ajouter le salaire";
      
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: errorMsg,
        footer: error.response?.status ? `Code erreur: ${error.response.status}` : ''
      });
    }
  };

  // Supprimer un salaire
  const handleDelete = async (id) => {
    Swal.fire({
      title: "Confirmer la suppression ?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
    }).then(async (result) => {
      if (result.isConfirmed) {
        await axios.delete(`http://localhost:8000/api/salaires/${id}`);
        Swal.fire("Supprimé", "Le salaire a été supprimé", "success");
        fetchSalaires();
      }
    });
  };

  // Filtrage des salaires
  const filteredSalaires = salaires.filter((salaire) => {
    const searchLower = searchText.toLowerCase();
    const employeName = salaire.employe 
      ? `${salaire.employe.nom_employe} ${salaire.employe.prenom_employe}`.toLowerCase()
      : "";
    
    return (
      salaire.mois_salaire.toLowerCase().includes(searchLower) ||
      salaire.annee_salaire.toString().includes(searchLower) ||
      employeName.includes(searchLower)
    );
  });

  // Colonnes du tableau
  const columns = [
    { name: "Mois", selector: (row) => row.mois_salaire, sortable: true, width: "100px" },
    { name: "Année", selector: (row) => row.annee_salaire, sortable: true, width: "80px" },
    { 
      name: "Employé",
      selector: (row) =>
        row.employe ? `${row.employe.nom_employe} ${row.employe.prenom_employe}` : "N/A",
      sortable: true,
      width: "150px"
    },
    { name: "Salaire Base", selector: (row) => `${row.salaire_base} Ar`, sortable: true, width: "120px" },
    { name: "CNAPS", selector: (row) => `${row.cnaps || 0} %`, width: "100px" },
    { name: "Médical", selector: (row) => `${row.medical || 0} %`, width: "100px" },
    { name: "IRSA", selector: (row) => `${row.irsa || 0} %`, width: "100px" },
    { name: "Retenues", selector: (row) => `${row.retenues_salaire} Ar`, width: "100px" },
    { name: "Salaire Net", selector: (row) => `${row.salaire_net} Ar`, sortable: true, width: "120px" },
    {
      name: "Actions",
      cell: (row) => (
        <div className="crud-actions-buttons">
          <button 
            className="crud-btn-icon view" 
            onClick={() => handleViewDetails(row)}
            title="Voir détails"
          >
            <FaEye size={16} />
          </button>
          <button 
            className="crud-btn-icon delete" 
            onClick={() => handleDelete(row.id_salaire)}
            title="Supprimer"
          >
            <FaTrash size={16} />
          </button>
        </div>
      ),
      width: "100px"
    },
  ];

  return (
    <div className="crud-container">
      <div className="crud-header">
        <h1 className="crud-table-title">Gestion des Salaires</h1>
        <button className="crud-add-btn" onClick={handleAddSalaire}>
          + Ajouter un Salaire
        </button>
      </div>

      {/* Barre de recherche */}
      <div className="crud-search-bar">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Rechercher par mois, année ou employé..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      <div className="crud-table-container">
        <DataTable
          columns={columns}
          data={filteredSalaires}
          pagination
          highlightOnHover
          striped
          noDataComponent="Aucun salaire trouvé"
          paginationComponentOptions={{
            rowsPerPageText: 'Lignes par page:',
            rangeSeparatorText: 'de',
          }}
        />
      </div>

      {/* Modale Ajout Salaire */}
      {showModal && (
        <div className="crud-modal-overlay" onClick={handleCloseModal}>
          <div className="crud-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <span className="crud-close-btn" onClick={handleCloseModal}>
              &times;
            </span>

            <div className="crud-card">
              <div className="crud-card-header">
                <h2>Ajouter un Salaire</h2>
                <p>Remplissez les informations du salaire</p>
              </div>

              <form className="crud-form" onSubmit={handleSubmit}>
                <div className="crud-form-group">
                  <label>Mois *</label>
                  <select
                    name="mois_salaire"
                    value={formData.mois_salaire}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">-- Sélectionner un mois --</option>
                    <option value="Janvier">Janvier</option>
                    <option value="Février">Février</option>
                    <option value="Mars">Mars</option>
                    <option value="Avril">Avril</option>
                    <option value="Mai">Mai</option>
                    <option value="Juin">Juin</option>
                    <option value="Juillet">Juillet</option>
                    <option value="Août">Août</option>
                    <option value="Septembre">Septembre</option>
                    <option value="Octobre">Octobre</option>
                    <option value="Novembre">Novembre</option>
                    <option value="Décembre">Décembre</option>
                  </select>
                </div>

                <div className="crud-form-group">
                  <label>Année *</label>
                  <input
                    type="number"
                    name="annee_salaire"
                    placeholder="Année"
                    value={formData.annee_salaire}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="crud-form-group">
                  <label>Employé *</label>
                  <select
                    name="employe_id"
                    value={formData.employe_id}
                    onChange={handleEmployeChange}
                    required
                  >
                    <option value="">-- Choisir un employé --</option>
                    {employes.map((emp) => (
                      <option key={emp.id_employe} value={emp.id_employe}>
                        {emp.nom_employe} {emp.prenom_employe}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="crud-form-group">
                  <label>Salaire de base *</label>
                  <input
                    type="number"
                    name="salaire_base"
                    placeholder="Salaire de base"
                    value={formData.salaire_base}
                    readOnly
                  />
                </div>

                <div className="crud-form-group">
                  <label>Primes</label>
                  <input
                    type="number"
                    name="primes_salaire"
                    placeholder="Primes"
                    value={formData.primes_salaire}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="crud-form-group">
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      name="calcul_auto_retenues"
                      checked={formData.calcul_auto_retenues}
                      onChange={handleCalculAutoToggle}
                      style={{ marginRight: '10px', width: '20px', height: '20px' }}
                    />
                    <span>Calculer automatiquement les retenues (absences/retards)</span>
                  </label>
                </div>

                <div className="crud-form-group">
                  <label>Retenues</label>
                  <input
                    type="number"
                    name="retenues_salaire"
                    placeholder="Retenues"
                    value={formData.retenues_salaire}
                    onChange={handleInputChange}
                    readOnly={formData.calcul_auto_retenues}
                  />
                  {retenuesInfo && (
                    <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
                      {retenuesInfo}
                    </small>
                  )}
                </div>

                <div className="crud-form-group">
                  <label>CNAPS (1%)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="cnaps"
                    placeholder="CNAPS"
                    value={formData.cnaps}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="crud-form-group">
                  <label>Cotisation Médicale (1%)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="medical"
                    placeholder="Médical"
                    value={formData.medical}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="crud-form-group">
                  <label>IRSA</label>
                  <input
                    type="number"
                    step="0.01"
                    name="irsa"
                    placeholder="IRSA"
                    value={formData.irsa}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="crud-form-group">
                  <label>Salaire net</label>
                  <input
                    type="number"
                    name="salaire_net"
                    placeholder="Salaire net"
                    value={formData.salaire_net}
                    readOnly
                    style={{ fontWeight: 'bold', fontSize: '16px' }}
                  />
                </div>

                <div className="crud-form-actions">
                  <button type="button" className="crud-cancel-btn" onClick={handleCloseModal}>
                    Annuler
                  </button>
                  <button type="submit" className="crud-submit-btn">
                    Enregistrer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modale Détails Salaire */}
      {showDetailModal && selectedSalaire && (
        <div className="crud-modal-overlay" onClick={handleCloseDetailModal}>
          <div className="crud-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <span className="crud-close-btn" onClick={handleCloseDetailModal}>
              &times;
            </span>

            <div className="crud-card">
              <div className="crud-card-header">
                <h2>📋 Détails du Salaire</h2>
                <p>{selectedSalaire.mois_salaire} {selectedSalaire.annee_salaire}</p>
              </div>

              <div style={{ padding: '20px' }}>
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '16px', marginBottom: '10px', color: '#333' }}>
                    👤 {selectedSalaire.employe?.nom_employe} {selectedSalaire.employe?.prenom_employe}
                  </h3>
                </div>

                <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
                  <h4 style={{ fontSize: '14px', marginBottom: '10px', color: '#555' }}>💵 Rémunération</h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e0e0e0' }}>
                    <span>Salaire de base:</span>
                    <strong>{selectedSalaire.salaire_base} Ar</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e0e0e0' }}>
                    <span>Primes:</span>
                    <strong>{selectedSalaire.primes_salaire} Ar</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontWeight: 'bold', color: '#2563eb' }}>
                    <span>Salaire brut:</span>
                    <span>{(parseFloat(selectedSalaire.salaire_base) + parseFloat(selectedSalaire.primes_salaire)).toFixed(2)} Ar</span>
                  </div>
                </div>

                <div style={{ backgroundColor: '#fff3cd', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
                  <h4 style={{ fontSize: '14px', marginBottom: '10px', color: '#856404' }}>📉 Déductions</h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #ffc107' }}>
                    <span>CNAPS (1%):</span>
                    <strong>{selectedSalaire.cnaps || 0} Ar</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #ffc107' }}>
                    <span>Médical (1%):</span>
                    <strong>{selectedSalaire.medical || 0} Ar</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #ffc107' }}>
                    <span>IRSA:</span>
                    <strong>{selectedSalaire.irsa || 0} Ar</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                    <span>Retenues:</span>
                    <strong>{selectedSalaire.retenues_salaire} Ar</strong>
                  </div>
                </div>

                <div style={{ backgroundColor: '#d1fae5', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                  <h4 style={{ fontSize: '14px', marginBottom: '5px', color: '#065f46' }}>✅ Salaire Net à Payer</h4>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#059669' }}>
                    {selectedSalaire.salaire_net} Ar
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Salaire;