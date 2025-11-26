import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import DataTable from "react-data-table-component";
import "../../StyleCss/Absence.css";
import { FaTrash, FaEye } from "react-icons/fa";

export default function Absence() {
  const [formData, setFormData] = useState({
    date_debut: "",
    date_fin: "",
    motif_absence: "",
    justificatif: null,
    message: "",
  });

  const [absences, setAbsences] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewMessage, setViewMessage] = useState("");
  const [messageModalOpen, setMessageModalOpen] = useState(false);

  const userData = JSON.parse(sessionStorage.getItem("userData"));

  useEffect(() => {
    if (userData?.id_employe) {
      fetchAbsences();
    }
  }, []);

  const fetchAbsences = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}api/absences/employe/${userData.id_employe}`
      );
      setAbsences(res.data);
    } catch (err) {
      console.error("Erreur lors de la récupération des absences :", err);
    }
  };

  

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = new FormData();
    form.append("date_debut", formData.date_debut);
    form.append("date_fin", formData.date_fin);
    form.append("motif_absence", formData.motif_absence);
    form.append("employe_id", userData.id_employe);
    form.append("message", formData.message);
    if (formData.justificatif) form.append("justificatif", formData.justificatif);

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}api/absences`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Swal.fire("Succès", "Demande envoyée", "success");

      setFormData({
        date_debut: "",
        date_fin: "",
        motif_absence: "",
        justificatif: null,
        message: "",
      });

      setModalOpen(false);
      fetchAbsences();
    } catch (err) {
      Swal.fire(
        "Erreur",
        err.response?.data?.message || "Impossible d'envoyer",
        "error"
      );
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Supprimer cette demande ?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Oui",
      cancelButtonText: "Non",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${process.env.REACT_APP_API_URL}api/absences/${id}`);
          Swal.fire("Supprimé !", "Demande supprimée", "success");
          fetchAbsences();
        } catch (err) {
          Swal.fire("Erreur", "Impossible de supprimer", "error");
        }
      }
    });
  };

  const truncateMessage = (msg) => {
    if (!msg) return "";
    const words = msg.split(" ");
    if (words.length <= 20) return msg;
    return words.slice(0, 20).join(" ") + " ...";
  };

  const handleViewMessage = (message) => {
    setViewMessage(message);
    setMessageModalOpen(true);
  };

  const closeMessageModal = () => {
    setViewMessage("");
    setMessageModalOpen(false);
  };

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString("fr-FR") : "N/A";

  const columns = [
    { name: "Début", selector: (row) => formatDate(row.date_debut), sortable: true },
    { name: "Fin", selector: (row) => formatDate(row.date_fin), sortable: true },
    { name: "Motif", selector: (row) => row.motif_absence },
    {
      name: "Message",
      cell: (row) => (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
       
          
            <button 
              className="btn-view" 
              onClick={() => handleViewMessage(row.message)}
              title="Voir le message complet"
            >
              <FaEye />
            </button>
          
        </div>
      ),
    },
    { name: "Justificatif",
      cell: (row) =>
      row.justificatif ? (
      <a // <-- Missing opening <a> tag added here
      href={`${process.env.REACT_APP_API_URL}storage/${row.justificatif}`}
      target="_blank"
      rel="noopener noreferrer"
      className="btn-view-file"
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
      <span style={{ color: "red" }}>Aucun</span>
      ),
      },
    { name: "Statut", selector: (row) => row.statut_absence },
    {
      name: "Actions",
      cell: (row) => (
        <button className="btn-delete" onClick={() => handleDelete(row.id_absence)}>
          <FaTrash />
        </button>
      ),
    },
  ];

 const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "justificatif") {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

 const handleMessageChange = (e) => {
    const value = e.target.value;
    const wordCount = value.trim().split(/\s+/).filter(Boolean).length;

    if (wordCount <= 30) {
      setFormData({ ...formData, message: value });
    }
  };

  return (
    <div className="absence-container">
      <h2 className="absence-title">Demandes d'absence</h2>
      <div style={{ width: "100%", maxWidth: "900px" }}>
        <button className="btn-add" onClick={() => setModalOpen(true)}>
          Nouvelle demande
        </button>

        {/* Modal Formulaire */}
        {modalOpen && (
          <div className="modal">
            <div className="modal-content">
              <span className="close" onClick={() => setModalOpen(false)}>
                &times;
              </span>
              <h2>Demande d'absence</h2>

              <form className="absence-form" onSubmit={handleSubmit}>
                <label>Date de début :</label>
                <input type="date" name="date_debut" value={formData.date_debut} onChange={handleChange} required />

                <label>Date de fin :</label>
                <input type="date" name="date_fin" value={formData.date_fin} onChange={handleChange} required />

                <label>Motif :</label>
                <select name="motif_absence" value={formData.motif_absence} onChange={handleChange} required>
                  <option value="">-- Sélectionnez un motif --</option>
                  <option value="Congé">Congé annuel</option>
                  <option value="Maladie">Congé maladie</option>
                  <option value="Permission">Permission exceptionnelle</option>
                  <option value="Congé maternité">Congé maternité</option>
                  <option value="Congé paternité">Congé paternité</option>
                  <option value="Congé pour décès">Congé pour décès</option>
                </select>

                <label>Message :</label>
                <textarea name="message" value={formData.message} onChange={handleMessageChange} />

                <label>Justificatif :</label>
                <input type="file" name="justificatif" onChange={handleChange} />

               <button type="submit" className="absence-btn">
                  Envoyer
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ✅ Modal pour voir le message complet */}
        {messageModalOpen && (
          <div className="modal-overlay" onClick={closeMessageModal}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
              <button className="close-btn" onClick={closeMessageModal}>
                &times;
              </button>
              <h3>Message complet</h3>
              <div className="message-content">
                <p>{viewMessage}</p>
              </div>
            </div>
          </div>
        )}

        <DataTable
          columns={columns}
          data={absences}
          pagination
          highlightOnHover
          striped
          noDataComponent="Aucune absence trouvée."
        />
      </div>
    </div>
  );
}