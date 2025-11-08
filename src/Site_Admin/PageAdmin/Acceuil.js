import { useState, useEffect } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from "recharts";
import "../../StyleCss/Acceuil.css";

function Acceuil() {
  const [statistics, setStatistics] = useState({
    total_employes: 0,
    total_services: 0,
    taux_absence_retard: 0,
    absences: 0,
    retards: 0
  });

  const [presenceStats, setPresenceStats] = useState([]);

  const [masseStats, setMasseStats] = useState([]);


  useEffect(() => {
    fetchStatistics();
    fetchPresenceStats();
    fetchMasseStats(); //  ajout
  }, []);

  const fetchStatistics = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/dashboard/statistics");
      setStatistics(response.data);
    } catch (err) {
      console.error("Erreur chargement statistiques:", err);
    }
  };

  const fetchPresenceStats = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/dashboard/presence-stats");
      setPresenceStats(response.data);
    } catch (err) {
      console.error("Erreur chargement stats présence:", err);
    }
  };

  const fetchMasseStats = async () => {
  try {
    const response = await axios.get("http://localhost:8000/api/dashboard/masse-salariale");
    setMasseStats(response.data);
  } catch (err) {
    console.error("Erreur chargement masse salariale:", err);
  }
};


  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Tableau de bord RH</h1>

      {/* Vue d'ensemble */}
      <div className="overview-cards">
        <div className="card">
          <h2>Employés</h2>
          <p>{statistics.total_employes}</p>
        </div>
        <div className="card">
          <h2>Absences / Retards</h2>
          <p>{statistics.taux_absence_retard}%</p>
          <small>
            ({statistics.absences} absences, {statistics.retards} retards)
          </small>
        </div>
        <div className="card">
          <h2>Services</h2>
          <p>{statistics.total_services}</p>
        </div>
      </div>

    {/* Histogrammes en parallèle */}
    <div className="charts-section">

      <div className="chart-card">
        <h3>Statistiques des présences (7 derniers jours)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={presenceStats}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Présents" fill="#4CAF50" />
            <Bar dataKey="Retards" fill="#FFA500" />
            <Bar dataKey="Absents" fill="#F44336" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-card">
        <h3>Masse salariale par service</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={masseStats}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="service" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="masse_salariale" fill="#007bff" />
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>



    </div>
  );
}

export default Acceuil;
