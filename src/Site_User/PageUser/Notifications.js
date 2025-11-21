import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2"; // ✅ Import SweetAlert
import { FaTrash } from "react-icons/fa";
import "../../StyleCss/Notifications.css";

function Notifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
  const userData = JSON.parse(sessionStorage.getItem("userData"));
  if (!userData) return;

  axios.put(`${process.env.REACT_APP_API_URL}api/user/${userData.id_employe}/notifications/mark-read`)
    .then(() => {
      // Optionnel: rafraîchir le compteur dans le menu
      window.dispatchEvent(new Event("notifUpdate"));
    })
    .catch(err => console.log(err));
}, []);


  const fetchNotifications = () => {
    const userData = JSON.parse(sessionStorage.getItem("userData"));
    const employe_id = userData?.id_employe;
    if (!employe_id) return;

    axios.get(`${process.env.REACT_APP_API_URL}api/user/${employe_id}/notifications`)
      .then(res => setNotifications(res.data))
      .catch(err => console.log(err));
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // ✅ Fonction supprimer notification avec SweetAlert
  const deleteNotification = (id) => {
    Swal.fire({
      title: "Supprimer ?",
      text: "Voulez-vous vraiment supprimer cette notification ?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler"
    }).then((result) => {
      if (result.isConfirmed) {
        axios.delete(`${process.env.REACT_APP_API_URL}api/notifications/${id}`)
          .then(() => {
            Swal.fire("Supprimée !", "La notification a été supprimée.", "success");
            fetchNotifications();
          })
          .catch(() => {
            Swal.fire("Erreur", "Une erreur est survenue.", "error");
          });
      }
    });
  };

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

            {/* ✅ Icône supprimer */}
            <FaTrash
              className="delete-icon"
              onClick={() => deleteNotification(n.id_notification)}
            />

            <hr />
          </div>
        ))
      )}
    </div>
  );
}

export default Notifications;
