# Contrat de l'API — Queen Bee (Jour 1)

Toutes les réponses d'erreur suivent le format RFC 9457 (`Content-Type: application/problem+json`) avec `type: "about:blank"`, `title`, `status` et `detail`.

---

## 1. GET /health

Vérifie que le service HTTP est opérationnel.

* **Paramètres de chemin :** aucun.
* **Paramètres de requête :** aucun.
* **Corps attendu :** aucun.
* **Codes de statut :**
  * `200` : le serveur est actif.

**Exemple de réponse réussie (`200`) :**
```json
{
  "status": "ok"
}
```

**Exemple d'erreur (`404` sur une route inconnue) :**
```json
{
  "type": "about:blank",
  "title": "Ressource introuvable",
  "status": 404,
  "detail": "Aucune route ne correspond à GET /health-check."
}
```

---

## 2. GET /api/hives

Liste les ruches connues, avec filtrage optionnel par site.

* **Paramètres de chemin :** aucun.
* **Paramètres de requête :**
  * `site_id` (`string`, facultatif, non vide) : filtre les ruches appartenant à ce site (ex. `SN-CASA`). Sans valeur ou vide, toutes les ruches sont retournées.
* **Corps attendu :** aucun.
* **Codes de statut :**
  * `200` : liste des ruches retournée.

**Exemple de réponse réussie (`200`) :**
```json
[
  {
    "id": "SN-CASA-001",
    "site_id": "SN-CASA",
    "status": "active"
  }
]
```

**Exemple d'erreur (`400` sur un corps JSON mal formé si envoyé) :**
```json
{
  "type": "about:blank",
  "title": "Requête invalide",
  "status": 400,
  "detail": "Le corps de la requête n'est pas un JSON valide."
}
```

---

## 3. GET /api/hives/:id

Récupère le détail d'une ruche à partir de son identifiant.

* **Paramètres de chemin :**
  * `id` (`string`, obligatoire) : identifiant de la ruche (ex. `SN-CASA-001`).
* **Paramètres de requête :** aucun.
* **Corps attendu :** aucun.
* **Codes de statut :**
  * `200` : ruche trouvée.
  * `404` : aucune ruche ne correspond à `:id`.

**Exemple de réponse réussie (`200`) :**
```json
{
  "id": "SN-CASA-001",
  "site_id": "SN-CASA",
  "status": "active"
}
```

**Exemple d'erreur (`404`) :**
```json
{
  "type": "about:blank",
  "title": "Ressource introuvable",
  "status": 404,
  "detail": "Aucune ruche ne porte l'identifiant XX-NOPE-999."
}
```

---

## 4. POST /api/hives/:id/measures

Enregistre une nouvelle mesure envoyée par la passerelle d'un site pour la ruche `:id`.

* **Paramètres de chemin :**
  * `id` (`string`, obligatoire) : identifiant de la ruche cible.
