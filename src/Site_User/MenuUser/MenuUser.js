// src/Site_User/MenuUser/MenuUser
import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  FaBars,
  FaHome,
  FaUserCheck,
  FaUserTimes,
  FaBell,
  FaSignOutAlt,
} from "react-icons/fa";
import "../../StyleCss/Menu.css";

function MenuUser() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // ✅ Récupération depuis sessionStorage (et non localStorage)
    const data = JSON.parse(sessionStorage.getItem("userData"));
    if (!data) {
      navigate("/"); // redirection si non connecté
    } else {
      setUserData(data);
    }
  }, [navigate]);

  const menuItems = [
    { path: "/user/dashboard", label: "Profil", icon: <FaHome /> },
    { path: "/user/dashboard/presence", label: "Présence", icon: <FaUserCheck /> },
    { path: "/user/dashboard/absence", label: "Absence", icon: <FaUserTimes /> },
    { path: "/user/dashboard/notifications", label: "Notifications", icon: <FaBell /> },
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
        // ✅ Nettoyer sessionStorage
        sessionStorage.removeItem("userData");
        navigate("/");
      }
    });
  };

  return (
    <div className="admin-container">
      <aside className={`sidebar ${open ? "open" : "closed"}`}>
        <div className="hamburger" onClick={() => setOpen(!open)}>
          <FaBars size={24} />
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

            <div className="sidebar-header">Espace Utilisateur</div>
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
                  {open && <span className="menu-label">{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
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
