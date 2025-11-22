import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import axios from "axios";
import Swal from "sweetalert2";
import "../../StyleCss/PresenceAdmin.css";

function Presence() {
  const [presences, setPresences] = useState([]);
  const [filteredPresences, setFilteredPresences] = useState([]);
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [searchNom, setSearchNom] = useState("");
  const [isButtonActive, setIsButtonActive] = useState(false);

  // ✅ Déterminer la période selon l'heure actuelle
  const getCurrentPeriode = () => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    // 12h00-13h00 (720-780 minutes) → période matin
    const isInMorningSlot = currentTime >= 720 && currentTime < 780;
    
    // 18h00-19h00 (1080-1140 minutes) → période après-midi
    const isInAfternoonSlot = currentTime >= 1080 && currentTime < 1140;
    
    if (isInMorningSlot) return "matin";
    if (isInAfternoonSlot) return "apresmidi";
    
    // Hors plage horaire : déterminer la prochaine période
    if (currentTime < 720) return "matin"; // Avant 12h → prochaine = matin
    if (currentTime >= 780 && currentTime < 1080) return "apresmidi"; // Entre 13h et 18h → prochaine = après-midi
    return "matin"; // Après 19h → prochaine = matin (lendemain)
  };

  const [filterMode, setFilterMode] = useState(getCurrentPeriode);

  // ✅ Charger les présences - moved inside useEffect
  useEffect(() => {
    const fetchPresences = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}api/admin/presences`);
        setPresences(response.data);
        
        // Apply filters inline to avoid dependency issues
        let result = [...response.data];
        if (searchNom.trim()) {
          result = result.filter((p) =>
            p.employe &&
            `${p.employe.nom_employe} ${p.employe.prenom_employe}`
              .toLowerCase()
              .includes(searchNom.toLowerCase())
          );
        }
        setFilteredPresences(result);
      } catch (error) {
        Swal.fire("Erreur", "Impossible de charger les présences.", "error");
      }
    };

    fetchPresences();
  }, []);

  // ✅ Filtrage global
  const applyFilters = (data) => {
    let result = [...data];

    if (dateDebut && dateFin) {
      result = result.filter((p) => {
        const date = new Date(p.date_presence);
        return date >= new Date(dateDebut) && date <= new Date(dateFin);
      });
    }

    if (searchNom.trim()) {
      result = result.filter((p) =>
        p.employe &&
        `${p.employe.nom_employe} ${p.employe.prenom_employe}`
          .toLowerCase()
          .includes(searchNom.toLowerCase())
      );
    }

    setFilteredPresences(result);
  };

  // ✅ Activation bouton selon les plages horaires
  useEffect(() => {
    const checkButtonAvailability = () => {
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();

      const isInMorningSlot = currentTime >= 720 && currentTime < 780;
      const isInAfternoonSlot = currentTime >= 1080 && currentTime < 1140;

      let periode = "";
      if (isInMorningSlot) {
        periode = "matin";
      } else if (isInAfternoonSlot) {
        periode = "apresmidi";
      } else {
        periode = getCurrentPeriode();
      }

      // ✅ Vérifier si la période a déjà été marquée
      const isMarked = sessionStorage.getItem(`presenceMarked_${periode}`) === "true";

      // Activer le bouton seulement si c'est la plage horaire ET non marqué
      setIsButtonActive((isInMorningSlot || isInAfternoonSlot) && !isMarked);
      setFilterMode(periode);
    };

    checkButtonAvailability();
    const interval = setInterval(checkButtonAvailability, 30000); // mise à jour toutes les 30s
    return () => clearInterval(interval);
  }, []);

  // ✅ Apply filters when searchNom or presences change
  useEffect(() => {
    applyFilters(presences);
  }, [searchNom, presences, dateDebut, dateFin]);

  // ✅ Marquer les absents
  const handleToggleFilter = async () => {
    if (!isButtonActive) {
      Swal.fire(
        "Action non disponible",
        "Le bouton est disponible uniquement de 12h-13h (matin) et 18h-19h (après-midi).",
        "warning"
      );
      return;
    }

    const periode = filterMode;

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}api/admin/marquer-absents/${periode}`
      );

      Swal.fire(
        "Succès",
        `${response.data.nombre_absents} absent(s) enregistré(s) pour : ${periode}`,
        "success"
      );

      // ✅ Désactiver le bouton après clic
      setIsButtonActive(false);

      // ✅ Sauvegarder en sessionStorage
      sessionStorage.setItem(`presenceMarked_${periode}`, "true");

      // Reload presences
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}api/admin/presences`);
        setPresences(res.data);
      } catch (error) {
        console.error("Erreur lors du rechargement des présences:", error);
      }
    } catch (error) {
      Swal.fire(
        "Erreur",
        error.response?.data?.message || "Impossible d'enregistrer les absents.",
        "error"
      );
    }
  };

  const handleFiltrerParDate = () => {
    if (!dateDebut || !dateFin) {
      Swal.fire("Attention", "Veuillez sélectionner deux dates.", "warning");
      return;
    }

    applyFilters(presences);

    if (filteredPresences.length === 0) {
      Swal.fire("Aucun résultat", "Aucune présence trouvée.", "info");
    }
  };

  const handleResetDates = () => {
    setDateDebut("");
    setDateFin("");
    applyFilters(presences);
  };

  // ✅ Fonction pour enrichir les données avec période et heures effectuées
  const enrichPresencesData = (data) => {
    return data.map((item) => {
      const arrivalHour = parseInt(item.heure_arrivee?.split(":")[0]);

      let heuresEffectuees = 0;

      // ✅ Vérifier que les deux heures existent et sont valides
      if (
        item.heure_arrivee &&
        item.heure_depart &&
        item.heure_arrivee.includes(":") &&
        item.heure_depart.includes(":")
      ) {
        const [arrH, arrM] = item.heure_arrivee.split(":").map(Number);
        const [depH, depM] = item.heure_depart.split(":").map(Number);

        // Calcul de la différence en minutes puis conversion en heures
        const diff = (depH * 60 + depM) - (arrH * 60 + arrM);
        if (!isNaN(diff) && diff > 0) {
          heuresEffectuees = diff / 60;
        }
      }

      // Conversion en format lisible
      const hours = Math.floor(heuresEffectuees);
      const minutes = Math.round((heuresEffectuees - hours) * 60);
      const heuresFormat = heuresEffectuees > 0 ? `${hours}h ${minutes.toString().padStart(2, '0')}min` : "—";

      return {
        ...item,
      // ✅ Utiliser la période depuis la base si elle existe
      periode: item.periode || (parseInt(item.heure_arrivee?.split(":")[0]) >= 14 ? "apresmidi" : "matin"),
      heuresEffectuees: heuresEffectuees.toFixed(2),
      heuresEffectueesFormat: heuresFormat
      };
    });
  };

  // ✅ Enrichir les données filtrées
  const enrichedPresences = enrichPresencesData(filteredPresences);

  const formatDate = (date) => (date ? new Date(date).toLocaleDateString('fr-FR') : "N/A");

  const colonnes = [
    { name: "Date", selector: (row) => formatDate(row.date_presence), sortable: true },
    { name: "Heure Arrivée", selector: (row) => row.heure_arrivee || "—", center: true },
    { name: "Heure Départ", selector: (row) => row.heure_depart || "—", center: true },
    { 
      name: "Période", 
      selector: (row) => {
        if (!row.periode) return "—";
        return row.periode.toLowerCase() === "matin" ? "Matin" : "Après-midi";
      }, 
      center: true 
    },
    { name: "Heures effectuées", selector: (row) => row.heuresEffectueesFormat || "—", center: true },
    {
      name: "Statut",
      selector: (row) => row.statut_presence || "—",
      center: true,
      cell: (row) => {
        const cls = row.statut_presence
          ? row.statut_presence.toLowerCase().trim().replace(/\s+/g, "-")
          : "inconnu";

        return (
          <span className={`statut-badge ${cls}`}>
            {row.statut_presence || "—"}
          </span>
        );
      }
    },
    {
      name: "Employé",
      selector: (row) =>
        row.employe ? `${row.employe.nom_employe} ${row.employe.prenom_employe}` : "—",
      sortable: true,
    },
  ];

  // ✅ Calcul du total des heures
  const totalHeures = enrichedPresences.reduce((sum, item) => sum + parseFloat(item.heuresEffectuees || 0), 0);

  // Conversion du total en format lisible
  const totalHours = Math.floor(totalHeures);
  const totalMinutes = Math.round((totalHeures - totalHours) * 60);
  const totalFormat = `${totalHours}h ${totalMinutes.toString().padStart(2, '0')}min`;

  return (
    <div className="presence-container-admin">
      <h1>Gestion des Présences</h1>

      <div style={{ marginBottom: '20px', textAlign: "center" }}>
       <button
          onClick={handleToggleFilter}
          className="btn-filtrer-periode-admin"
          disabled={!isButtonActive}
          style={{
            backgroundColor: !isButtonActive
              ? "#9E9E9E" 
              : (filterMode === "matin" ? "#4CAF50" : "#2196F3"),
            cursor: !isButtonActive ? "not-allowed" : "pointer",
            opacity: !isButtonActive ? 0.6 : 1,
          }}
        >
          {filterMode === "matin" 
            ? "Marquer Absents Matin" 
            : "Marquer Absents Après-midi"}
        </button>

        <div style={{ marginTop: '8px', fontSize: '0.9em', color: !isButtonActive ? '#666' : '#000' }}>
          <strong>Période actuelle :</strong> {filterMode === "matin" ? "Matin (12h-13h)" : "Après-midi (18h-19h)"}
          <br />
          <strong>État :</strong> {isButtonActive ? "✓ Disponible" : "✗ Hors plage horaire"}
        </div>
      </div>

      {/* Recherche employé */}
      <div className="filtre-nom-admin">
        <input
          type="text"
          placeholder=" Rechercher un employé..."
          value={searchNom}
          onChange={(e) => setSearchNom(e.target.value)}
        />
      </div>

      {/* Filtre par dates */}
      <div className="filtre-dates-admin">
        <label>Du : </label>
        <input type="date" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} />
        <label>Au : </label>
        <input type="date" value={dateFin} onChange={(e) => setDateFin(e.target.value)} />

        <button onClick={handleFiltrerParDate} className="btn-filtrer-admin">
          Rechercher
        </button>

        <button onClick={handleResetDates} className="btn-reset-admin">
          Réinitialiser
        </button>
      </div>

      <DataTable
        columns={colonnes}
        data={enrichedPresences}
        pagination
        paginationPerPage={5}
        paginationRowsPerPageOptions={[5, 10, 15, 20]}
        highlightOnHover
        fixedHeader
        fixedHeaderScrollHeight="400px"
        noHeader
        noDataComponent="Aucune présence trouvée."
      />

      <div style={{ marginTop: "15px", textAlign: "center", fontWeight: "bold" }}>
        Total des heures effectuées : {totalFormat}
      </div>
    </div>
  );
}

export default Presence;