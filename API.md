# SAFAR Platform API Documentation

Welcome to the SAFAR (Smart Assistant for African & Mediterranean Routes) API. This document provides comprehensive information about all available endpoints and integration points.

## Overview

SAFAR is a conversational AI travel assistant designed for diaspora communities traveling between Europe and North Africa. The platform uses a multi-agent architecture with specialized sub-agents handling different aspects of travel planning.

### Base URL

- **Production:** `https://rme-voyage.vercel.app/api`
- **Development:** `http://localhost:3000/api`

### Authentication

Currently, endpoints use `userId` for user identification. Full JWT authentication coming soon.

### Rate Limiting

- **Free tier:** 10 messages/day, 1 tip/day
- **Premium tier:** Unlimited messages, 50 tips/day
- **Rate limit headers:** `X-RateLimit-Remaining`, `X-RateLimit-Reset`

---

## Endpoints

### 1. Chat (`/api/chat`)

Main conversational endpoint. Routes user messages to appropriate sub-agents (Navigator, Localizer, Community, Budget, Emergency).

#### Request

```bash
POST /api/chat
Content-Type: application/json

{
  "message": "What's the best route from Paris to Marrakech?",
  "userId": "user-123",
  "language": "en",
  "conversationHistory": [
    {
      "role": "user",
      "content": "Hello",
      "timestamp": "2026-09-19T12:00:00Z"
    }
  ]
}
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `message` | string | Yes | User's question/input |
| `userId` | string | Yes | Unique user identifier |
| `language` | string | No | Response language (`da`, `fr`, `en`, `ar`, `es`). Default: `en` |
| `conversationHistory` | array | No | Previous messages for context |

#### Response

```json
{
  "success": true,
  "response": {
    "text": "From Paris to Marrakech: You can take a flight (2-3h, €80-200) or combine train+ferry (14-18h, €100-150). Most travelers fly from CDG or Orly to Marrakech.",
    "agent": "NAVIGATOR",
    "confidence": 0.85,
    "metadata": {
      "queryType": "route",
      "origin": "Paris",
      "destination": "Marrakech"
    },
    "followups": [
      "Ask about specific modes (ferry, flight, train)",
      "Request current prices",
      "Get weather/climate info"
    ]
  },
  "timestamp": "2026-09-19T12:30:45Z"
}
```

#### Sub-Agents

| Agent | Triggers | Capabilities |
|-------|----------|--------------|
| **NAVIGATOR** | route, direction, ferry, transport, distance | Route planning, ferry schedules, transport options |
| **LOCALIZER** | prayer, weather, halal, mosque, pharmacy, SIM | Prayer times, weather, local services |
| **COMMUNITY** | tips, recommend, advice, travelers, experiences | Community recommendations, user tips, ratings |
| **BUDGET** | cost, budget, price, exchange, currency | Trip budgeting, exchange rates, cost estimation |
| **EMERGENCY** | emergency, help, police, hospital, accident | Emergency contacts, urgent assistance |

---

### 2. Tips (`/api/tips`)

Browse and submit community travel tips.

#### GET: Fetch Tips

```bash
GET /api/tips?location=Marrakech&category=accommodation&sort=rating
```

##### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `location` | string | all | Filter by destination |
| `category` | string | all | Filter by category (accommodation, food, transport, safety, practical) |
| `sort` | string | rating | Sort by `rating`, `upvotes`, or `recent` |

##### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "tip-123",
      "user": "Fatima_Paris",
      "tip": "Riad Karmela has amazing tagine and free WiFi. Book ahead!",
      "category": "accommodation",
      "rating": 4.8,
      "upvotes": 234
    }
  ],
  "count": 1,
  "location": "Marrakech",
  "category": "all"
}
```

#### POST: Submit Tip

```bash
POST /api/tips
Content-Type: application/json

{
  "location": "Marrakech",
  "category": "accommodation",
  "content": "Riad Karmela has amazing tagine and free WiFi",
  "userId": "user-123"
}
```

##### Response

```json
{
  "success": true,
  "message": "Tip submitted successfully",
  "data": {
    "id": "tip-456",
    "user": "User_3fb2",
    "tip": "Riad Karmela has amazing tagine",
    "category": "accommodation",
    "rating": 0,
    "upvotes": 0
  }
}
```

---

### 3. Trips (`/api/trips`)

Manage travel itineraries and trip planning.

#### GET: Fetch User's Trips

```bash
GET /api/trips?userId=user-123&status=planning
```

##### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `userId` | string | User identifier (required) |
| `status` | string | Filter by status: `planning`, `ongoing`, `completed` |

##### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "trip-789",
      "userId": "user-123",
      "origin": "Paris",
      "destination": "Marrakech",
      "startDate": "2026-10-15",
      "endDate": "2026-10-22",
      "budgetUsd": 1500,
      "currency": "USD",
      "status": "planning",
      "createdAt": "2026-09-19T12:00:00Z",
      "updatedAt": "2026-09-19T12:00:00Z"
    }
  ],
  "count": 1
}
```

#### POST: Create Trip

```bash
POST /api/trips
Content-Type: application/json

