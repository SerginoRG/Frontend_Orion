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
        `http://127.0.0.1:8000/api/presence/historique/${employeId}`
      );
      const historiqueWithPeriod = res.data.map((item) => {
        const arrivalHour = parseInt(item.heure_arrivee?.split(":")[0]);
        return {
          ...item,
          periode: arrivalHour >= 14 ? "apresmidi" : "matin",
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
        'arrivee-matin': [7 * 60 + 30, 8 * 60 + 30],
        'depart-matin': [11 * 60 + 45, 12 * 60 + 30],
        'arrivee-apresmidi': [14 * 60 + 30, 15 * 60 + 30],
        'depart-apresmidi': [17 * 60 + 45, 18 * 60 + 30],
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
      await axios.post("http://127.0.0.1:8000/api/presence/arrivee", {
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
      await axios.post("http://127.0.0.1:8000/api/presence/depart", {
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

  return (
    <div className="container">
      <h2>Suivi de Présence</h2>
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
    </div>
  );
}

export default Presence;