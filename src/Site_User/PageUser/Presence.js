import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import DataTable from "react-data-table-component";
import "../../StyleCss/Presence.css";

function Presence() {
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [filteredHistorique, setFilteredHistorique] = useState([]);
  const [historique, setHistorique] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPeriodType, setCurrentPeriodType] = useState(null);
  const [isButtonDisabledTemp, setIsButtonDisabledTemp] = useState(false);
  
  const userData = JSON.parse(sessionStorage.getItem("userData"));
  const employeId = userData?.id_employe || userData?.employe_id;

  useEffect(() => {
    if (!employeId || employeId === "undefined" || employeId === "null") {
      Swal.fire({
        icon: "error",
        title: "Erreur de session",
        html: "Impossible de récupérer votre identifiant employé.<br/>Veuillez vous reconnecter.",
        confirmButtonText: "OK",
        allowOutsideClick: false,
      }).then(() => {
        sessionStorage.clear();
        window.location.href = "/";
      });
    }
  }, [employeId]);

  const fetchHistorique = async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}api/presence/historique/${employeId}`
      );
      const historiqueWithPeriod = res.data.map((item) => {
  const arrivalHour = parseInt(item.heure_arrivee?.split(":")[0]);
  // const arrivalMin = parseInt(item.heure_arrivee?.split(":")[1]) || 0;
  // const departHour = parseInt(item.heure_depart?.split(":")[0]);
  // const departMin = parseInt(item.heure_depart?.split(":")[1]) || 0;

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
          periode: arrivalHour >= 14 ? "apresmidi" : "matin",
          heuresEffectuees: heuresEffectuees.toFixed(2), // valeur numérique pour le total
          heuresEffectueesFormat: heuresFormat // format lisible pour l'affichage
        };
      });

      setHistorique(historiqueWithPeriod);
      setFilteredHistorique(historiqueWithPeriod);
    } catch (err) {
      console.error("Erreur lors du chargement de l'historique :", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (employeId) {
      fetchHistorique();
    }
  }, [employeId]);

  // ✅ Détermination de la période active
  useEffect(() => {
    const checkCurrentPeriod = () => {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      
      const periods = {
        'arrivee-matin': [8 * 60, 10 * 60 + 30],   
        'depart-matin': [11 * 60 + 55, 12 * 60 + 30],
        'arrivee-apresmidi': [15 * 60, 16 * 60 + 30],
        'depart-apresmidi': [17 * 60 + 55, 18 * 60 + 30],
      };

      let activePeriod = null;
      for (const [periodName, [start, end]] of Object.entries(periods)) {
        if (currentMinutes >= start && currentMinutes <= end) {
          activePeriod = periodName;
          break;
        }
      }

      setCurrentPeriodType(activePeriod);
    };

    checkCurrentPeriod();
    const interval = setInterval(checkCurrentPeriod, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleArrivee = async () => {
    if (!currentPeriodType || !currentPeriodType.startsWith('arrivee')) {
      Swal.fire(
        "⏰ Hors plage horaire",
        "Vous pouvez enregistrer votre arrivée uniquement entre :<br><strong>07h30-08h30</strong> (matin) ou <strong>14h30-15h30</strong> (après-midi).",
        "warning"
      );
      return;
    }

    if (!employeId) {
      Swal.fire("Erreur", "Identifiant employé introuvable.", "error");
      return;
    }

    try {
      setIsButtonDisabledTemp(true);
      await axios.post(`${process.env.REACT_APP_API_URL}api/presence/arrivee`, {
        employe_id: employeId,
      });

      Swal.fire("✅", "Arrivée enregistrée avec succès !", "success");
      fetchHistorique();

      setTimeout(() => setIsButtonDisabledTemp(false), 3000);
    } catch (err) {
      setIsButtonDisabledTemp(false);
      Swal.fire("⚠️", err.response?.data?.message || "Erreur serveur", "warning");
    }
  };

  const handleDepart = async () => {
    if (!currentPeriodType || !currentPeriodType.startsWith('depart')) {
      Swal.fire(
        "⏰ Hors plage horaire",
        "Vous pouvez enregistrer votre départ uniquement entre :<br><strong>11h45-12h30</strong> (matin) ou <strong>17h45-18h30</strong> (après-midi).",
        "warning"
      );
      return;
    }

    try {
      setIsButtonDisabledTemp(true);
      await axios.post(`${process.env.REACT_APP_API_URL}api/presence/depart`, {
        employe_id: employeId,
      });

      Swal.fire("👋", "Départ enregistré avec succès !", "success");
      fetchHistorique();

      setTimeout(() => setIsButtonDisabledTemp(false), 3000);
    } catch (err) {
      setIsButtonDisabledTemp(false);
      Swal.fire("⚠️", err.response?.data?.message || "Erreur serveur", "warning");
    }
  };

  const columns = [
    {
      name: "Date",
      selector: (row) => new Date(row.date_presence).toLocaleDateString(),
      sortable: true,
    },
      { name: "Période", selector: (row) => row.periode || "—", center: true },
    { name: "Heure d'arrivée", selector: (row) => row.heure_arrivee || "--:--" },
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
    { name: "Heure de départ", selector: (row) => row.heure_depart || "--:--" },
  ];

  const filterByDate = () => {
    if (!dateDebut || !dateFin) {
      Swal.fire("Erreur", "Veuillez sélectionner les deux dates.", "warning");
      return;
    }
    const filtered = historique.filter((item) => {
      const itemDate = new Date(item.date_presence);
      return itemDate >= new Date(dateDebut) && itemDate <= new Date(dateFin);
    });
    setFilteredHistorique(filtered);
  };

  const resetFilter = () => {
    setFilteredHistorique(historique);
    setDateDebut("");
    setDateFin("");
  };

  if (isLoading) {
    return (
      <div className="presence-container">
        <div className="loading">Chargement...</div>
      </div>
    );
  }

  const today = new Date().toISOString().split("T")[0];
  const now = new Date();
  const currentHour = now.getHours();
  const currentPeriod = currentHour < 14 ? "matin" : "apresmidi";

  // ✅ Recherche des enregistrements du jour pour CHAQUE période
  const presenceMatin = historique.find(
    (item) => item.date_presence === today && item.periode === "matin"
  );
  
  const presenceApresMidi = historique.find(
    (item) => item.date_presence === today && item.periode === "apresmidi"
  );

  // ✅ Sélection de l'enregistrement de la période actuelle
  const presenceTodayPeriod = currentPeriod === "matin" ? presenceMatin : presenceApresMidi;

  // ✅ DÉTERMINATION DU MODE DU BOUTON (Arrivée ou Départ)
  const isArrivee = !presenceTodayPeriod?.heure_arrivee;

  // ✅ LOGIQUE DE DÉSACTIVATION AMÉLIORÉE
  let isDisabled = false;
  let disabledReason = "";

  if (isButtonDisabledTemp) {
    isDisabled = true;
    disabledReason = "Veuillez patienter...";
  }
  else if (!currentPeriodType) {
    isDisabled = true;
    disabledReason = "Hors plage horaire autorisée";
  }
  else if (isArrivee) {
    // ========== MODE ARRIVÉE ==========
    if (currentPeriodType.startsWith('depart')) {
      // On est dans une période de départ, mais pas d'arrivée enregistrée
      isDisabled = true;
      disabledReason = "Vous devez d'abord enregistrer votre arrivée";
    }
    else if (presenceTodayPeriod?.heure_arrivee) {
      // Arrivée déjà enregistrée pour cette période
      isDisabled = true;
      disabledReason = "Arrivée déjà enregistrée pour cette période";
    }
  }
  else {
    // ========== MODE DÉPART ==========
    if (currentPeriodType.startsWith('arrivee')) {
      // On est dans une période d'arrivée mais une arrivée existe déjà
      isDisabled = true;
      disabledReason = "En attente de la période de départ";
    }
    else if (!presenceTodayPeriod?.heure_arrivee) {
      // Cas critique : période de départ mais pas d'arrivée
      // Ce cas ne devrait jamais se produire vu la logique ci-dessus
      isDisabled = true;
      disabledReason = "Aucune arrivée enregistrée pour cette période";
    }
    else if (presenceTodayPeriod?.heure_depart) {
      // Départ déjà enregistré
      isDisabled = true;
      disabledReason = "Départ déjà enregistré pour cette période";
    }
  }

  // ✅ Calcul du total des heures selon le filtre
  const totalHeures = (filteredHistorique.length ? filteredHistorique : historique)
    .reduce((sum, item) => sum + parseFloat(item.heuresEffectuees || 0), 0);

  // Conversion du total en format lisible
  const totalHours = Math.floor(totalHeures);
  const totalMinutes = Math.round((totalHeures - totalHours) * 60);
  const totalFormat = `${totalHours}h ${totalMinutes.toString().padStart(2, '0')}min`;

  return (
    <div className="container">
     <h2>Pointage de présence</h2>
      <div className="user-info">
        <p>
          Connecté en tant que :{" "}
          <strong>{userData?.nom || "Utilisateur"}</strong>
        </p>
        <p style={{ fontSize: '0.9em', color: '#666' }}>
          Période actuelle : <strong>{currentPeriod === 'matin' ? 'Matin' : 'Après-midi'}</strong>
        </p>
      </div>
      
      <button
        onClick={isArrivee ? handleArrivee : handleDepart}
        className={`btn-pre ${isArrivee ? "btn-arrivee" : "btn-depart"}`}
        disabled={isDisabled}
        style={{
          opacity: isDisabled ? 0.6 : 1,
          cursor: isDisabled ? "not-allowed" : "pointer",
        }}
        title={isDisabled ? disabledReason : ""}
      >
        {isArrivee ? "🟢 Enregistrer Arrivée" : "🔴 Enregistrer Départ"}
      </button>

      {isDisabled && disabledReason && (
        <div style={{ 
          marginTop: '10px', 
          padding: '10px', 
          backgroundColor: '#f0f0f0', 
          borderRadius: '5px',
          textAlign: 'center',
          color: '#666'
        }}>
          ℹ️ {disabledReason}
        </div>
      )}

      <h3>Historique des présences</h3>
      <div className="date-filter">
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
        <button onClick={filterByDate}>Filtrer</button>
        <button onClick={resetFilter}>Réinitialiser</button>
      </div>
      <div className="datatable-container">
        <DataTable
          columns={columns}
          data={filteredHistorique.length ? filteredHistorique : historique}
          pagination
          paginationPerPage={5}
          paginationRowsPerPageOptions={[5, 10, 15]}
          highlightOnHover
          striped
          responsive
          noDataComponent="Aucun enregistrement trouvé."
        />
      </div>
    <div style={{ marginTop: "15px", textAlign: "center", fontWeight: "bold" }}>
        Total des heures effectuées : {totalFormat}
      </div>

    </div>
  );
}

export default Presence;