import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "../../StyleCss/Absence.css";

export default function Absence() {
  const [formData, setFormData] = useState({
    date_debut: "",
    date_fin: "",
    motif_absence: "",
    justificatif: null,
    message: "", // ✅ ajouté
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: name === "justificatif" ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Récupération des données utilisateur depuis sessionStorage
    const userData = JSON.parse(sessionStorage.getItem("userData"));

    if (!userData || !userData.id_employe) {
      Swal.fire("Erreur", "Utilisateur non connecté ou ID employé manquant", "error");
      return;
    }

    // Préparation du formulaire
    const form = new FormData();
    form.append("date_debut", formData.date_debut);
    form.append("date_fin", formData.date_fin);
    form.append("motif_absence", formData.motif_absence);
    form.append("employe_id", userData.id_employe); // ✅ Utilisation de userData.id
    form.append("message", formData.message); // ✅ ajouté

    if (formData.justificatif) {
      form.append("justificatif", formData.justificatif);
    }

    try {
      const res = await axios.post("http://127.0.0.1:8000/api/absences", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Swal.fire("Succès", res.data.message, "success");

      // Réinitialisation du formulaire
      setFormData({
        date_debut: "",
        date_fin: "",
        motif_absence: "",
        justificatif: null,
          message: "", // ✅ reset
      });
    } catch (error) {
      console.error("Erreur serveur:", error.response?.data);
      Swal.fire(
        "Erreur",
        error.response?.data?.message || "Impossible d'envoyer la demande",
        "error"
      );
    }
  };

  return (
    <div className="absence-container">
      <div className="absence-card">
        <h2 className="absence-title">Demande d’absence</h2>
        <form className="absence-form" onSubmit={handleSubmit}>
          <div>
            <label>Date de début :</label>
            <input
              type="date"
              name="date_debut"
              value={formData.date_debut}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label>Date de fin :</label>
            <input
              type="date"
              name="date_fin"
              value={formData.date_fin}
              onChange={handleChange}
              required
            />
          </div>

          <div>
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
          </div>

          <div>
            <label>Message :</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Ajoutez un message ou une explication..."
            ></textarea>
          </div>


          <div>
            <label>Justificatif (PDF ou image) :</label>
            <input
              type="file"
              name="justificatif"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="absence-btn">
            Envoyer la demande
          </button>
        </form>
      </div>
    </div>
  );
}
