import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaHome,
  FaUserCheck,
  FaUserTimes,
  FaBell,
  FaSignOutAlt,
  FaHistory,
  FaChevronLeft,
  FaChevronRight
} from "react-icons/fa";
import "../../StyleCss/menu.css";

function MenuUser() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [notifCount, setNotifCount] = useState(0);

  // --- Modal logout ---
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Charger notifications
  useEffect(() => {
    const fetchNotif = () => {
      const data = JSON.parse(sessionStorage.getItem("userData"));
      if (!data) return;

      axios
        .get(`http://127.0.0.1:8000/api/user/${data.id_employe}/notifications/unread-count`)
        .then((res) => setNotifCount(res.data))
        .catch((err) => console.log(err));
    };

    fetchNotif();
    window.addEventListener("notifUpdate", fetchNotif);
    return () => window.removeEventListener("notifUpdate", fetchNotif);
  }, []);

  useEffect(() => {
    const data = JSON.parse(sessionStorage.getItem("userData"));
    if (!data) {
      navigate("/");
    } else {
      setUserData(data);

      axios
        .get(`http://127.0.0.1:8000/api/user/${data.id_employe}/notifications/unread-count`)
        .then((res) => setNotifCount(res.data))
        .catch((err) => console.log(err));
    }
  }, [navigate]);

  const menuItems = [
    { path: "/user/dashboard", label: "Profil", icon: <FaHome /> },
    { path: "/user/dashboard/presence", label: "Présence", icon: <FaUserCheck /> },
    { path: "/user/dashboard/absence", label: "Demande d'Absence", icon: <FaUserTimes /> },
    { path: "/user/dashboard/historique", label: "historique", icon: <FaHistory /> },
    { path: "/user/dashboard/notifications", label: "Notifications", icon: <FaBell /> },
  ];

  // --- Fonction de validation du logout ---
  const handleLogoutConfirm = () => {
    sessionStorage.removeItem("userData");
    navigate("/");
  };

  return (
    <div className="admin-container">
      {/* ============= MODAL DE DÉCONNEXION ============= */}
      {showLogoutModal && (
  <div className="modal-overlay">
    <div className="modal-content">
      <h3 className="mety">Voulez-vous vraiment vous déconnecter ?</h3>
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

      {/* ================= SIDEBAR ================= */}
      <aside className={`sidebar ${open ? "open" : "closed"}`}>
        <div className="hamburger" onClick={() => setOpen(!open)}>
          {open ? <FaChevronLeft size={24} /> : <FaChevronRight size={24} />}
        </div>

        {open && (
          <>
            <div className="user-info">
              <img
                src={userData?.photo || "/images/avatar.png"}
                alt="Profil"
                className="user-photo"
              />
              <p className="user-email">{userData?.email}</p>
            </div>

            <div className="sidebar-header">Espace Employé</div>
          </>
        )}

        <nav className="menu-nav">
          <ul>
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`menu-link ${
                    location.pathname === item.path ? "active" : ""
                  }`}
                >
                  <span className="menu-icon">{item.icon}</span>

                  {open && (
                    <span className="menu-label">
                      {item.label}

                      {item.label === "Notifications" && notifCount > 0 && (
                        <span className="badge-notif">{notifCount}</span>
                      )}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={() => setShowLogoutModal(true)}>
            <FaSignOutAlt className="logout-icon" /> {open && "Déconnexion"}
          </button>
        </div>
      </aside>

      <main className={`main-content ${open ? "shifted" : ""}`}>
        <Outlet />
      </main>
    </div>
  );
}

export default MenuUser;
