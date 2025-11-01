import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "../../StyleCss/Login.css";
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

     // Swal.fire("Succès", res.data.message, "success");
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
    <div className="login-root">
      <div className="login-card" role="main" aria-labelledby="login-title">
        <div className="logo-box">
          <img
            src="/images/logo/logo_orion.jpg"
            alt="Logo"
            height="70"
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
  );
}
