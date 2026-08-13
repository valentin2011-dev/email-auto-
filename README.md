[README.md](https://github.com/user-attachments/files/31021337/README.md)
# V-Clients

Première PWA de démonstration pour V-Développement.

## Fonctionnalités V1

- Interface inspirée du design fourni
- Ajout de clients
- Nom + adresse email
- Liste des clients
- Consultation des informations d'un client
- Suppression d'un client
- Sauvegarde locale dans le navigateur
- Paramètres avec email personnel
- Thème sombre / clair
- Installation comme PWA
- Structure prête pour le futur webhook Make

## Connexion Make

Dans `app.js`, dans le `submit` du formulaire, le bloc `fetch("TON_WEBHOOK_MAKE"...` est déjà préparé.

Il faudra remplacer `TON_WEBHOOK_MAKE` par l'URL du webhook Make.

Le webhook pourra recevoir :

```json
{
  "name": "Jean Dupont",
  "email": "jean@example.com",
  "ownerEmail": "moi@example.com"
}
```

Make pourra ensuite :
1. envoyer le mail de bienvenue au client ;
2. envoyer le mail de confirmation au propriétaire ;
3. créer/enregistrer le client dans Notion.
