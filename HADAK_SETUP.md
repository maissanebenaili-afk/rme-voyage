# 🤖 Configuration Hadak IA avec Anthropic

Hadak est maintenant alimenté par Claude AI pour des réponses intelligentes et contextuelles. Voici comment l'activer en production.

## ✅ Configuration Vercel

### 1. Obtenir une clé API Anthropic

1. Allez sur [console.anthropic.com](https://console.anthropic.com)
2. Connectez-vous ou créez un compte
3. Naviguez vers **API Keys** → **Create Key**
4. Donnez un nom (ex: "RME Voyage Hadak")
5. Copiez la clé (commence par `sk_`)

### 2. Ajouter la clé à Vercel

1. Allez sur [vercel.com/dashboard](https://vercel.com/dashboard)
2. Sélectionnez le projet **rme-voyage**
3. Allez sur **Settings** → **Environment Variables**
4. Ajoutez une nouvelle variable:
   - **Name**: `ANTHROPIC_API_KEY`
   - **Value**: Collez votre clé API (commence par `sk_`)
   - **Environments**: Production, Preview, Development
5. Cliquez **Save**

### 3. Redéployer

Après avoir ajouté la clé, Vercel redéploiera automatiquement le site avec la nouvelle configuration.

## 🔧 Configuration Locale (Développement)

Pour tester localement:

```bash
# Créez un fichier .env.local
echo "ANTHROPIC_API_KEY=sk_your_key_here" > .env.local

# Démarrez le serveur de développement
npm run dev
```

## 📋 Optionnel: Changer le modèle Claude

Par défaut, Hadak utilise `claude-3-5-sonnet-20241022`.

Pour utiliser un autre modèle, ajoutez une variable d'environnement:

```
ANTHROPIC_MODEL=claude-3-opus-20250219
```

Modèles disponibles:
- `claude-3-opus-20250219` (plus puissant, plus lent, plus cher)
- `claude-3-5-sonnet-20241022` (défaut - meilleur rapport qualité/prix)
- `claude-3-haiku-20250307` (plus rapide, moins cher, moins capable)

## 🔒 Sécurité

- La clé API ne quitte **jamais** le serveur — elle n'est pas envoyée au navigateur
- Les requêtes utilisateur sont envoyées à Anthropic; consultez leur [politique de confidentialité](https://www.anthropic.com/privacy)
- Sans la clé API, Hadak fonctionne avec la base de connaissances locale (zéro données externes)

## 💰 Coûts

Anthropic facture par token:
- **Input**: ~$0.003 par 1K tokens
- **Output**: ~$0.015 par 1K tokens

Une requête utilisateur typique (200 tokens) coûte environ **$0.01 - $0.05 USD**.

Consultez [pricing.anthropic.com](https://www.anthropic.com/pricing) pour les tarifs actuels.

## 🧪 Test

Une fois configuré, ouvrez l'app et:
1. Cliquez sur le bouton Hadak (chat bubble en bas à droite)
2. Posez une question (ex: "Combien coûte un ferry Maroc?")
3. Hadak devrait répondre intelligemment en quelques secondes

Si rien n'apparaît, consultez la console du navigateur (F12) pour les erreurs.

## 🔄 Fallback

Si la clé API n'est pas configurée OU si Anthropic est indisponible:
- Hadak affiche un message "Assistant hors ligne"
- L'utilisateur peut toujours utiliser les suggestions rapides
- Aucune erreur rouge — l'app continue de fonctionner normalement

## 📞 Support

Pour les problèmes:
- Vérifiez que la clé API est correcte (commence par `sk_`)
- Vérifiez que la clé est active (vérifiez le quota Anthropic)
- Consultez les logs Vercel: Dashboard → Project → Deployments → Runtime Logs
