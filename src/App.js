import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Site Admin
import Login from "./Site_Admin/Login/Login";
import MenuAdmin from "./Site_Admin/MenuAdmin/menu_admin";
import Absence from "./Site_Admin/PageAdmin/Absence";
import Acceuil from "./Site_Admin/PageAdmin/Acceuil";
import Contrat from "./Site_Admin/PageAdmin/Contrat";
import Service from "./Site_Admin/PageAdmin/Service";
import Employe from "./Site_Admin/PageAdmin/Employe";
import Presence from "./Site_Admin/PageAdmin/PresenceAdmin";
import User from "./Site_Admin/PageAdmin/User";
import Salaire from "./Site_Admin/PageAdmin/Salaire";
import BulletinSalaire from "./Site_Admin/PageAdmin/BulletinSalaire";
import Conge from "./Site_Admin/PageAdmin/Conge";
import Article from "./Site_Admin/PageAdmin/articles_contrat";

// Site Utilisateur
import LoginUser from "./Site_User/LoginUser/login_user";
import MenuUser from "./Site_User/MenuUser/menu_user";
import AbsenceUser from "./Site_User/PageUser/Absence";
import Notifications from "./Site_User/PageUser/notifications";
import PresenceUser from "./Site_User/PageUser/presence";
import Profil from "./Site_User/PageUser/profil";
import Historique from "./Site_User/PageUser/historique";

function App() {
  return (
    <Router>
      <Routes>
        {/* Page de connexion utilisateur affichée par défaut */}
        <Route path="/" element={<LoginUser />} />

        {/* Tableau de bord utilisateur */}
        <Route path="/user/dashboard" element={<MenuUser />}>
          <Route index element={<Profil />} />
            <Route path="historique" element={<Historique />} />
          <Route path="presence" element={<PresenceUser />} />
          <Route path="absence" element={<AbsenceUser />} />
          <Route path="notifications" element={<Notifications />} />
        </Route>  

        {/* Page de connexion admin */}
        <Route path="/admin/login" element={<Login />} />

        {/* Tableau de bord admin */}
        <Route path="/admin/dashboard" element={<MenuAdmin />}>
          <Route index element={<Acceuil />} />
          <Route path="users" element={<User />} />
          <Route path="services" element={<Service />} />
          <Route path="employes/:id_service" element={<Employe />} />
          <Route path="contrats" element={<Contrat />} />
          <Route path="presences" element={<Presence />} />
          <Route path="absences" element={<Absence />} />
          <Route path="conge" element={<Conge />} />
          <Route path="salaires" element={< Salaire />} />
          <Route path="bulletin" element={<BulletinSalaire/>} />
          <Route path="articles" element={<Article/>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
