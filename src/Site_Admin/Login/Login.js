import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "../../StyleCss/login.css";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const res = await axios.post("http://127.0.0.1:8000/api/login", {
      email,
      password,  
    });

    // Stocker les infos de l'utilisateur dans la session
    sessionStorage.setItem("user", JSON.stringify(res.data.user));
    sessionStorage.setItem("token", res.data.token); // si tu utilises un token JWT

    Swal.fire("Succès", "Connexion réussie", "success");

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


  return (
    <div className="login-container">

      {/* --- IMAGE À GAUCHE --- */}
      <div className="login-image"></div>

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
