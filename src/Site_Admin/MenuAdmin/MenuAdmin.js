import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import {
  FaBars,
  FaHome,
  FaUsers,
  FaBuilding,
  FaFileContract,
  FaUserCheck,
  FaUserTimes,
  FaSignOutAlt,
  FaMoneyBillWave,
  FaFileInvoiceDollar,
} from "react-icons/fa";
import "../../StyleCss/Menu.css";

function MenuAdmin() {
  const [open, setOpen] = useState(false);
  const [openCarousel, setOpenCarousel] = useState(false);
  const [services, setServices] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  // Charger les services depuis l'API Laravel
  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/services")
      .then((res) => setServices(res.data))
      .catch((err) => console.error("Erreur de chargement des services :", err));
  }, []);

  const menuItems = [
    { path: "/admin/dashboard", label: "Accueil", icon: <FaHome /> },
    { path: "/admin/dashboard/users", label: "Users", icon: <FaUsers /> },
    { path: "/admin/dashboard/services", label: "Services", icon: <FaBuilding /> },
    { path: "/admin/dashboard/contrats", label: "Contrats", icon: <FaFileContract /> },
    { path: "/admin/dashboard/presences", label: "Présences", icon: <FaUserCheck /> },
    { path: "/admin/dashboard/absences", label: "Absences", icon: <FaUserTimes /> },
    { path: "/admin/dashboard/salaires", label: "Salaire", icon: <FaMoneyBillWave /> },
    { path: "/admin/dashboard/bulletin", label: "Bulletin", icon: <FaFileInvoiceDollar /> },
  ];

  const handleLogout = () => {
    Swal.fire({
      title: "Voulez-vous vraiment vous déconnecter ?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Oui",
      cancelButtonText: "Non",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();
        sessionStorage.clear();
        navigate("/admin/login");
      }
    });
  };

  useEffect(() => {
  const user = sessionStorage.getItem("user");
  if (!user) {
    navigate("/admin/login");
  }
}, [navigate]);


  return (
    <div className="admin-container">
      {/* Sidebar */}
      <aside className={`sidebar ${open ? "open" : "closed"}`}>
        {/* Bouton Hamburger */}
        <div className="hamburger" onClick={() => setOpen(!open)}>
          <FaBars size={24} />
        </div>

        {/* Logo */}
        {open && (
          <div className="logo-container">
            <img
              src="/images/logo/logo_orion.jpg"
              alt="Logo Orion"
              className="sidebar-logo"
            />
          </div>
        )}

        {open && <div className="sidebar-header">Orion</div>}

        {/* Liens du menu */}
        <nav className="menu-nav">
          <ul>
            {/* Menu principal */}
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`menu-link ${
                    location.pathname === item.path ? "active" : ""
                  }`}
                  title={!open ? item.label : ""}
                >
                  <span className="menu-icon">{item.icon}</span>
                  {open && <span className="menu-label">{item.label}</span>}
                </Link>
              </li>
            ))}

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
