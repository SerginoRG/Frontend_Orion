import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../StyleCss/Profil.css";

function Profil() {
  const [profil, setProfil] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = JSON.parse(sessionStorage.getItem("userData"));
    if (!userData) return;

    axios
      .get(`http://127.0.0.1:8000/api/utilisateurs/${userData.id}/profil`)
      .then((res) => {
        setProfil(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur chargement profil :", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Chargement du profil...</p>;

  if (!profil) return <p>Aucune donnée de profil trouvée.</p>;

  return (
    <div className="profil-container">
      <div className="profil-header">
        <img
          src={profil.photo || "/images/avatar.png"}
          alt="Profil"
          className="profil-photo"
        />
        <h2>Bienvenue {profil.employe.nom} {profil.employe.prenom}</h2>
        <p>{profil.employe.poste}</p>
      </div>

      <div className="profil-info">
        <h3>Informations personnelles</h3>
        <table className="profil-table">
          <tbody>
            <tr>
              <td><strong>Matricule :</strong></td>
              <td>{profil.employe.matricule}</td>
            </tr>
            <tr>
              <td><strong>Nom :</strong></td>
              <td>{profil.employe.nom}</td>
            </tr>
            <tr>
              <td><strong>Prénom :</strong></td>
              <td>{profil.employe.prenom}</td>
            </tr>
            <tr>
              <td><strong>Poste :</strong></td>
              <td>{profil.employe.poste}</td>
            </tr>
            <tr>
              <td><strong>Service :</strong></td>
              <td>{profil.employe.service}</td>
            </tr>
            <tr>
              <td><strong>Date d’embauche :</strong></td>
              <td>{new Date(profil.employe.date_embauche).toLocaleDateString("fr-FR")}</td>
            </tr>
             <tr>
      <td><strong>Jours restants :</strong></td>
      <td><b style={{ color: "green" }}>{profil.solde_conge.jours_restants} jours</b></td>
    </tr>
            <tr>
              <td><strong>Salaire de base :</strong></td>
              <td>{profil.employe.salaire_base} Ar</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Profil;
