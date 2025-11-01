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
  const [isArrivee, setIsArrivee] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPeriodType, setCurrentPeriodType] = useState(null); // 'arrivee-matin', 'depart-matin', 'arrivee-apresmidi', 'depart-apresmidi', ou null
  const [isButtonDisabledTemp, setIsButtonDisabledTemp] = useState(false);
  
  const userData = JSON.parse(sessionStorage.getItem("userData"));
  const employeId = userData?.id_employe || userData?.employe_id;
  const storageKey = `isArrivee_${employeId}`;

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

  const checkPresenceStatus = async () => {
    if (!employeId) return;
    try {
      const res = await axios.get(
        `http://127.0.0.1:8000/api/presence/check-status/${employeId}`
      );
      const hasArrival = res.data.has_arrival;
      setIsArrivee(!hasArrival);
      sessionStorage.setItem(storageKey, JSON.stringify(!hasArrival));
    } catch (err) {
      console.error("Erreur lors de la vérification du statut :", err);
    } finally {
      setIsLoading(false);
    }
  };

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
    }
  };

  useEffect(() => {
    if (employeId) {
      checkPresenceStatus();
      fetchHistorique();
    }
  }, [employeId]);

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === storageKey && e.newValue !== null) {
        setIsArrivee(JSON.parse(e.newValue));
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [storageKey]);

  // ✅ Détermination de la période active et vérification des plages horaires
  useEffect(() => {
    const checkCurrentPeriod = () => {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      
      // Définition des plages horaires
      const periods = {
        'arrivee-matin': [7 * 60 + 30, 8 * 60 + 30],      // 07:30 - 08:30
        'depart-matin': [11 * 60 + 45, 12 * 60 + 30],     // 11:45 - 12:30
        'arrivee-apresmidi': [14 * 60 + 30, 15 * 60 + 30], // 14:30 - 15:30
        'depart-apresmidi': [17 * 60 + 45, 18 * 60 + 30],  // 17:45 - 18:30
      };

      // Déterminer dans quelle période nous sommes
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
    const interval = setInterval(checkCurrentPeriod, 30000); // Vérifie toutes les 30s
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
      setIsArrivee(false);
      sessionStorage.setItem(storageKey, JSON.stringify(false));
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: storageKey,
          newValue: JSON.stringify(false),
        })
      );
      fetchHistorique();

      // Réactiver le bouton après 3 secondes
      setTimeout(() => setIsButtonDisabledTemp(false), 3000);
    } catch (err) {
      setIsButtonDisabledTemp(false);
      if (err.response?.status === 409) {
        setIsArrivee(false);
        sessionStorage.setItem(storageKey, JSON.stringify(false));
      }
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
      setIsArrivee(true);
      sessionStorage.setItem(storageKey, JSON.stringify(true));
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: storageKey,
          newValue: JSON.stringify(true),
        })
      );
      fetchHistorique();

      // Garder le bouton désactivé après le départ (il se réactivera automatiquement à 07h30 le lendemain)
      setTimeout(() => setIsButtonDisabledTemp(false), 3000);
    } catch (err) {
      setIsButtonDisabledTemp(false);
      if (err.response?.status === 404) {
        setIsArrivee(true);
        sessionStorage.setItem(storageKey, JSON.stringify(true));
      }
      Swal.fire("⚠️", err.response?.data?.message || "Erreur serveur", "warning");
    }
  };

  const columns = [
    {
      name: "Date",
      selector: (row) => new Date(row.date_presence).toLocaleDateString(),
      sortable: true,
    },
    {
      name: "Période",
      selector: (row) =>
        row.heure_arrivee && row.heure_arrivee < "12:00" ? "Matin" : "Après-midi",
      sortable: true,
    },
    { name: "Heure d'arrivée", selector: (row) => row.heure_arrivee || "--:--" },
    {
      name: "Statut",
      selector: (row) => row.statut_presence,
      cell: (row) => (
        <span
          className={`statut-badge ${row.statut_presence
            .toLowerCase()
            .replace(" ", "-")}`}
        >
          {row.statut_presence}
        </span>
      ),
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

  // Recherche de l'enregistrement d'arrivée pour la période en cours
  const presenceTodayPeriod = historique.find(
    (item) => item.date_presence === today && item.periode === currentPeriod
  );

  // ✅ LOGIQUE DE DÉSACTIVATION COMPLÈTE
  let isDisabled = false;
  let disabledReason = "";

  // 1. Désactivation temporaire après un clic (anti-clic accidentel)
  if (isButtonDisabledTemp) {
    isDisabled = true;
    disabledReason = "Veuillez patienter...";
  }
  // 2. Si on est en dehors de toutes les plages horaires
  else if (!currentPeriodType) {
    isDisabled = true;
    disabledReason = "Hors plage horaire autorisée";
  }
  // 3. Mode ARRIVÉE
  else if (isArrivee) {
    // Si on est dans une période de départ mais le bouton est en mode arrivée
    if (currentPeriodType.startsWith('depart')) {
      isDisabled = true;
      disabledReason = "Période de départ uniquement";
    }
    // Si une arrivée est déjà enregistrée pour cette période
    else if (presenceTodayPeriod?.heure_arrivee) {
      isDisabled = true;
      disabledReason = "Arrivée déjà enregistrée";
    }
  }
  // 4. Mode DÉPART
  else {
    // Si on est dans une période d'arrivée mais le bouton est en mode départ
    if (currentPeriodType.startsWith('arrivee')) {
      isDisabled = true;
      disabledReason = "Période d'arrivée uniquement";
    }
    // Si aucune arrivée n'est enregistrée pour cette période
    else if (!presenceTodayPeriod?.heure_arrivee) {
      isDisabled = true;
      disabledReason = "Aucune arrivée enregistrée";
    }
    // Si un départ est déjà enregistré pour cette période
    else if (presenceTodayPeriod?.heure_depart) {
      isDisabled = true;
      disabledReason = "Départ déjà enregistré";
    }
  }

  return (
    <div className="presence-container">
      <h2>Suivi de Présence</h2>
      <div className="user-info">
        <p>
          Connecté en tant que :{" "}
          <strong>{userData?.nom || "Utilisateur"}</strong>
        </p>
      </div>
      
      <button
        onClick={isArrivee ? handleArrivee : handleDepart}
        className={`btn-presence ${isArrivee ? "btn-arrivee" : "btn-depart"}`}
        disabled={isDisabled}
        style={{
          opacity: isDisabled ? 0.6 : 1,
          cursor: isDisabled ? "not-allowed" : "pointer",
        }}
        title={isDisabled ? disabledReason : ""}
      >
        {isArrivee ? "🟢 Enregistrer Arrivée" : "🔴 Enregistrer Départ"}
      </button>

      {/* Message d'information sur l'état actuel */}
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