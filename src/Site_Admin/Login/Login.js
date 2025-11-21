import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "../../StyleCss/login.css";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const res = await axios.post(`${process.env.REACT_APP_API_URL}api/login`, {
      email,
      password,  
    });

    // Stocker les infos de l'utilisateur dans la session
    sessionStorage.setItem("user", JSON.stringify(res.data.user));
    sessionStorage.setItem("token", res.data.token); // si tu utilises un token JWT

   // Swal.fire("Succès", "Connexion réussie", "success");

    // Redirection vers le tableau de bord admin
    navigate("/admin/dashboard");
  } catch (err) {
    if (err.response && err.response.data.message) {
      Swal.fire("Erreur", err.response.data.message, "error");
    } else {
      Swal.fire("Erreur", "Une erreur est survenue", "error");
    }
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
            src="/images/logo/rh_logo.png"
            alt="Logo"
            height="97"
            style={{ borderRadius: "40%" }}
          />
        </div>

        <h1 id="login-title" className="login-title">Connexion Ressources Humaines</h1>

        <form className="login-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input"
          />

          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input"
          />

          <button type="submit" className="btn">Se connecter</button>
        </form>
        </div>
      </div>
    </div>
  );
}
