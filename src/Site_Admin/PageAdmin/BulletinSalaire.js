import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import DataTable from "react-data-table-component";
import { FaSearch, FaFilePdf, FaUpload, FaEye } from "react-icons/fa";
import "../../StyleCss/Crud.css";

function BulletinSalaire() {
  const [bulletins, setBulletins] = useState([]);
  const [salaireList, setSalaireList] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [formData, setFormData] = useState({
    reference_bulletin: "",
    date_generation: "",
    salaire_id: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedBulletinId, setSelectedBulletinId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchBulletins();
    fetchSalaires();
  }, []);

  const fetchBulletins = async () => {
    const res = await axios.get(`${process.env.REACT_APP_API_URL}api/bulletins`);
    setBulletins(res.data);
  };

  const fetchSalaires = async () => {
    const res = await axios.get(`${process.env.REACT_APP_API_URL}api/salaires`);
    setSalaireList(res.data);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}api/bulletins`, formData);
      Swal.fire("Succès", "Bulletin de salaire créé avec succès", "success");
      fetchBulletins();
      setFormData({ reference_bulletin: "", date_generation: "", salaire_id: "" });
      setShowModal(false);
    } catch (error) {
      Swal.fire("Erreur", error.response?.data?.message || "Échec de création", "error");
    }
  };

  const handleUploadPDF = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      Swal.fire("Oups", "Veuillez sélectionner un fichier PDF", "warning");
      return;
    }

    const formDataUpload = new FormData();
    formDataUpload.append("fichier_pdf", selectedFile);

    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}api/bulletins/${selectedBulletinId}/upload`,
        formDataUpload,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      Swal.fire("Succès", "PDF ajouté avec succès", "success");
      fetchBulletins();
      setShowUploadModal(false);
      setSelectedFile(null);
    } catch (error) {
      Swal.fire("Erreur", "Impossible de téléverser le PDF", "error");
    }
  };

  const handleOpenUploadModal = (id) => {
    setSelectedBulletinId(id);
    setSelectedFile(null);
    setShowUploadModal(true);
  };

  const generatePDF = async (id) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}api/bulletins/${id}/generate-pdf`,
        {
          responseType: "blob",
          validateStatus: (status) => status < 500,
        }
      );

      if (response.data.type === "application/json") {
        const text = await response.data.text();
        const errorData = JSON.parse(text);
        throw new Error(errorData.message || "Erreur lors de la génération du PDF");
      }

      if (response.data.size === 0) {
        throw new Error("Le fichier PDF est vide");
      }

      const fileURL = window.URL.createObjectURL(
        new Blob([response.data], { type: "application/pdf" })
      );
      const link = document.createElement("a");
      link.href = fileURL;
      link.setAttribute("download", `bulletin_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(fileURL);
      await fetchBulletins();

      Swal.fire("📄 Succès", "Bulletin PDF généré et téléchargé", "success");
    } catch (error) {
      console.error("Erreur PDF:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Impossible de générer le PDF";
      Swal.fire("⚠️ Erreur", errorMessage, "error");
    }
  };

  // Filtrage des bulletins
  const filteredBulletins = bulletins.filter((bulletin) => {
    const searchLower = searchText.toLowerCase();
    const employeName = bulletin.salaire?.employe?.nom_employe?.toLowerCase() || "";
    const reference = bulletin.reference_bulletin?.toLowerCase() || "";

    return reference.includes(searchLower) || employeName.includes(searchLower);
  });
 const formatDate = (date) => (date ? new Date(date).toLocaleDateString('fr-FR') : "N/A");

  // Colonnes du tableau
  const columns = [
    {
      name: "Référence",
      selector: (row) => row.reference_bulletin,
      sortable: true,
    },
    {
      name: "Date",
      selector: (row) => formatDate(row.date_generation),
      sortable: true,
    },
    {
      name: "Employé",
      selector: (row) => row.salaire?.employe?.nom_employe || "N/A",
      sortable: true,
    },
    {
      name: "Salaire Net",
      selector: (row) => `${row.salaire?.salaire_net?.toLocaleString() || 0} Ar`,
      sortable: true,
    },
    {
      name: "Fichier PDF",
      cell: (row) =>
        row.fichier_pdf ? (
          <a
            href={`${process.env.REACT_APP_API_URL}storage/${row.fichier_pdf}`}
            target="_blank"
            rel="noreferrer"
            style={{
              color: "#667eea",
              textDecoration: "none",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <FaEye /> Voir PDF
          </a>
        ) : (
          <span style={{ color: "#999" }}>Aucun</span>
        ),
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="crud-actions-buttons">
          <button
            className="crud-btn-icon edit"
            onClick={() => handleOpenUploadModal(row.id_bulletin)}
            title="Joindre PDF"
          >
            <FaUpload size={16} />
          </button>
          <button
            className="crud-btn-icon"
            onClick={() => generatePDF(row.id_bulletin)}
            title="Générer PDF"
            style={{
              color: "#dc2626",
              backgroundColor: "rgba(220, 38, 38, 0.1)",
            }}
          >
            <FaFilePdf size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="crud-container">
      <div className="crud-header">
        <h1 className="crud-table-title">Gestion des Bulletins de Salaire</h1>
        <button className="crud-add-btn" onClick={() => setShowModal(true)}>
          + Nouveau Bulletin
        </button>
      </div>

      {/* Barre de recherche */}
      <div className="crud-search-bar">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Rechercher par référence ou employé..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>

      <div className="crud-table-container">
        <DataTable
          columns={columns}
          data={filteredBulletins}
          pagination
          highlightOnHover
          striped
          noDataComponent="Aucun bulletin trouvé"
          paginationComponentOptions={{
            rowsPerPageText: "Lignes par page:",
            rangeSeparatorText: "de",
          }}
        />
      </div>

      {/* Modale Créer un bulletin */}
      {showModal && (
        <div className="crud-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="crud-modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="crud-close-btn" onClick={() => setShowModal(false)}>
              &times;
            </span>

            <div className="crud-card">
              <div className="crud-card-header">
                <h2>Créer un Bulletin de Salaire</h2>
                <p>Remplissez les informations du bulletin</p>
              </div>

              <form className="crud-form" onSubmit={handleSubmit}>
                <div className="crud-form-group">
                  <label>Référence Bulletin *</label>
                  <input
                    type="text"
                    name="reference_bulletin"
                    placeholder="Ex: BS-2025-001"
                    value={formData.reference_bulletin}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="crud-form-group">
                  <label>Date de génération *</label>
                  <input
                    type="date"
                    name="date_generation"
                    value={formData.date_generation}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="crud-form-group">
                  <label>Salaire associé *</label>
                  <select
                    name="salaire_id"
                    value={formData.salaire_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">-- Sélectionner un salaire --</option>
                    {salaireList.map((s) => (
                      <option key={s.id_salaire} value={s.id_salaire}>
                        {s.employe.nom_employe} {s.employe.prenom_employe} — {s.mois_salaire}{" "}
                        {s.annee_salaire}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="crud-form-actions">
                  <button
                    type="button"
                    className="crud-cancel-btn"
                    onClick={() => setShowModal(false)}
                  >
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

      {/* Modale Upload PDF */}
      {showUploadModal && (
        <div
          className="crud-modal-overlay"
          onClick={() => setShowUploadModal(false)}
        >
          <div className="crud-modal-content" onClick={(e) => e.stopPropagation()}>
            <span
              className="crud-close-btn"
              onClick={() => setShowUploadModal(false)}
            >
              &times;
            </span>

            <div className="crud-card">
              <div className="crud-card-header">
                <h2>Joindre un PDF signé</h2>
                <p>Téléversez le bulletin de salaire signé</p>
              </div>

              <form className="crud-form" onSubmit={handleUploadPDF}>
                <div className="crud-form-group">
                  <label>Fichier PDF *</label>
                  <div className="crud-file-input-wrapper">
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => setSelectedFile(e.target.files[0])}
                      className="crud-file-input"
                      id="pdf-upload"
                      required
                    />
                    <label htmlFor="pdf-upload" className="crud-file-label">
                      {selectedFile ? selectedFile.name : "📄 Choisir un fichier PDF"}
                    </label>
                  </div>
                </div>

                {selectedFile && (
                  <div className="crud-image-preview">
                    <p style={{ padding: "15px", textAlign: "center", color: "#666" }}>
                      ✅ Fichier sélectionné : <strong>{selectedFile.name}</strong>
                    </p>
                  </div>
                )}

                <div className="crud-form-actions">
                  <button
                    type="button"
                    className="crud-cancel-btn"
                    onClick={() => setShowUploadModal(false)}
                  >
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
    </div>
  );
}

export default BulletinSalaire;