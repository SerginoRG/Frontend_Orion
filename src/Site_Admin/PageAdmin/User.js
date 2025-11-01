// scr/Site_Admin/PageAdmin/User.js
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import DataTable from "react-data-table-component";
import axios from "axios";
import "../../StyleCss/Crud.css";
import {
  FaEdit,
  FaTrash,
  FaSearch,
  FaPlus,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

export default function User() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [employeId, setEmployeId] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [users, setUsers] = useState([]);
  const [employes, setEmployes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchEmployes();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/utilisateurs");
      setUsers(res.data);
    } catch (error) {
      console.error("Erreur de chargement :", error);
    }
  };

  const fetchEmployes = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/employes");
      setEmployes(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAdd = () => {
    setEditingId(null);
    setUsername("");
    setPassword("");
    setConfirmPassword("");
    setEmployeId("");
    setModalOpen(true);
  };

  const handleEdit = (row) => {
    setEditingId(row.id_utilisateur);
    setUsername(row.nom_utilisateur);
    setEmployeId(row.employe_id);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Êtes-vous sûr ?",
      text: "Cette action est irréversible !",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://127.0.0.1:8000/api/utilisateurs/${id}`);
          Swal.fire("Supprimé !", "Utilisateur supprimé avec succès.", "success");
          fetchUsers();
        } catch (err) {
          Swal.fire("Erreur", "Impossible de supprimer l'utilisateur", "error");
        }
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      Swal.fire("Erreur", "Les mots de passe ne correspondent pas", "error");
      return;
    }

    const payload = {
      nom_utilisateur: username,
      password_utilisateur: password,
      employe_id: employeId,
    };

    try {
      if (editingId) {
        await axios.put(
          `http://127.0.0.1:8000/api/utilisateurs/${editingId}`,
          payload
        );
        Swal.fire("Modifié !", "Utilisateur mis à jour avec succès.", "success");
      } else {
        await axios.post("http://127.0.0.1:8000/api/utilisateurs", payload);
        Swal.fire("Ajouté !", "Utilisateur ajouté avec succès.", "success");
      }
      setModalOpen(false);
      fetchUsers();
    } catch (error) {
      Swal.fire("Erreur", "Vérifiez les données saisies.", "error");
    }
  };

  // ✅ SweetAlert pour changer le statut
  const toggleStatus = (id, currentStatus) => {
    Swal.fire({
      title: "Changer le statut ?",
      text: `Voulez-vous vraiment ${
        currentStatus ? "désactiver" : "activer"
      } cet utilisateur ?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Oui",
      cancelButtonText: "Non",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.put(
            `http://127.0.0.1:8000/api/utilisateurs/${id}/statut`,
            {
              statut_utilisateur: !currentStatus,
            }
          );
          Swal.fire(
            "Succès !",
            `L'utilisateur a été ${
              currentStatus ? "désactivé" : "activé"
            } avec succès.`,
            "success"
          );
          fetchUsers();
        } catch (error) {
          Swal.fire("Erreur", "Impossible de mettre à jour le statut.", "error");
        }
      }
    });
  };

  const filteredUsers = users.filter((usr) =>
    usr.nom_utilisateur.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { name: "Nom utilisateur", selector: (row) => row.nom_utilisateur },
    {
      name: "Employé lié",
      selector: (row) =>
        row.employe
          ? `${row.employe.nom_employe} ${row.employe.prenom_employe}`
          : "—",
    },
    {
      name: "Statut",
      cell: (row) => (
        <input
          type="checkbox"
          checked={row.statut_utilisateur}
          onChange={() => toggleStatus(row.id_utilisateur, row.statut_utilisateur)}
        />
      ),
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="crud-actions-buttons">
          <button className="crud-btn-icon edit" onClick={() => handleEdit(row)}>
            <FaEdit />
          </button>
          <button
            className="crud-btn-icon delete"
            onClick={() => handleDelete(row.id_utilisateur)}
          >
            <FaTrash />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="crud-container">
      <h2 className="crud-table-title">Gestion des Utilisateurs</h2>

      <div className="crud-header">
        <button className="crud-add-btn" onClick={handleAdd}>
          <FaPlus /> Ajouter un utilisateur
        </button>
        <div className="crud-search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Rechercher un utilisateur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredUsers}
        pagination
        highlightOnHover
        striped
        noDataComponent="Aucun utilisateur trouvé."
      />

      {modalOpen && (
        <div className="crud-modal-overlay">
          <div className="crud-modal-content">
            <span className="crud-close-btn" onClick={() => setModalOpen(false)}>
              &times;
            </span>
            <h2>{editingId ? "Modifier un utilisateur" : "Ajouter un utilisateur"}</h2>

            <form onSubmit={handleSubmit} className="crud-form">
              <div className="crud-form-group">
                <label>Employé</label>
                <select
                  value={employeId}
                  onChange={(e) => setEmployeId(e.target.value)}
                  required
                >
                  <option value="">-- Sélectionnez un employé --</option>
                  {employes.map((emp) => (
                    <option key={emp.id_employe} value={emp.id_employe}>
                      {emp.nom_employe} {emp.prenom_employe}
                    </option>
                  ))}
                </select>
              </div>

              <div className="crud-form-group">
                <label>Nom utilisateur</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              {/* Champ mot de passe avec icône œil 👁️ */}
              <div className="crud-form-group password-field">
                <label>Mot de passe</label>
                <div className="password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required={!editingId}
                  />
                  <span
                    className="eye-icon"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ cursor: "pointer", marginLeft: "8px" }}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
              </div>

              {/* Confirmation mot de passe avec œil 👁️ */}
              <div className="crud-form-group password-field">
                <label>Confirmer le mot de passe</label>
                <div className="password-wrapper">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required={!editingId}
                  />
                  <span
                    className="eye-icon"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    style={{ cursor: "pointer", marginLeft: "8px" }}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
              </div>

              <div className="crud-form-actions">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="crud-cancel-btn"
                >
                  Annuler
                </button>
                <button type="submit" className="crud-submit-btn">
                  {editingId ? "Modifier" : "Ajouter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
