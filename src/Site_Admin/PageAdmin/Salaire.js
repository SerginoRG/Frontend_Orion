import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import DataTable from "react-data-table-component";
import "../../StyleCss/Salaire.css";

function Salaire() {
  const [salaires, setSalaires] = useState([]);
  const [employes, setEmployes] = useState([]);

  useEffect(() => {
    fetchSalaires();
    fetchEmployes();
  }, []);

  const fetchSalaires = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/salaires");
      setSalaires(res.data);
    } catch (error) {
      console.error("Erreur de chargement des salaires :", error);
    }
  };

  const fetchEmployes = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/employes");
      setEmployes(res.data);
    } catch (error) {
      console.error("Erreur de chargement des employés :", error);
    }
  };

  // Ouvrir la modale pour ajouter un salaire
  const handleAddSalaire = async () => {
    const { value: formValues } = await Swal.fire({
      title: "Ajouter un Salaire",
      html: `
        <div style="text-align: left; padding: 10px;">
          <label style="font-weight: bold;">Mois</label>
          <input id="mois" type="text" class="swal2-input" placeholder="Mois (ex: Janvier)" />
          
          <label style="font-weight: bold;">Année</label>
          <input id="annee" type="number" class="swal2-input" placeholder="Année" />
          
          <label style="font-weight: bold;">Employé</label>
          <select id="employe" class="swal2-select">
            <option value="">-- Choisir un employé --</option>
            ${employes
              .map(
                (emp) =>
                  `<option value="${emp.id_employe}" data-salaire="${emp.salaire_base_employe}">
                    ${emp.nom_employe} ${emp.prenom_employe}
                  </option>`
              )
              .join("")}
          </select>
          
          <label style="font-weight: bold;">Salaire de base</label>
          <input id="salaire_base" type="number" class="swal2-input" placeholder="Salaire de base" readonly />
          
          <label style="font-weight: bold;">Primes</label>
          <input id="primes" type="number" class="swal2-input" placeholder="Primes" value="0" />
          
          <div style="margin: 15px 0; padding: 10px; background: #f0f0f0; border-radius: 5px;">
            <label style="display: flex; align-items: center; cursor: pointer;">
              <input type="checkbox" id="calcul_auto" style="margin-right: 10px; width: 20px; height: 20px;" />
              <span style="font-weight: bold;">Calculer automatiquement les retenues (absences/retards)</span>
            </label>
          </div>
          
          <label style="font-weight: bold;">Retenues</label>
          <input id="retenues" type="number" class="swal2-input" placeholder="Retenues" value="0" />
          <small id="retenues_info" style="color: #666; display: none; margin-top: 5px;"></small>
          
          <label style="font-weight: bold;">Salaire net</label>
          <input id="salaire_net" type="number" class="swal2-input" placeholder="Salaire net" readonly />
        </div>
      `,
      width: '600px',
      didOpen: () => {
        const employeSelect = document.getElementById("employe");
        const salaireBaseInput = document.getElementById("salaire_base");
        const primesInput = document.getElementById("primes");
        const retenuesInput = document.getElementById("retenues");
        const salaireNetInput = document.getElementById("salaire_net");
        const calculAutoCheckbox = document.getElementById("calcul_auto");
        const moisInput = document.getElementById("mois");
        const anneeInput = document.getElementById("annee");
        const retenuesInfo = document.getElementById("retenues_info");

        // Lorsqu'on choisit un employé → remplir salaire de base
        employeSelect.addEventListener("change", () => {
          const selected = employeSelect.options[employeSelect.selectedIndex];
          salaireBaseInput.value = selected.getAttribute("data-salaire") || "";
          calculSalaireNet();
          
          // Si calcul auto activé, recalculer les retenues
          if (calculAutoCheckbox.checked) {
            calculerRetenuesAuto();
          }
        });

        // Calcul automatique des retenues basé sur les absences/retards
        const calculerRetenuesAuto = async () => {
          const employe_id = employeSelect.value;
          const mois = moisInput.value;
          const annee = anneeInput.value;
          const salaire_base = salaireBaseInput.value;

          if (!employe_id || !mois || !annee || !salaire_base) {
            return;
          }

          try {
            const response = await axios.post(
              "http://localhost:8000/api/salaires/calculer-retenues-preview",
              { employe_id, mois_salaire: mois, annee_salaire: annee, salaire_base }
            );

            const data = response.data;
            retenuesInput.value = data.total_retenues;
            retenuesInput.readOnly = true;
            
            // Afficher les détails
            retenuesInfo.style.display = "block";
            retenuesInfo.innerHTML = `
              📊 Détails: ${data.nb_absences} absence(s) + ${data.nb_retards} retard(s) = ${data.total_retenues} Ar
            `;
            
            calculSalaireNet();
          } catch (error) {
            console.error("Erreur calcul retenues:", error);
            retenuesInput.readOnly = false;
            retenuesInfo.style.display = "block";
            retenuesInfo.innerHTML = `❌ Erreur lors du calcul automatique`;
            retenuesInfo.style.color = "red";
          }
        };

        // Toggle calcul automatique
        calculAutoCheckbox.addEventListener("change", () => {
          if (calculAutoCheckbox.checked) {
            calculerRetenuesAuto();
          } else {
            retenuesInput.readOnly = false;
            retenuesInput.value = 0;
            retenuesInfo.style.display = "none";
            calculSalaireNet();
          }
        });

        // Recalculer si changement de mois/année avec calcul auto activé
        moisInput.addEventListener("change", () => {
          if (calculAutoCheckbox.checked) calculerRetenuesAuto();
        });
        
        anneeInput.addEventListener("change", () => {
          if (calculAutoCheckbox.checked) calculerRetenuesAuto();
        });

        // Calcul du salaire net
        const calculSalaireNet = () => {
          const base = parseFloat(salaireBaseInput.value || 0);
          const primes = parseFloat(primesInput.value || 0);
          const retenues = parseFloat(retenuesInput.value || 0);
          salaireNetInput.value = base + primes - retenues;
        };

        primesInput.addEventListener("input", calculSalaireNet);
        retenuesInput.addEventListener("input", () => {
          if (!calculAutoCheckbox.checked) {
            calculSalaireNet();
          }
        });
      },
      focusConfirm: false,
      preConfirm: () => {
        const mois = document.getElementById("mois").value;
        const annee = document.getElementById("annee").value;
        const employe_id = document.getElementById("employe").value;
        const salaire_base = document.getElementById("salaire_base").value;
        const primes_salaire = document.getElementById("primes").value || 0;
        const retenues_salaire = document.getElementById("retenues").value || 0;
        const salaire_net = document.getElementById("salaire_net").value;
        const calcul_auto = document.getElementById("calcul_auto").checked;

        if (!mois || !annee || !employe_id || !salaire_base) {
          Swal.showValidationMessage("Veuillez remplir tous les champs obligatoires");
          return false;
        }

        return {
          mois_salaire: mois,
          annee_salaire: parseInt(annee),
          salaire_base: parseFloat(salaire_base),
          primes_salaire: parseFloat(primes_salaire),
          retenues_salaire: parseFloat(retenues_salaire),
          salaire_net: parseFloat(salaire_net),
          employe_id: parseInt(employe_id),
          calcul_auto_retenues: calcul_auto,
        };
      },
    });

    if (formValues) {
      try {
        console.log("Données envoyées:", formValues);
        const response = await axios.post("http://localhost:8000/api/salaires", formValues);
        console.log("Réponse:", response.data);
        Swal.fire("Succès", "Salaire ajouté avec succès", "success");
        fetchSalaires();
      } catch (error) {
        console.error("Erreur complète:", error.response?.data);
        const errorMsg = error.response?.data?.message || "Impossible d'ajouter le salaire";
        Swal.fire("Erreur", errorMsg, "error");
      }
    }
  };

  // Supprimer un salaire
  const handleDelete = async (id) => {
    Swal.fire({
      title: "Confirmer la suppression ?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Oui, supprimer",
      cancelButtonText: "Annuler",
    }).then(async (result) => {
      if (result.isConfirmed) {
        await axios.delete(`http://localhost:8000/api/salaires/${id}`);
        Swal.fire("Supprimé", "Le salaire a été supprimé", "success");
        fetchSalaires();
      }
    });
  };

  // Colonnes du tableau
  const columns = [
    { name: "Mois", selector: (row) => row.mois_salaire, sortable: true },
    { name: "Année", selector: (row) => row.annee_salaire, sortable: true },
    { name: "Salaire Base", selector: (row) => `${row.salaire_base} Ar`, sortable: true },
    { name: "Primes", selector: (row) => `${row.primes_salaire} Ar` },
    { name: "Retenues", selector: (row) => `${row.retenues_salaire} Ar` },
    { name: "Salaire Net", selector: (row) => `${row.salaire_net} Ar`, sortable: true },
    {
      name: "Employé",
      selector: (row) =>
        row.employe ? `${row.employe.nom_employe} ${row.employe.prenom_employe}` : "N/A",
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <button className="btn-delete" onClick={() => handleDelete(row.id_salaire)}>
          Supprimer
        </button>
      ),
    },
  ];

  return (
    <div className="salaire-container">
      <h1>Gestion des Salaires</h1>
      <button className="btn-add" onClick={handleAddSalaire}>
        Ajouter un Salaire
      </button>

      <DataTable
        title="Liste des Salaires"
        columns={columns}
        data={salaires}
        pagination
        highlightOnHover
        striped
      />
    </div>
  );
}

export default Salaire;