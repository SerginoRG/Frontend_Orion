// src/Site_Admin/PageAdmin/Presence.js
import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import axios from "axios";
import Swal from "sweetalert2";
import "../../StyleCss/Presence.css";

function Presence() {
  const [presences, setPresences] = useState([]);
  const [filteredPresences, setFilteredPresences] = useState([]);
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [searchNom, setSearchNom] = useState("");

  // Mode actuel du filtre : matin ou apresmidi
  const [filterMode, setFilterMode] = useState("matin");
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);

  // Charger les présences
  useEffect(() => {
    fetchPresences();
  }, []);

  const fetchPresences = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/admin/presences");
      setPresences(response.data);
      setFilteredPresences(response.data);
    } catch (error) {
      Swal.fire("Erreur", "Impossible de charger les présences.", "error");
    }
  };

  // Vérifier l'heure pour activer/désactiver le bouton
  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      const totalMinutes = now.getHours() * 60 + now.getMinutes();

      const matinStart = 12 * 60;
      const matinEnd = matinStart + 30;

      const apremStart = 18 * 60;
      const apremEnd = apremStart + 30;

      if (filterMode === "matin") {
        setIsButtonEnabled(totalMinutes >= matinStart && totalMinutes <= matinEnd);
      } else {
        setIsButtonEnabled(totalMinutes >= apremStart && totalMinutes <= apremEnd);
      }
    };

    checkTime();
    const timer = setInterval(checkTime, 1000);
    return () => clearInterval(timer);
  }, [filterMode]);

  // Action lors du clic
  const handleToggleFilter = async () => {
    const periode = filterMode;

    try {
      await axios.post(`http://127.0.0.1:8000/api/admin/marquer-absents/${periode}`);
      fetchPresences();
      Swal.fire("Succès", "Les absents ont été enregistrés.", "success");
    } catch (error) {
      Swal.fire("Erreur", "Impossible d’enregistrer les absents.", "error");
    }

    // Alterner le mode
    setFilterMode(prev => (prev === "matin" ? "apresmidi" : "matin"));
  };

  // Recherche nom en direct
  useEffect(() => {
    const result = presences.filter((p) =>
      p.employe &&
      `${p.employe.nom_employe} ${p.employe.prenom_employe}`.toLowerCase().includes(searchNom.toLowerCase())
    );
    setFilteredPresences(result);
  }, [searchNom, presences]);

  // Filtrer par dates
  const handleFiltrerParDate = () => {
    if (!dateDebut || !dateFin) {
      Swal.fire("Attention", "Veuillez sélectionner deux dates.", "warning");
      return;
    }

    const result = presences.filter((p) => {
      const date = new Date(p.date_presence);
      return date >= new Date(dateDebut) && date <= new Date(dateFin);
    });

    if (result.length === 0) {
      Swal.fire("Aucun résultat", "Aucune présence trouvée.", "info");
    }
    setFilteredPresences(result);
  };

  const handleResetDates = () => {
    setDateDebut("");
    setDateFin("");
    setFilteredPresences(presences);
  };

  const colonnes = [
    { name: "Date", selector: (row) => row.date_presence, sortable: true },
    { name: "Heure Arrivée", selector: (row) => row.heure_arrivee || "—", center: true },
    { name: "Heure Départ", selector: (row) => row.heure_depart || "—", center: true },
    { name: "Statut", selector: (row) => row.statut_presence || "—", center: true },
    {
      name: "Employé",
      selector: (row) =>
        row.employe ? `${row.employe.nom_employe} ${row.employe.prenom_employe}` : "—",
      sortable: true,
    },
  ];

  return (
    <div className="presence-container">
      <h1>Gestion des Présences</h1>

      <button
        onClick={handleToggleFilter}
        disabled={!isButtonEnabled}
        className={`btn-filtrer-periode ${!isButtonEnabled ? "disabled" : ""}`}
      >
        {filterMode === "matin"
          ? "Filtrer Absents Matin"
          : "Filtrer Absents Après-midi"}
      </button>

      <div className="filtre-nom">
        <input
          type="text"
          placeholder="Rechercher un employé..."
          value={searchNom}
          onChange={(e) => setSearchNom(e.target.value)}
        />
      </div>

      <div className="filtre-dates">
        <label>Du : </label>
        <input type="date" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} />
        <label>Au : </label>
        <input type="date" value={dateFin} onChange={(e) => setDateFin(e.target.value)} />
        <button onClick={handleFiltrerParDate} className="btn-filtrer">Rechercher</button>
        <button onClick={handleResetDates} className="btn-reset">Réinitialiser</button>
      </div>

      <DataTable
        columns={colonnes}
        data={filteredPresences}
        pagination
        highlightOnHover
        fixedHeader
        fixedHeaderScrollHeight="400px"
        noHeader
      />
    </div>
  );
}

export default Presence;
