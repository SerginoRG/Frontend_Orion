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
  const [viewMessage, setViewMessage] = useState(""); // modal message complet

  const userData = JSON.parse(sessionStorage.getItem("userData"));

  useEffect(() => {
    if (userData?.id_employe) {
      fetchAbsences();
    }
  }, []);

  const fetchAbsences = async () => {
    try {
      const res = await axios.get(
        `http://127.0.0.1:8000/api/absences/employe/${userData.id_employe}`
      );
      setAbsences(res.data);
    } catch (err) {
      console.error("Erreur lors de la récupération des absences :", err);
    }
  };

  // Gestion des champs du formulaire
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "message") {
      // Limiter à 20 mots
      const words = value.trim().split(/\s+/);
      if (words.length > 20) {
        setFormData({
          ...formData,
          [name]: words.slice(0, 20).join(" "),
        });
        return;
      }
    }

    setFormData({
      ...formData,
      [name]: name === "justificatif" ? files[0] : value,
    });
  };

  // Soumission formulaire
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
      await axios.post("http://127.0.0.1:8000/api/absences", form, {
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

  // Suppression d'une absence
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
          await axios.delete(`http://127.0.0.1:8000/api/absences/${id}`);
          Swal.fire("Supprimé !", "Demande supprimée", "success");
          fetchAbsences();
        } catch (err) {
          Swal.fire("Erreur", "Impossible de supprimer", "error");
        }
      }
    });
  };

  // Tronquer le message à 20 mots pour le tableau
  const truncateMessage = (msg) => {
    if (!msg) return "";
    const words = msg.split(" ");
    if (words.length <= 20) return msg;
    return words.slice(0, 20).join(" ") + " ...";
  };
const formatDate = (date) => (date ? new Date(date).toLocaleDateString('fr-FR') : "N/A");

  const columns = [
    { name: "Début", selector: (row) =>  formatDate(row.date_debut), sortable: true },
    { name: "Fin", selector: (row) =>  formatDate(row.date_fin), sortable: true },
    { name: "Motif", selector: (row) => row.motif_absence },
    {
      name: "Message",
      cell: (row) => (
        <>
          {truncateMessage(row.message)}
          {row.message && row.message.split(" ").length > 20 && (
            <button
              className="btn-view"
              onClick={() => setViewMessage(row.message)}
              style={{ marginLeft: "8px" }}
            >
              <FaEye />
            </button>
          )}
        </>
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

  return (
    <div className="absence-container">
      <div style={{ width: "100%", maxWidth: "900px" }}>
        <button className="btn-add" onClick={() => setModalOpen(true)}>
          Nouvelle demande
        </button>

        {/* Modal formulaire */}
        {modalOpen && (
          <div className="modal">
            <div className="modal-content">
              <span className="close" onClick={() => setModalOpen(false)}>
                &times;
              </span>
              <h2>Demande d’absence</h2>
              <form className="absence-form" onSubmit={handleSubmit}>
                <label>Date de début :</label>
                <input
                  type="date"
                  name="date_debut"
                  value={formData.date_debut}
                  onChange={handleChange}
                  required
                />

                <label>Date de fin :</label>
                <input
                  type="date"
                  name="date_fin"
                  value={formData.date_fin}
                  onChange={handleChange}
                  required
                />

                <label>Motif :</label>
                <select
                  name="motif_absence"
                  value={formData.motif_absence}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Sélectionnez un motif --</option>
                  <option value="Congé">Congé</option>
                  <option value="Maladie">Maladie</option>
                  <option value="Permission">Permission</option>
                  <option value="Autre">Autre</option>
                </select>

                <label>Message :</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Ajoutez un message ou une explication..."
                />

                <label>Justificatif :</label>
                <input type="file" name="justificatif" onChange={handleChange} />

                <button type="submit" className="absence-btn">
                  Envoyer
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Modal pour voir le message complet */}
        {viewMessage && (
          <div className="modal">
            <div className="modal-content">
              <span className="close" onClick={() => setViewMessage("")}>
                &times;
              </span>
              <h3>Message complet</h3>
              <p>{viewMessage}</p>
            </div>
          </div>
        )}

        {/* DataTable */}
        <DataTable
          columns={columns}
          data={absences}
          pagination
          paginationPerPage={5}
          paginationRowsPerPageOptions={[5, 10, 15]}
          highlightOnHover
          striped
          responsive
          noDataComponent="Aucun enregistrement trouvé."
        />
      </div>
    </div>
  );
}
