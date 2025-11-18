import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";
import DataTable from "react-data-table-component";
import "../../StyleCss/Crud.css";
import { FaEdit, FaTrash, FaSearch, FaPlus, FaEye } from "react-icons/fa";
import axios from "axios";

export default function Employe() {
  const { id_service } = useParams();
  const [nomService, setNomService] = useState("");
  const [employes, setEmployes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [contrat, setContrat] = useState(null);


  // Champs Employé
  const [matriculeEmploye, setMatriculeEmploye] = useState("");
  const [nomEmploye, setNomEmploye] = useState("");
  const [prenomEmploye, setPrenomEmploye] = useState("");
  const [dateNaissanceEmploye, setDateNaissanceEmploye] = useState("");
  const [cinEmploye, setCinEmploye] = useState("");
  const [adresseEmploye, setAdresseEmploye] = useState("");
  const [emailEmploye, setEmailEmploye] = useState("");
  const [telephoneEmploye, setTelephoneEmploye] = useState("");
  const [dateEmbaucheEmploye, setDateEmbaucheEmploye] = useState("");
  const [posteEmploye, setPosteEmploye] = useState("");
  const [salaireBaseEmploye, setSalaireBaseEmploye] = useState("");
  const [photoProfilEmploye, setPhotoProfilEmploye] = useState(null);

  // Charger le nom du service
  useEffect(() => {
    const fetchService = async () => {
      try {
        const res = await axios.get(`http://127.0.0.1:8000/api/services/${id_service}`);
        setNomService(res.data.nom_service);
      } catch (error) {
        console.error("Erreur lors du chargement du service :", error);
      }
    };
    if (id_service) fetchService();
  }, [id_service]);

  // Charger les employés
  useEffect(() => {
    const fetchEmployes = async () => {
      try {
        const res = await axios.get(`http://127.0.0.1:8000/api/employes/${id_service}`);
        setEmployes(res.data);
      } catch (error) {
        console.error("Erreur lors du chargement des employés :", error);
      }
    };
    if (id_service) fetchEmployes();
  }, [id_service]);

  // Colonnes du tableau
  const columns = [
    { name: "Matricule", selector: (row) => row.matricule_employe, sortable: true },
    { name: "Nom", selector: (row) => row.nom_employe },
    { name: "Prénom", selector: (row) => row.prenom_employe },
    { name: "Poste", selector: (row) => row.poste_employe },
    { name: "Salaire", selector: (row) => row.salaire_base_employe },
    {
      name: "Photo",
      cell: (row) =>
        row.photo_profil_employe ? (
          <img
            src={`http://127.0.0.1:8000/storage/${row.photo_profil_employe}`}
            alt="profil"
            width="40"
            height="40"
            style={{ borderRadius: "50%", objectFit: "cover" }}
          />
        ) : (
          "Aucune"
        ),
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="crud-actions-buttons">
          <button className="crud-btn-icon view" onClick={() => handleView(row)}>
            <FaEye />
          </button>
          <button className="crud-btn-icon edit" onClick={() => handleEdit(row)}>
            <FaEdit />
          </button>
          <button className="crud-btn-icon delete" onClick={() => handleDelete(row.id_employe)}>
            <FaTrash />
          </button>
        </div>
      ),
    }
  ];

  // Recherche
  const filteredEmployes = employes.filter(
    (emp) =>
      emp.nom_employe?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.prenom_employe?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.matricule_employe?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Ouvrir le modal pour ajout
  const handleAdd = () => {
    setEditingId(null);
    resetForm();
    setModalOpen(true);
  };

  // Modifier employé
  const handleEdit = (row) => {
    setEditingId(row.id_employe);
    setMatriculeEmploye(row.matricule_employe);
    setNomEmploye(row.nom_employe);
    setPrenomEmploye(row.prenom_employe);
    setDateNaissanceEmploye(row.date_naissance_employe);
    setCinEmploye(row.cin_employe);
    setAdresseEmploye(row.adresse_employe);
    setEmailEmploye(row.email_employe);
    setTelephoneEmploye(row.telephone_employe);
    setDateEmbaucheEmploye(row.date_embauche_employe);
    setPosteEmploye(row.poste_employe);
    setSalaireBaseEmploye(row.salaire_base_employe);
    setPhotoProfilEmploye(null);
    setModalOpen(true);
  };

  // Supprimer employé
  const handleDelete = async (id) => {
    Swal.fire({
      title: "Confirmer la suppression ?",
      text: "Cette action est irréversible.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://127.0.0.1:8000/api/employes/${id}`);
          setEmployes(employes.filter((emp) => emp.id_employe !== id));
          Swal.fire("Supprimé !", "L'employé a été supprimé.", "success");
        } catch (error) {
          Swal.fire("Erreur", "Impossible de supprimer cet employé", "error");
        }
      }
    });
  };

  // Ajouter ou modifier
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("matricule_employe", matriculeEmploye);
    formData.append("nom_employe", nomEmploye);
    formData.append("prenom_employe", prenomEmploye);
    formData.append("date_naissance_employe", dateNaissanceEmploye);
    formData.append("cin_employe", cinEmploye);
    formData.append("adresse_employe", adresseEmploye);
    formData.append("email_employe", emailEmploye);
    formData.append("telephone_employe", telephoneEmploye);
    formData.append("date_embauche_employe", dateEmbaucheEmploye);
    formData.append("poste_employe", posteEmploye);
    formData.append("salaire_base_employe", salaireBaseEmploye);
    formData.append("service_id", id_service);
    if (photoProfilEmploye) formData.append("photo_profil_employe", photoProfilEmploye);

    try {
      if (editingId) {
        await axios.post(
          `http://127.0.0.1:8000/api/employes/${editingId}?_method=PUT`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        Swal.fire("Modifié", "Employé mis à jour avec succès", "success");
      } else {
        await axios.post(`http://127.0.0.1:8000/api/employes`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        Swal.fire("Ajouté", "Nouvel employé ajouté avec succès", "success");
      }

      // Rechargement de la liste
      const res = await axios.get(`http://127.0.0.1:8000/api/employes/${id_service}`);
      setEmployes(res.data);
      setModalOpen(false);
    } catch (error) {
      Swal.fire("Erreur", "Vérifiez les champs du formulaire", "error");
      console.error(error);
    }
  };

  // Réinitialiser formulaire
  const resetForm = () => {
    setMatriculeEmploye("");
    setNomEmploye("");
    setPrenomEmploye("");
    setDateNaissanceEmploye("");
    setCinEmploye("");
    setAdresseEmploye("");
    setEmailEmploye("");
    setTelephoneEmploye("");
    setDateEmbaucheEmploye("");
    setPosteEmploye("");
    setSalaireBaseEmploye("");
    setPhotoProfilEmploye(null);
  };

  // Validation CIN
const handleCinChange = (e) => {
  const value = e.target.value;
  if (/^\d*$/.test(value)) { // Empêche les caractères non numériques
    if (value.length <= 12) {
      setCinEmploye(value);
    } else {
      Swal.fire({
        icon: "warning",
        title: "Attention",
        text: "Le numéro CIN ne peut pas dépasser 12 chiffres.",
      });
    }
  }
};

// Validation Téléphone
const handleTelephoneChange = (e) => {
  const value = e.target.value;
  if (/^\d*$/.test(value)) {
    if (value.length <= 10) {
      setTelephoneEmploye(value);
    } else {
      Swal.fire({
        icon: "warning",
        title: "Attention",
        text: "Le numéro de téléphone ne peut pas dépasser 10 chiffres.",
      });
    }
  }
};

const [viewModalOpen, setViewModalOpen] = useState(false);

const handleView = async (row) => {
  setMatriculeEmploye(row.matricule_employe);
  setNomEmploye(row.nom_employe);
  setPrenomEmploye(row.prenom_employe);
  setDateNaissanceEmploye(row.date_naissance_employe);
  setCinEmploye(row.cin_employe);
  setAdresseEmploye(row.adresse_employe);
  setEmailEmploye(row.email_employe);
  setTelephoneEmploye(row.telephone_employe);
  setDateEmbaucheEmploye(row.date_embauche_employe);
  setPosteEmploye(row.poste_employe);
  setSalaireBaseEmploye(row.salaire_base_employe);
  setPhotoProfilEmploye(row.photo_profil_employe);

  try {
    const res = await axios.get(`http://127.0.0.1:8000/api/contrats/employe/${row.id_employe}`);
    setContrat(res.data ? res.data : null);

  } catch (error) {
    console.error("Erreur lors du chargement du contrat :", error);
    setContrat(null);
  }

  setViewModalOpen(true);
};



  return (
    <div className="crud-container">
      <h2 className="crud-table-title">
        Gestion des Employés du service :{" "}
        <span style={{ color: "#007bff" }}>{nomService}</span>
      </h2>

      <div className="crud-header">
        <button className="crud-add-btn" onClick={handleAdd}>
          <FaPlus /> Ajouter un employé
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

      <DataTable
        columns={columns}
        data={filteredEmployes}
        pagination
        highlightOnHover
        striped
        noDataComponent="Aucun employé trouvé."
      />

      {/* Modal */}
      {modalOpen && (
        <div className="crud-modal-overlay">
          <div className="crud-modal-content">
            <span className="crud-close-btn" onClick={() => setModalOpen(false)}>
              &times;
            </span>
            <h2>{editingId ? "Modifier un employé" : "Ajouter un employé"}</h2>

            <form onSubmit={handleSubmit} className="crud-form">
              <div className="grid grid-cols-2 gap-3">
                <div className="crud-form-group">
                  <label>Matricule</label>
                  <input type="text"  placeholder="Ex: E001" value={matriculeEmploye} onChange={(e) => setMatriculeEmploye(e.target.value)} required />
                </div>

                <div className="crud-form-group">
                  <label>Nom</label>
                  <input type="text" placeholder="Ex: RAKOTO" value={nomEmploye} onChange={(e) => setNomEmploye(e.target.value)} required />
                </div>

                <div className="crud-form-group">
                  <label>Prénom</label>
                  <input type="text" placeholder="Ex: Jean" value={prenomEmploye} onChange={(e) => setPrenomEmploye(e.target.value)} required />
                </div>

                <div className="crud-form-group">
                  <label>Date de naissance</label>
                  <input type="date" value={dateNaissanceEmploye} onChange={(e) => setDateNaissanceEmploye(e.target.value)} required />
                </div>

                <div className="crud-form-group">
                  <label>CIN</label>
                  <input
                    type="text"
                    placeholder="Ex: xxxxxxxxxxxx"
                    value={cinEmploye}
                    onChange={handleCinChange}
                    required
                  />
                </div>
                <div className="crud-form-group">
                  <label>Adresse</label>
                  <input type="text" placeholder="Ex: Toliara" value={adresseEmploye} onChange={(e) => setAdresseEmploye(e.target.value)} required />
                </div>

                <div className="crud-form-group">
                  <label>Email</label>
                  <input type="email" placeholder="Ex: @gmail.com" value={emailEmploye} onChange={(e) => setEmailEmploye(e.target.value)} required />
                </div>

               <div className="crud-form-group">
                  <label>Téléphone</label>
                  <input
                    type="text"
                    placeholder="Ex: xxxxxxxxxx"
                    value={telephoneEmploye}
                    onChange={handleTelephoneChange}
                    required
                  />
                </div>

                <div className="crud-form-group">
                  <label>Date d'embauche</label>
                  <input type="date" value={dateEmbaucheEmploye} onChange={(e) => setDateEmbaucheEmploye(e.target.value)} required />
                </div>

                <div className="crud-form-group">
                  <label>Poste</label>
                  <input type="text" placeholder="Ex: Chef" value={posteEmploye} onChange={(e) => setPosteEmploye(e.target.value)} required />
                </div>

                <div className="crud-form-group">
                  <label>Salaire de base</label>
                  <input type="number" placeholder="Ex: xxxxxxxxxxxx" value={salaireBaseEmploye} onChange={(e) => setSalaireBaseEmploye(e.target.value)} required />
                </div>

                <div className="crud-form-group">
                  <label>Photo de profil</label>
                  <input type="file" accept="image/*" onChange={(e) => setPhotoProfilEmploye(e.target.files[0])} />
                </div>
              </div>

              <div className="crud-form-actions">
                <button type="button" className="crud-cancel-btn" onClick={() => setModalOpen(false)}>
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


      {viewModalOpen && (
            <div className="crud-modal-overlay">
              <div className="crud-modal-content">
                <span className="crud-close-btn" onClick={() => setViewModalOpen(false)}>
                  &times;
                </span>
                <h2>Informations Employé</h2>

                <div className="view-employe-container" style={{ display: "flex", gap: "20px" }}>
                  {/* Texte à gauche */}
                  {photoProfilEmploye && (
                    <div>
                      <img
                        src={`http://127.0.0.1:8000/storage/${photoProfilEmploye}`}
                        alt="profil"
                        width="120"
                        height="120"
                        style={{ borderRadius: "50%", objectFit: "cover" }}
                      />
                    </div>
                  )}
                  <div style={{ flex: 1 }}>
                    <p><strong>Matricule :</strong> {matriculeEmploye}</p>
                    <p><strong>Nom :</strong> {nomEmploye}</p>
                    <p><strong>Prénom :</strong> {prenomEmploye}</p>
                    <p><strong>Date de naissance :</strong> {new Date(dateNaissanceEmploye).toLocaleDateString("fr-FR")}</p>
                    <p><strong>CIN :</strong> {cinEmploye}</p>
                    <p><strong>Adresse :</strong> {adresseEmploye}</p>
                    <p><strong>Email :</strong> {emailEmploye}</p>
                    <p><strong>Téléphone :</strong> {telephoneEmploye}</p>
                    <p><strong>Date d'embauche :</strong> {new Date(dateEmbaucheEmploye).toLocaleDateString("fr-FR")}</p>
                    <p><strong>Poste :</strong> {posteEmploye}</p>
                    <p><strong>Salaire de base :</strong> {salaireBaseEmploye}</p>
                    <p><strong>Service :</strong> {nomService}</p>
                 <h3>Informations du contrat :</h3>
                  {contrat ? (
                    <div>
                      <p><strong>Type :</strong> {contrat.type_contrat}</p>
                      <p><strong>Date début :</strong> {contrat.date_debut_contrat}</p>
                      <p><strong>Date fin :</strong> {contrat.date_fin_contrat}</p>
                      <p><strong>Statut :</strong> {contrat.statut_contrat}</p>
                    </div>
                  ) : (
                    <p style={{ color: "red" }}>Aucun contrat n'a été fait</p>
                  )}
                  </div>

                  <div>
                
                </div>


               
                </div>

                <div style={{ textAlign: "right", marginTop: "20px" }}>
                  <button className="crud-submit-btn" onClick={() => setViewModalOpen(false)}>
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          )}





    </div>
  );
}