import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "../../StyleCss/login.css";
import { useNavigate } from "react-router-dom";

export default function LoginUser() {
  const [nomUtilisateur, setNomUtilisateur] = useState("");
  const [passwordUtilisateur, setPasswordUtilisateur] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
   const [index, setIndex] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}api/utilisateurslogin`, {
        nomUtilisateur,
        passwordUtilisateur,
      });

      if (!res.data.utilisateur?.id_employe) {
        Swal.fire({
          icon: "error",
          title: "Erreur",
          text: "Compte sans employé associé.",
        });
        setIsLoading(false);
        return;
      }

      sessionStorage.setItem("userData", JSON.stringify(res.data.utilisateur));
      navigate("/user/dashboard");
    } catch (err) {
      Swal.fire("Erreur", err.response?.data?.message || "Erreur inconnue", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const images = [
  "/images/logo/GRH.jpg",
  "/images/logo/gestion.jpeg",
  "/images/logo/sary.avif"
];

 // Changer d’image toutes les 2 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval); // Nettoyage
  }, []);

  const backgroundImage = images[index];

  return (
    <div className="login-container">
      {/* --- IMAGE À GAUCHE --- */}
    <div
        className="login-image"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      ></div>


      {/* --- FORMULAIRE À DROITE --- */}
      <div className="login-right">
        <div className="login-card">
       <div className="logo-box">
          <img
            src="logo_projet.png"
            alt="Logo"
            height="97"
            style={{ borderRadius: "40%" }}
          />
        </div>
          <h1 className="login-title">Connexion Employé</h1>

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

            <button type="submit" className="btn" disabled={isLoading}>
              {isLoading ? "Connexion..." : "Se connecter"}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
