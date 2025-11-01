import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "../../StyleCss/BulletinSalaire.css";

function BulletinSalaire() {
  const [bulletins, setBulletins] = useState([]);
  const [salaireList, setSalaireList] = useState([]);
  const [formData, setFormData] = useState({
    reference_bulletin: "",
    date_generation: "",
    salaire_id: "",
  });
  const [showModal, setShowModal] = useState(false);

  const [showUploadModal, setShowUploadModal] = useState(false);
const [selectedBulletinId, setSelectedBulletinId] = useState(null);
const [selectedFile, setSelectedFile] = useState(null);

const handleUploadPDF = async (e) => {
  e.preventDefault();

  if (!selectedFile) {
    Swal.fire("⚠️ Oups", "Veuillez sélectionner un fichier PDF", "warning");
    return;
  }

  const formDataUpload = new FormData();
  formDataUpload.append("fichier_pdf", selectedFile);

  try {
    await axios.post(`http://127.0.0.1:8000/api/bulletins/${selectedBulletinId}/upload`, formDataUpload, {
      headers: { "Content-Type": "multipart/form-data" }
    });

    Swal.fire("✅ Succès", "PDF ajouté avec succès", "success");
    fetchBulletins();
    setShowUploadModal(false);

  } catch (error) {
    Swal.fire("❌ Erreur", "Impossible de téléverser le PDF", "error");
  }
};


const handleOpenUploadModal = (id) => {
  setSelectedBulletinId(id);
  setShowUploadModal(true);
};



  useEffect(() => {
    fetchBulletins();
    fetchSalaires();
  }, []);

  const fetchBulletins = async () => {
    const res = await axios.get("http://127.0.0.1:8000/api/bulletins");
    setBulletins(res.data);
  };

  const fetchSalaires = async () => {
    const res = await axios.get("http://127.0.0.1:8000/api/salaires");
    setSalaireList(res.data);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://127.0.0.1:8000/api/bulletins", formData);
      Swal.fire("✅ Succès", "Bulletin de salaire créé avec succès", "success");
      fetchBulletins();
      setFormData({ reference_bulletin: "", date_generation: "", salaire_id: "" });
      setShowModal(false);
    } catch (error) {
      Swal.fire("❌ Erreur", error.response?.data?.message || "Échec de création", "error");
    }
  };

 const generatePDF = async (id) => {
  try {
    const response = await axios.get(
      `http://127.0.0.1:8000/api/bulletins/${id}/generate-pdf`,
      { 
        responseType: "blob",
        validateStatus: (status) => status < 500 // Permet de gérer les erreurs 4xx
      }
    );

    // Vérifier si la réponse est une erreur JSON au lieu d'un PDF
    if (response.data.type === 'application/json') {
      const text = await response.data.text();
      const errorData = JSON.parse(text);
      throw new Error(errorData.message || "Erreur lors de la génération du PDF");
    }

    // Vérifier si le blob n'est pas vide
    if (response.data.size === 0) {
      throw new Error("Le fichier PDF est vide");
    }

    const fileURL = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    const link = document.createElement("a");
    link.href = fileURL;
    link.setAttribute("download", `bulletin_${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    // Nettoyer l'URL du blob
    window.URL.revokeObjectURL(fileURL);

    // Rafraîchir la liste pour voir le lien "Voir PDF"
    await fetchBulletins();

    Swal.fire("📄 Succès", "Bulletin PDF généré et téléchargé", "success");
  } catch (error) {
    console.error("Erreur PDF:", error);
    
    // Afficher le message d'erreur spécifique si disponible
    const errorMessage = error.response?.data?.message || error.message || "Impossible de générer le PDF";
    
    Swal.fire("⚠️ Erreur", errorMessage, "error");
  }
};



  return (
    <div className="bulletin-container">
      <div className="header-section">
        <h2>Gestion des Bulletins de Salaire</h2>
        <button className="btn-add" onClick={() => setShowModal(true)}>
          Nouveau Bulletin
        </button>
      </div>

      {/* Tableau */}
      <table className="bulletin-table">
        <thead>
          <tr>
            <th>Référence</th>
            <th>Date</th>
            <th>Employé</th>
            <th>Salaire Net</th>
            <th>Fichier PDF</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {bulletins.map((b) => (
            <tr key={b.id_bulletin}>
              <td>{b.reference_bulletin}</td>
              <td>{b.date_generation}</td>
              <td>{b.salaire?.employe?.nom_employe}</td>
              <td>{b.salaire?.salaire_net?.toLocaleString()} Ar</td>
              <td>
                {b.fichier_pdf ? (
                  <a
                    href={`http://127.0.0.1:8000/storage/${b.fichier_pdf}`}
                    target="_blank"
                    rel="noreferrer"
                    className="pdf-link"
                  >
                    Voir PDF
                  </a>
                ) : (
                  <span className="no-file">Aucun</span>
                )}
              </td>
              <td>
                 <button 
                    className="btn-upload"
                    onClick={() => handleOpenUploadModal(b.id_bulletin)}
                  >
                    Modifier (Joindre PDF)
                  </button>

                <button className="btn-generate" onClick={() => generatePDF(b.id_bulletin)}>
                  Générer PDF
                </button>

              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modale Formulaire */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Créer un Bulletin de Salaire</h3>
            <form onSubmit={handleSubmit} className="modal-form">
              <label>Référence Bulletin</label>
              <input
                type="text"
                name="reference_bulletin"
                value={formData.reference_bulletin}
                onChange={handleChange}
                required
              />

              <label>Date de génération</label>
              <input
                type="date"
                name="date_generation"
                value={formData.date_generation}
                onChange={handleChange}
                required
              />

              <label>Salaire associé</label>
              <select
                name="salaire_id"
                value={formData.salaire_id}
                onChange={handleChange}
                required
              >
                <option value="">-- Sélectionner --</option>
                {salaireList.map((s) => (
                  <option key={s.id_salaire} value={s.id_salaire}>
                    {s.employe.nom_employe} {s.employe.prenom_employe} —{" "}
                    {s.mois_salaire} {s.annee_salaire}
                  </option>
                ))}
              </select>

              <div className="modal-buttons">
                <button type="submit" className="btn-save">Enregistrer</button>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}>
                  Fermer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {showUploadModal && (
  <div className="modal-overlay">
    <div className="modal-content">
      <h3>Joindre un PDF signé</h3>
      <form onSubmit={handleUploadPDF}>
        <input 
          type="file" 
          accept="application/pdf" 
          onChange={(e) => setSelectedFile(e.target.files[0])} 
          required 
        />

        <div className="modal-buttons">
          <button type="submit" className="btn-save">Enregistrer</button>
          <button type="button" className="btn-close" onClick={() => setShowUploadModal(false)}>
            Fermer
          </button>
        </div>
      </form>
    </div>
  </div>
)}

    </div>
  );
}

export default BulletinSalaire;
