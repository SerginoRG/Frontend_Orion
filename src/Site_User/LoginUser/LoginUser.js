// scr/Site_User/LoginUser/LoginUser
import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "../../StyleCss/Login.css";
import { useNavigate } from "react-router-dom";

export default function LoginUser() {
  const [nomUtilisateur, setNomUtilisateur] = useState("");
  const [passwordUtilisateur, setPasswordUtilisateur] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await axios.post("http://127.0.0.1:8000/api/utilisateurslogin", {
        nomUtilisateur,
        passwordUtilisateur,
      });

      console.log("=== RÉPONSE LOGIN ===");
      console.log("Données reçues:", res.data);
      console.log("Utilisateur:", res.data.utilisateur);
      console.log("ID Employé:", res.data.utilisateur?.id_employe);
      console.log("====================");

      // Vérifier que l'id_employe est bien présent
      if (!res.data.utilisateur?.id_employe) {
        Swal.fire({
          icon: "error",
          title: "Erreur de configuration",
          text: "Votre compte n'est pas correctement associé à un employé. Contactez l'administrateur.",
        });
        setIsLoading(false);
        return;
      }

      // ✅ Stocker les données utilisateur dans sessionStorage
      sessionStorage.setItem("userData", JSON.stringify(res.data.utilisateur));

      // Afficher un message de succès
      await Swal.fire({
        icon: "success",
        title: "Connexion réussie",
        text: `Bienvenue ${res.data.utilisateur.prenom || res.data.utilisateur.nom_utilisateur} !`,
        timer: 1500,
        showConfirmButton: false
      });

      // Redirection vers le dashboard
      navigate("/user/dashboard");
    } catch (err) {
      console.error("Erreur de connexion:", err);
      
      Swal.fire(
        "Erreur",
        err.response?.data?.message || "Une erreur est survenue lors de la connexion",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-root">
      <div className="login-card">
        <div className="logo-box">
          <img
            src="/images/logo/logo_orion.jpg"
            alt="Logo"
            height="70"
            style={{ borderRadius: "40%" }}
          />
        </div>

        <h1 className="login-title">Connexion Utilisateur</h1>

        <form className="login-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nom utilisateur"
            value={nomUtilisateur}
            onChange={(e) => setNomUtilisateur(e.target.value)}
            required
            className="input"
            disabled={isLoading}
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={passwordUtilisateur}
            onChange={(e) => setPasswordUtilisateur(e.target.value)}
            required
            className="input"
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className="btn"
            disabled={isLoading}
          >
            {isLoading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}