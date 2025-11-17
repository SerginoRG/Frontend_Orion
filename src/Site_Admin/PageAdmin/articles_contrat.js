import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import DataTable from "react-data-table-component";
import axios from "axios";
import "../../StyleCss/Crud.css";
import { FaEdit, FaTrash, FaSearch, FaPlus } from "react-icons/fa";

export default function Article() {
  const [article, setArticle] = useState("");
  const [titre, setTitre] = useState("");
  const [contenu, setContenu] = useState("");
  const [Articles, setArticles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Charger la liste des Articles
  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/articles");
      setArticles(res.data);
    } catch (error) {
      console.error("Erreur de chargement :", error);
    }
  };

  const handleAdd = () => {
    setEditingId(null);
    setArticle("");
    setTitre("");
    setContenu("");
    setModalOpen(true);
  };

  const handleEdit = (row) => {
    setEditingId(row.id_article);
    setArticle(row.article);
    setTitre(row.titre);
    setContenu(row.contenu);
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
          await axios.delete(`http://127.0.0.1:8000/api/articles/${id}`);
          Swal.fire("Supprimé !", "Article supprimé avec succès.", "success");
          fetchArticles();
        } catch (err) {
          Swal.fire("Erreur", "Impossible de supprimer l'article", "error");
        }
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      article: article,
      titre: titre,
      contenu: contenu,
    };

    try {
      if (editingId) {
        await axios.put(`http://127.0.0.1:8000/api/articles/${editingId}`, payload);
        Swal.fire("Modifié !", "Article mis à jour avec succès.", "success");
      } else {
        await axios.post("http://127.0.0.1:8000/api/articles", payload);
        Swal.fire("Ajouté !", "Article ajouté avec succès.", "success");
      }
      setModalOpen(false);
      fetchArticles();
    } catch (error) {
      Swal.fire("Erreur", "Vérifiez les données saisies.", "error");
    }
  };

  const filteredArticle = Articles.filter((art) =>
    art.article.toLowerCase().includes(searchTerm.toLowerCase()) ||
    art.titre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { name: "Article", selector: (row) => row.article, sortable: true },
    { name: "Titre", selector: (row) => row.titre, sortable: true },
    { 
      name: "Contenu", 
      selector: (row) => row.contenu,
      cell: (row) => (
        <div style={{ whiteSpace: "normal", padding: "10px 0" }}>
          {row.contenu.substring(0, 100)}...
        </div>
      ),
      wrap: true
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
            onClick={() => handleDelete(row.id_article)}
          >
            <FaTrash />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="crud-container">
      <h2 className="crud-table-title">Gestion des Articles</h2>

      <div className="crud-header">
        <button className="crud-add-btn" onClick={handleAdd}>
          <FaPlus /> Ajouter un article
        </button>
        <div className="crud-search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Rechercher un Article..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredArticle}
        pagination
        highlightOnHover
        striped
        noDataComponent="Aucun Article trouvé."
      />

      {modalOpen && (
        <div className="crud-modal-overlay">
          <div className="crud-modal-content">
            <span className="crud-close-btn" onClick={() => setModalOpen(false)}>
              &times;
            </span>
            <h2>{editingId ? "Modifier un Article" : "Ajouter un Article"}</h2>

            <form onSubmit={handleSubmit} className="crud-form">
              <div className="crud-form-group">
                <label>Article</label>
                <input
                  type="text"
                  value={article}
                  onChange={(e) => setArticle(e.target.value)}
                  placeholder="Ex: Article 1"
                  required
                />
              </div>

              <div className="crud-form-group">
                <label>Titre</label>
                <input
                  type="text"
                  value={titre}
                  onChange={(e) => setTitre(e.target.value)}
                  placeholder="Ex: Objet du contrat"
                  required
                />
              </div>

              <div className="crud-form-group">
                <label>Contenu</label>
                <textarea
                  value={contenu}
                  onChange={(e) => setContenu(e.target.value)}
                  rows="6"
                  placeholder="Entrez le contenu de l'article..."
                  required
                />
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