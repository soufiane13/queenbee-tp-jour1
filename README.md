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