* **Paramètres de requête :** aucun.
* **Corps attendu (`application/json`) :**
  * Obligatoires : `timestamp` (date/chaîne ISO 8601, conservé tel qu'envoyé par le capteur), `weight_kg` (nombre).
  * Facultatifs : `hive_id` (chaîne ; si présent, doit être égal à `:id`), `site_id` (chaîne), `position_lat` (nombre), `position_lon` (nombre), `temp_internal_c` (nombre), `temp_external_c` (nombre), `humidity_pct` (nombre), `acoustic_activity_score` (nombre), `battery_pct` (nombre).
* **Codes de statut :**
  * `201` : mesure enregistrée et retournée.
  * `400` : `timestamp` ou `weight_kg` manquant/invalide, `hive_id` différent de `:id`, ou JSON invalide.
  * `404` : aucune ruche ne correspond à `:id`.

**Exemple de réponse réussie (`201`) :**
```json
{
  "hive_id": "SN-CASA-001",
  "site_id": "SN-CASA",
  "timestamp": "2026-10-31T10:00:00Z",
  "position_lat": 12.5743,
  "position_lon": -16.2873,
  "weight_kg": 36.84,
  "temp_internal_c": 34.4,
  "temp_external_c": 27.1,
  "humidity_pct": 64,
  "acoustic_activity_score": 0.42,
  "battery_pct": 88
}
```

**Exemple d'erreur (`400`) :**
```json
{
  "type": "about:blank",
  "title": "Requête invalide",
  "status": 400,
  "detail": "Les champs timestamp et weight_kg sont obligatoires."
}
```

---

## 5. GET /api/hives/:id/measures

Historique paginé des mesures d'une ruche, de la plus récente à la plus ancienne.

* **Paramètres de chemin :**
  * `id` (`string`, obligatoire) : identifiant de la ruche.
* **Paramètres de requête :**
  * `limit` (`entier`, optionnel, bornes `1` à `500`, défaut `50`) : nombre maximal de mesures retournées.
  * `offset` (`entier`, optionnel, minimum `0`, défaut `0`) : décalage de pagination.
* **Corps attendu :** aucun .
* **Codes de statut :**
  * `200` : page de mesures retournée au format `{ items, limit, offset }` .
  * `400` : `limit` ou `offset` invalide (hors bornes ou non entier).
  * `404` : aucune ruche ne porte cet identifiant .

**Exemple de réponse réussie (`200`) :**
```json
{
  "items": [
    {
      "hive_id": "SN-CASA-001",
      "site_id": "SN-CASA",
      "timestamp": "2026-10-31T10:00:00Z",
      "weight_kg": 36.84
    }
  ],
  "limit": 50,
  "offset": 0
}
```

**Exemple d'erreur (`400`) :**
```json
{
  "type": "about:blank",
  "title": "Requête invalide",
  "status": 400,
  "detail": "Le paramètre limit doit être un entier compris entre 1 et 500."
}
```

---

## 6. GET /api/hives/:id/inspections

Liste les inspections enregistrées pour une ruche donnée .

* **Paramètres de chemin :**
  * `id` (`string`, obligatoire) : identifiant de la ruche .
* **Paramètres de requête :** aucun .
* **Corps attendu :** aucun .
* **Codes de statut :**
  * `200` : liste des inspections de la ruche .
  * `404` : la ruche n'existe pas .

**Exemple de réponse réussie (`200`) :**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "hive_id": "SN-CASA-001",
    "inspected_at": "2026-10-31T11:30:00Z",
    "colony_status": "normale",
    "queen_present": true,
    "observations": "Couvain régulier"
  }
]
```

**Exemple d'erreur (`404`) :**
```json
{
  "type": "about:blank",
  "title": "Ressource introuvable",
  "status": 404,
  "detail": "Aucune ruche ne porte l'identifiant XX-NOPE-999."
}
```

---

## 7. POST /api/hives/:id/inspections

Enregistre une nouvelle inspection pour la ruche `:id` .

* **Paramètres de chemin :**
  * `id` (`string`, obligatoire) : identifiant de la ruche.
* **Paramètres de requête :** aucun .
* **Corps attendu (`application/json`) :**
  * Obligatoires : `id` (chaîne UUID choisie par l'application mobile), `inspected_at` (date ISO 8601), `colony_status` (`"forte"`, `"normale"`, `"faible"` ou `"morte"`) .
  * Facultatifs : `queen_present` (booléen), `observations` (texte).
* **Codes de statut :**
  * `201` : inspection créée et retournée.
  * `400` : champ obligatoire manquant ou invalide (ex. `colony_status` hors liste autorisée, `inspected_at` ou UUID invalide, ou JSON mal formé) .
  * `404` : la ruche n'existe pas.

**Exemple de réponse réussie (`201`) :**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "hive_id": "SN-CASA-001",
  "inspected_at": "2026-10-31T11:30:00Z",
  "colony_status": "normale",
  "queen_present": true,
  "observations": "Couvain régulier"
}
```

**Exemple d'erreur (`400`) :**
```json
{
  "type": "about:blank",
  "title": "Requête invalide",
  "status": 400,
  "detail": "Le champ colony_status doit valoir forte, normale, faible ou morte."
}
```