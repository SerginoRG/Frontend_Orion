import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../StyleCss/Notifications.css";

function Notifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const userData = JSON.parse(sessionStorage.getItem("userData")); // ✅ SessionStorage
    const employe_id = userData?.id_employe;

    if (!employe_id) return; // sécurité

    axios.get(`http://127.0.0.1:8000/api/user/${employe_id}/notifications`)
      .then(res => setNotifications(res.data))
      .catch(err => console.log(err));
  }, []);

  return (
    <div>
      <h1>🔔 Notifications</h1>

      {notifications.length === 0 ? (
        <p>Aucune notification pour l’instant</p>
      ) : (
        notifications.map((n) => (
          <div key={n.id_notification} className="notif-card">
            <h3>{n.titre}</h3>
            <p>{n.message}</p>
            <small>{new Date(n.created_at).toLocaleString("fr-FR")}</small>
            <hr />
          </div>
        ))
      )}
    </div>
  );
}

export default Notifications;
