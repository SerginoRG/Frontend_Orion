import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaHome,
  FaUsers,
  FaBuilding,
  FaFileContract,
  FaUserCheck,
  FaUserTimes,
  FaSignOutAlt,
  FaMoneyBillWave,
  FaFileInvoiceDollar,
  FaCalendarCheck,
  FaFileAlt,
  FaChevronLeft,
  FaChevronRight
} from "react-icons/fa";
import "../../StyleCss/menu.css";

function MenuAdmin() {
  const [open, setOpen] = useState(false);
  const [openCarousel, setOpenCarousel] = useState(false);
  const [services, setServices] = useState([]);
  const [showLogoutModal, setShowLogoutModal] = useState(false); // ✅ Ajouté
  const location = useLocation();
  const navigate = useNavigate();

  // Charger les services depuis l'API Laravel
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}api/services`)
      .then((res) => setServices(res.data))
      .catch((err) => console.error("Erreur de chargement des services :", err));
  }, []);

  useEffect(() => {
    const user = sessionStorage.getItem("user");
    if (!user) {
      navigate("/admin/login");
    }
  }, [navigate]);

  // ✅ Fonction pour ouvrir le modal
  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  // ✅ Fonction de confirmation de déconnexion
  const handleLogoutConfirm = () => {
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("userData");
    navigate("/admin/login");
  };

  return (
    <div className="admin-container">
      {/* ============= MODAL DE DÉCONNEXION ============= */}
      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="mety" >Voulez-vous vraiment vous déconnecter ?</h3>
            <div className="modal-actions">
              <button className="btn-confirm" onClick={handleLogoutConfirm}>
                Oui
              </button>
              <button className="btn-cancel" onClick={() => setShowLogoutModal(false)}>
                Non
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${open ? "open" : "closed"}`}>
        {/* Bouton Hamburger */}
        <div className="hamburger" onClick={() => setOpen(!open)}>
          {open ? <FaChevronLeft size={24} /> : <FaChevronRight size={24} />}
        </div>

        {/* Logo */}
        {open && (
          <div className="logo-container">
            <img
              src="/images/logo/rh_logo.png"
              alt="Logo Orion"
              className="sidebar-logo"
            />
          </div>
        )}

        {open && <div className="sidebar-header">Smart</div>}

        {/* Liens du menu */}
        <nav className="menu-nav">
          <ul>
            {/* Accueil */}
            <li>
              <Link
                to="/admin/dashboard"
                className={`menu-link ${
                  location.pathname === "/admin/dashboard" ? "active" : ""
                }`}
                title={!open ? "Accueil" : ""}
              >
                <span className="menu-icon"><FaHome /></span>
                {open && <span className="menu-label">Accueil</span>}
              </Link>
            </li>

            {/* Users */}
            <li>
              <Link
                to="/admin/dashboard/users"
                className={`menu-link ${
                  location.pathname === "/admin/dashboard/users" ? "active" : ""
                }`}
                title={!open ? "Users" : ""}
              >
                <span className="menu-icon"><FaUsers /></span>
                {open && <span className="menu-label">Users</span>}
              </Link>
            </li>

            {/* Sous-menu Employés */}
            <li>
              <div
                className="menu-link"
                onClick={() => setOpenCarousel(!openCarousel)}
                style={{ cursor: "pointer" }}
              >
                <span className="menu-icon">
                  <FaUsers />
                </span>
                {open && <span className="menu-label">Employés</span>}
                {open && (
                  <span className={`arrow ${openCarousel ? "open" : ""}`}>
                    ▾
                  </span>
                )}
              </div>

              {open && (
                <ul className={`submenu ${openCarousel ? "show" : ""}`}>
                  {services.length > 0 ? (
                    services.map((service) => (
                      <li key={service.id_service}>
                        <Link
                          to={`/admin/dashboard/employes/${service.id_service}`}
                          className={`submenu-link ${
                            location.pathname ===
                            `/admin/dashboard/employes/${service.id_service}`
                              ? "active"
                              : ""
                          }`}
                        >
                          {service.nom_service}
                        </Link>
                      </li>
                    ))
                  ) : (
                    <li className="submenu-empty">Aucun service</li>
                  )}
                </ul>
              )}
            </li>

            {/* Services */}
            <li>
              <Link
                to="/admin/dashboard/services"
                className={`menu-link ${
                  location.pathname === "/admin/dashboard/services" ? "active" : ""
                }`}
                title={!open ? "Services" : ""}
              >
                <span className="menu-icon"><FaBuilding /></span>
                {open && <span className="menu-label">Services</span>}
              </Link>
            </li>

            {/* Articles */}
            <li>
              <Link
                to="/admin/dashboard/articles"
                className={`menu-link ${
                  location.pathname === "/admin/dashboard/articles" ? "active" : ""
                }`}
                title={!open ? "Articles" : ""}
              >
                <span className="menu-icon"><FaFileAlt /></span>
                {open && <span className="menu-label">Articles</span>}
              </Link>
            </li>

            {/* Contrats */}
            <li>
              <Link
                to="/admin/dashboard/contrats"
                className={`menu-link ${
                  location.pathname === "/admin/dashboard/contrats" ? "active" : ""
                }`}
                title={!open ? "Contrats" : ""}
              >
                <span className="menu-icon"><FaFileContract /></span>
                {open && <span className="menu-label">Contrats</span>}
              </Link>
            </li>

            {/* Présences */}
            <li>
              <Link
                to="/admin/dashboard/presences"
                className={`menu-link ${
                  location.pathname === "/admin/dashboard/presences" ? "active" : ""
                }`}
                title={!open ? "Présences" : ""}
              >
                <span className="menu-icon"><FaUserCheck /></span>
                {open && <span className="menu-label">Présences</span>}
              </Link>
            </li>

            {/* Absences */}
            <li>
              <Link
                to="/admin/dashboard/absences"
                className={`menu-link ${
                  location.pathname === "/admin/dashboard/absences" ? "active" : ""
                }`}
                title={!open ? "Absences" : ""}
              >
                <span className="menu-icon"><FaUserTimes /></span>
                {open && <span className="menu-label">Absences</span>}
              </Link>
            </li>

            {/* Salaire */}
            <li>
              <Link
                to="/admin/dashboard/salaires"
                className={`menu-link ${
                  location.pathname === "/admin/dashboard/salaires" ? "active" : ""
                }`}
                title={!open ? "Salaire" : ""}
              >
                <span className="menu-icon"><FaMoneyBillWave /></span>
                {open && <span className="menu-label">Salaire</span>}
              </Link>
            </li>

            {/* Bulletin */}
            <li>
              <Link
                to="/admin/dashboard/bulletin"
                className={`menu-link ${
                  location.pathname === "/admin/dashboard/bulletin" ? "active" : ""
                }`}
                title={!open ? "Bulletin" : ""}
              >
                <span className="menu-icon"><FaFileInvoiceDollar /></span>
                {open && <span className="menu-label">Bulletin</span>}
              </Link>
            </li>

            {/* Congés */}
            <li>
              <Link
                to="/admin/dashboard/conge"
                className={`menu-link ${
                  location.pathname === "/admin/dashboard/conge" ? "active" : ""
                }`}
                title={!open ? "Congés" : ""}
              >
                <span className="menu-icon"><FaCalendarCheck /></span>
                {open && <span className="menu-label">Congés</span>}
              </Link>
            </li>
          </ul>
        </nav>

        {/* Footer avec bouton Déconnexion */}
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt className="logout-icon" /> {open && "Déconnexion"}
          </button>
        </div>
      </aside>

      {/* Overlay pour mobile */}
      {open && <div className="overlay" onClick={() => setOpen(false)} />}

      {/* Contenu principal */}
      <main className={`main-content ${open ? "shifted" : ""}`}>
        <Outlet />
      </main>
    </div>
  );
}

export default MenuAdmin;