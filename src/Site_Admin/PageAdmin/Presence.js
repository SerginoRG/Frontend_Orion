// src/Site_Admin\PageAdmin\Presence.js
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

  const [filterMode, setFilterMode] = useState("matin");
const [isButtonEnabled, setIsButtonEnabled] = useState(false);


  // Charger toutes les présences
  useEffect(() => {
    fetchPresences();
  }, []);

  useEffect(() => {
  const checkTime = () => {
    const now = new Date();
    const total = now.getHours() * 60 + now.getMinutes();

    const matinStart = 12 * 60;
    const matinEnd = matinStart + 30;

    const apremStart = 18 * 60;
    const apremEnd = apremStart + 30;

    if (filterMode === "matin") {
      setIsButtonEnabled(total >= matinStart && total <= matinEnd);
    } else {
      setIsButtonEnabled(total >= apremStart && total <= apremEnd);
    }
  };

  checkTime();
  const timer = setInterval(checkTime, 1000);
  return () => clearInterval(timer);
}, [filterMode]);

const filterMorningAbsences = () => {
  setFilteredPresences(
    presences.filter(p => p.heure_arrivee < "08:00" || p.heure_arrivee > "12:00")
  );
};

const filterAfternoonAbsences = () => {
  setFilteredPresences(
    presences.filter(p => p.heure_arrivee < "15:00" || p.heure_arrivee > "18:00")
  );
};

const handleToggleFilter = async () => {
  const periode = filterMode === "matin" ? "matin" : "apresmidi";

  try {
    // On déclenche l’enregistrement des absents
    await axios.post(`http://127.0.0.1:8000/api/admin/marquer-absents/${periode}`);

    // On recharge la liste des présences
    fetchPresences();
    Swal.fire("Succès", "Les absents ont été enregistrés automatiquement.", "success");

  } catch (error) {
    Swal.fire("Erreur", "Impossible de marquer les absents.", "error");
  }

  // Alterner le mode
  setFilterMode(prev => (prev === "matin" ? "apresmidi" : "matin"));
};

useEffect(() => {
  const checkTime = () => {
    const now = new Date();
    const total = now.getHours() * 60 + now.getMinutes();

    // 12h00 → 12h30
    const matinStart = 12 * 60;
    const matinEnd = matinStart + 30;

    // 18h00 → 18h30
    const apremStart = 18 * 60;
    const apremEnd = apremStart + 30;

    if (filterMode === "matin") {
      setIsButtonEnabled(total >= matinStart && total <= matinEnd);
    } else {
      setIsButtonEnabled(total >= apremStart && total <= apremEnd);
    }
  };

  checkTime();
  const timer = setInterval(checkTime, 1000);
  return () => clearInterval(timer);
}, [filterMode]);



  const fetchPresences = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/admin/presences");
      setPresences(response.data);
      setFilteredPresences(response.data);
    } catch (error) {
      console.error("Erreur fetch presences:", error);
      Swal.fire("Erreur", "Impossible de charger les présences.", "error");
    }
  };

  // 🔹 Recherche instantanée par nom d’employé
  useEffect(() => {
    const result = presences.filter((p) =>
      p.employe &&
      `${p.employe.nom_employe} ${p.employe.prenom_employe}`
        .toLowerCase()
        .includes(searchNom.toLowerCase())
    );
    setFilteredPresences(result);
  }, [searchNom, presences]);

  // 🔹 Filtrer uniquement par période (dates)
  const handleFiltrerParDate = () => {
    if (!dateDebut || !dateFin) {
      Swal.fire("Attention", "Veuillez sélectionner les deux dates.", "warning");
      return;
    }

    const result = presences.filter((p) => {
      const date = new Date(p.date_presence);
      return date >= new Date(dateDebut) && date <= new Date(dateFin);
    });

    if (result.length === 0) {
      Swal.fire("Aucun résultat", "Aucune présence trouvée pour cette période.", "info");
    }

    setFilteredPresences(result);
  };

  // 🔹 Réinitialiser le filtre de date
  const handleResetDates = () => {
    setDateDebut("");
    setDateFin("");
    setFilteredPresences(presences);
  };

  // Colonnes du tableau
  const colonnes = [
    { name: "Date", selector: (row) => row.date_presence, sortable: true },
    { name: "Heure Arrivée", selector: (row) => row.heure_arrivee || "—", center: true },
    { name: "Heure Départ", selector: (row) => row.heure_depart || "—", center: true },
    { name: "Statut", selector: (row) => row.statut_presence || "—", center: true },
    {
      name: "Employé",
      selector: (row) =>
        row.employe
          ? `${row.employe.nom_employe} ${row.employe.prenom_employe}`
          : "—",
      sortable: true,
    },
  ];

  return (
    <div className="presence-container">
      <h1>Gestion des Présences</h1>
      <p>Recherchez une présence par nom ou par période.</p>

     <button
        onClick={handleToggleFilter}
        disabled={!isButtonEnabled}
        className={`btn-filtrer-periode ${!isButtonEnabled ? "disabled" : ""}`}
      >
        {filterMode === "matin"
          ? "Filtrer Absents Matin (12h00 - 12h30)"
          : "Filtrer Absents Après-midi (18h00 - 18h30)"}
      </button>



      {/* 🔍 Recherche par nom d’employé */}
      <div className="filtre-nom">
        <input
          type="text"
          placeholder="Rechercher un employé..."
          value={searchNom}
          onChange={(e) => setSearchNom(e.target.value)}
        />
      </div>

      {/* 📅 Filtre par période */}
      <div className="filtre-dates">
        <label>Du : </label>
        <input
          type="date"
          value={dateDebut}
          onChange={(e) => setDateDebut(e.target.value)}
        />
        <label>Au : </label>
        <input
          type="date"
          value={dateFin}
          onChange={(e) => setDateFin(e.target.value)}
        />
        <button onClick={handleFiltrerParDate} className="btn-filtrer">
          Rechercher par période
        </button>
        <button onClick={handleResetDates} className="btn-reset">
          Réinitialiser
        </button>
      </div>

      {/* Tableau */}
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
