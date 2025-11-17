import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "../../StyleCss/Presence.css";
import DataTable from "react-data-table-component";
import { FaFilePdf,FaEye } from "react-icons/fa";


function Historique() {
  const [bulletins, setBulletins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(sessionStorage.getItem("userData"));
    
    if (!userData) {
      setError("Utilisateur non connecté");
      setLoading(false);
      return;
    }

    // Vérifier si id_employe existe directement dans userData
    if (userData.id_employe) {
      // Cas 1: id_employe est directement dans userData
      axios.get(`http://127.0.0.1:8000/api/bulletins/employe/${userData.id_employe}`)
        .then((res) => {
          setBulletins(res.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Erreur lors du chargement des bulletins:", err);
          setError(err.response?.data?.message || "Erreur lors du chargement des bulletins");
          setLoading(false);
          Swal.fire("Erreur", "Impossible de charger les bulletins", "error");
        });
    } else {
      // Cas 2: id_employe doit être récupéré via le profil
      axios.get(`http://127.0.0.1:8000/api/utilisateurs/${userData.id}/profil`)
        .then(res => {
          const employeId = res.data.employe?.id_employe;
          
          if (!employeId) {
            throw new Error("ID employé non trouvé dans le profil");
          }
          
          return axios.get(`http://127.0.0.1:8000/api/bulletins/employe/${employeId}`);
        })
        .then((res) => {
          setBulletins(res.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Erreur lors du chargement:", err);
          setError(err.response?.data?.message || err.message || "Erreur lors du chargement");
          setLoading(false);
          Swal.fire("Erreur", "Impossible de charger les bulletins", "error");
        });
    }
  }, []);

  if (loading) {
    return (
      <div className="container">
        <p>Chargement...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="alert alert-danger">
          <strong>Erreur:</strong> {error}
        </div>
      </div>
    );
  }

  if (bulletins.length === 0) {
    return (
      <div className="container">
        <h2> Historique des bulletins</h2>
        <div className="alert alert-info">
          Aucun bulletin trouvé.
        </div>
      </div>
    );
  }

  const columns = [
  {
    name: "Référence",
    selector: (row) => row.reference_bulletin,
    sortable: true,
  },
  {
    name: "Date",
    selector: (row) =>
      new Date(row.date_generation).toLocaleDateString("fr-FR"),
    sortable: true,
  },
  {
    name: "PDF",
    cell: (row) =>
      row.fichier_pdf ? (
        <a
          href={`http://127.0.0.1:8000/storage/${row.fichier_pdf}`}
          target="_blank"
          rel="noopener noreferrer"
          className="link-download"
           style={{
              color: "#667eea",
              textDecoration: "none",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
        >
           <FaEye /> Voir PDF
        </a>
      ) : (
        <span style={{ color: "red" }}>Aucun fichier</span>
      ),
    ignoreRowClick: true,
  },
  {
    name: "Action",
    cell: (row) => (
      <button
        className="btn-pdf"
        onClick={() =>
          window.open(
            `http://127.0.0.1:8000/api/bulletins/${row.id_bulletin}/pdf`,
            "_blank"
          )
        }
          style={{
              color: "#dc2626",
              backgroundColor: "rgba(220, 38, 38, 0.1)",
              border:"none",
              borderRadius:"20px",
            }}
      >
        <FaFilePdf size={16} /> 
      </button>
    ),
    ignoreRowClick: true,
    width: "160px",
  },
];


  return (
  <div className="container">

    <h2 className="table-title">Historique des bulletins</h2>

    <div className="datatable-container">
      <DataTable
        columns={columns}
        data={bulletins}
        pagination
        highlightOnHover
        pointerOnHover
        responsive
      />
    </div>

  </div>
);

}

export default Historique;