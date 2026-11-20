# Queen Bee — TP 1 : Lecture des mesures
# Queen Bee — API REST (Jour 1)

**Auteur :** Soufiane Benhabboul

## Installation et lancement

```bash
npm install
npm run dev
``` 

## Résultats des mesures

| Fichier | Lecture | Durée de l'import (ms) | Pire temps de /ping (ms) |
| :--- | :--- | :---: | :---: |
| 1 jour | bloquante | 26 | 15 |
| 1 jour | en flux | 23 | 4 |
| 30 jours | bloquante | 390 | 376 |
| 30 jours | en flux | 322 | 5 |

## Questions

1. **Pourquoi `/ping` attend-il pendant l'import bloquant ?**
   La lecture synchrone et le traitement des lignes bloquent le thread unique de la boucle d'événements de Node.js tant que l'import n'est pas terminé, ce qui retarde le traitement de `GET /ping`.

2. **La lecture en flux est-elle plus rapide ? Sinon, qu'apporte-t-elle ?**
   La lecture en flux n'est pas forcément beaucoup plus rapide globalement, mais elle rend la main à la boucle d'événements entre les morceaux/lignes afin que les autres requêtes comme `/ping` gardent une faible latence et que le fichier ne soit pas chargé d'un bloc en mémoire.

3. **Pourquoi l'effet est-il presque invisible avec le fichier d'une journée ?**
   Le fichier d'une journée ne contient que 4 800 lignes et s'exécute en quelques dizaines de millisecondes, si bien que le blocage est trop bref pour gêner nettement `/ping` par rapport au fichier de 30 jours (144 000 lignes).


   ## TP 5 — Import en masse des mesures (31 octobre)

- **Temps et écart :** L'insertion ligne à ligne a pris **12 551 ms** contre **345 ms** par lot de 1 000 lignes dans une seule transaction. L'écart vient surtout de la réduction des allers-retours réseau/protocole (round-trips) et de la validation/journalisation transactionnelle regroupée par lot au lieu de 4 800 requêtes séparées.
- **Erreur à la 2 001e mesure :** En mode ligne à ligne, les 2 000 premières mesures déjà validées restent insérées en base. En mode par lot dans une transaction, l'erreur déclenche un `ROLLBACK`, annulant l'ensemble des insertions de la transaction afin qu'aucune donnée partielle ne reste.
- **Pourquoi `pool.connect()` plutôt que `pool.query()` :** `pool.query()` peut exécuter chaque requête sur n'importe quelle connexion libre du pool, alors qu'une transaction (`BEGIN` / `COMMIT` / `ROLLBACK`) exige d'épingler toutes les requêtes sur une seule et même connexion dédiée.
- **Absence de `client.release()` dans `finally` après 10 erreurs :** Chaque erreur laisserait la connexion empruntée non libérée, épuisant progressivement les connexions du pool (`max`) jusqu'à provoquer des timeouts (`connectionTimeoutMillis`) ou bloquer les nouvelles requêtes.