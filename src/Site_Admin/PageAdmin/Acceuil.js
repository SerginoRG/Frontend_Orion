import "../../StyleCss/Acceuil.css" // Nouveau fichier CSS

function Acceuil() {
  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Tableau de bord RH</h1>

      {/* Vue d'ensemble */}
      <div className="overview-cards">
        <div className="card">
          <h2>Employés</h2>
          <p>120</p>
        </div>
        <div className="card">
          <h2>Absences / Retards</h2>
          <p>5%</p>
        </div>
        <div className="card">
          <h2>Masse salariale</h2>
          <p>50 000 €</p>
        </div>
      </div>

      {/* Graphiques */}
      <div className="charts-section">
        <div className="chart-card">
          <h3>Statistiques des présences</h3>
          <div className="chart-placeholder">Graphique ici</div>
        </div>
        <div className="chart-card">
          <h3>Masse salariale par service</h3>
          <div className="chart-placeholder">Graphique ici</div>
        </div>
      </div>
    </div>
  )
}

export default Acceuil;