{
  "userId": "user-123",
  "origin": "Paris",
  "destination": "Marrakech",
  "startDate": "2026-10-15",
  "endDate": "2026-10-22",
  "budgetUsd": 1500,
  "currency": "USD"
}
```

##### Response

```json
{
  "success": true,
  "message": "Trip created successfully",
  "data": {
    "id": "trip-789",
    "userId": "user-123",
    "origin": "Paris",
    "destination": "Marrakech",
    "startDate": "2026-10-15",
    "endDate": "2026-10-22",
    "budgetUsd": 1500,
    "currency": "USD",
    "status": "planning",
    "createdAt": "2026-09-19T12:00:00Z",
    "updatedAt": "2026-09-19T12:00:00Z"
  }
}
```

#### PUT: Update Trip

```bash
PUT /api/trips
Content-Type: application/json

{
  "tripId": "trip-789",
  "userId": "user-123",
  "status": "ongoing",
  "budgetUsd": 1800
}
```

#### DELETE: Delete Trip

```bash
DELETE /api/trips?tripId=trip-789&userId=user-123
```

---

### 4. Hadak (Legacy) (`/api/hadak`)

Legacy endpoint for basic chat. Kept for backward compatibility.

```bash
POST /api/hadak
Content-Type: application/json

{
  "message": "Salam, shkun?",
  "lang": "da"
}
```

**Note:** Use `/api/chat` for new implementations.

---

## Language Support

SAFAR supports 5 languages with dedicated system prompts and keyword detection:

| Code | Language | Region | Keywords |
|------|----------|--------|----------|
| `da` | Darija | Morocco | salam, hna, shnu |
| `fr` | Français | France/Belgium/Canada | bonjour, s'il vous plaît |
| `en` | English | UK/US/International | hello, please |
| `ar` | العربية | Saudi Arabia/Egypt/UAE | السلام, أهلا |
| `es` | Español | Spain/Latin America | hola, por favor |

---

## Error Handling

### Common Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 400 | Bad Request | Check required parameters |
| 401 | Unauthorized | Provide valid userId |
| 403 | Forbidden | Check subscription tier |
| 404 | Not Found | Resource doesn't exist |
| 429 | Rate Limited | Wait before next request |
| 500 | Server Error | Try again or contact support |
| 503 | Service Unavailable | Fallback to local knowledge base |

### Example Error Response

```json
{
  "error": "Rate limit reached",
  "fallback": true,
  "retryAfter": 3600
}
```

---

## Subscription Tiers

### Free Tier
- 10 messages/day
- Voice input
- Community tips access
- Basic trip planner
- Multi-language support
- No PDF export

### Premium Tier ($4.99/month)
- Unlimited messages
- Voice input & output
- PDF trip export
- Real-time alerts (ferry delays, weather)
- Priority support
- Advanced trip analytics
- Community contributor badge

---

## WebSocket (Coming Soon)

Real-time updates for:
- Ferry schedule changes
- Weather alerts
- Traffic conditions
- Emergency notifications

```javascript
// Coming in Phase 2
const ws = new WebSocket('wss://rme-voyage.vercel.app/ws');
ws.onmessage = (event) => {
  const update = JSON.parse(event.data);
  // Handle real-time updates
};
```

---

## Integration Examples

### JavaScript/TypeScript

```typescript
async function askSafar(message: string, userId: string) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      userId,
      language: 'en'
    })
  });
  
  const data = await response.json();
  console.log(data.response.text);
}

askSafar('Best route to Casablanca?', 'user-123');
```

### Python

```python
import requests

response = requests.post(
  'https://rme-voyage.vercel.app/api/chat',
  json={
    'message': 'What are prayer times in Fez?',
    'userId': 'user-123',
    'language': 'en'
  }
)

print(response.json()['response']['text'])
```

### cURL

```bash
curl -X POST https://rme-voyage.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Ferry from Tangier to Barcelona?",
    "userId": "user-123",
    "language": "en"
  }'
```

---

## SDKs

Official SDKs coming soon:
- JavaScript/TypeScript
- Python
- Swift (iOS)
- Kotlin (Android)

---

## Support & Feedback

- **Email:** support@safar-travel.app
- **Discord:** https://discord.gg/safar-travel
- **GitHub Issues:** https://github.com/safar-travel/platform/issues

---

## Changelog

### v1.0.0 (2026-09-19)
- Initial API release
- 5 specialized sub-agents
- Multi-language support
- Community tips system
- Trip planning endpoints

### Roadmap
- **v1.1:** Real-time ferry alerts
- **v1.2:** Voice output (TTS)
- **v1.3:** WebSocket real-time updates
- **v2.0:** Mobile app native SDKs

---

## Terms & Conditions

By using the SAFAR API, you agree to:
1. Not use the service for automated bulk requests
2. Respect rate limits
3. Not scrape or redistribute content
4. Follow local laws and regulations

For full terms, see: https://safar-travel.app/terms
