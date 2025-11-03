# Déploiement du front Snoroc

Ce document résume le pipeline GitHub Actions et le déroulé du déploiement sur le serveur Nginx.

## Vue d’ensemble
- Trigger : `push` sur `develop`.
- Job `build` : compile l’application React et archive le dossier `build/`.
- Job `deploy` : transfère l’archive vers le serveur, remplace le dossier `build` distant puis recharge Nginx.

## Secrets requis
- `SSH_HOST`, `SSH_USER`, `SSH_KEY` — identiques à ceux utilisés pour le backend.
- Variables supplémentaires (`REACT_APP_*`) à ajouter plus tard si le build en a besoin.

## Étapes du pipeline
1. **Build**
   - Checkout du code.
   - Installation Node.js 20 + cache npm.
   - Injection de la variable `REACT_APP_VERSION` depuis `package.json`.
   - `npm ci` puis `npm run build` (sourcemaps désactivés).
   - Création et upload de `snoroc_front.tar.gz` contenant `build/`.
2. **Deploy**
   - Récupération de l’artefact.
   - Copie vers `/tmp/snoroc_front.tar.gz` sur le serveur via SCP.
   - Script SSH :
     - création de `/srv/snoroc_dev/snoroc_front` si besoin ;
     - sauvegarde éventuelle de l’ancien `build` (renommé en `build_YYYYmmddHHMMSS`) ;
     - extraction de la nouvelle archive ;
     - suppression de l’archive temporaire ;
     - `sudo systemctl reload nginx`.

## Architecture serveur
- Racine des applis : `/srv/snoroc_dev`.
- Front servi par Nginx depuis `/srv/snoroc_dev/snoroc_front/build`.
- Le build est produit dans la CI : Node/NPM ne sont pas obligatoires pour la mise en prod, mais vous pouvez les conserver pour vos tests ou scripts manuels sur le serveur.

## Rollback rapide
- Après un déploiement, l’ancien build est conservé dans `build_<timestamp>`.
- Pour revenir en arrière :
  ```bash
  sudo systemctl stop nginx
  rm -rf /srv/snoroc_dev/snoroc_front/build
  mv /srv/snoroc_dev/snoroc_front/build_<timestamp> /srv/snoroc_dev/snoroc_front/build
  sudo systemctl start nginx
  ```

## Tests automatisés
- Non exécutés pour l’instant. On pourra intercaler un job `test` (`npm test -- --watch=false`) entre `build` et `deploy` quand vous serez prêts.
