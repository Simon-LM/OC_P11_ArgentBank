/** @format */

// Stockage en mémoire pour le développement
const memoryStore = {};

// Détection de l'environnement
const isVercelProd = !!process.env.VERCEL_ENV;

// Configuration commune
const WINDOW_SIZE = 60 * 60 * 1000;
const MAX_REQUESTS = {
  "profile-update": 5,
  login: 10,
  default: 20,
};

export async function rateLimitMiddleware(req, res, operationType = "default") {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const env = process.env.NODE_ENV || "development";
  const key = `rate-limit:${env}:${ip}:${operationType}`;
  const limit = MAX_REQUESTS[operationType] || MAX_REQUESTS.default;

  try {
    if (isVercelProd) {
      // Version production avec Redis
      return await prodRateLimiter(req, res, key, limit);
    } else {
      // Version développement avec stockage mémoire
      return await devRateLimiter(req, res, key, limit);
    }
  } catch (error) {
    console.error("Rate limiting error:", error);
    // En cas d'erreur, on continue quand même
    return false;
  }
}

// Implémentation pour le développement
async function devRateLimiter(req, res, key, limit) {
  // Initialiser si nécessaire
  memoryStore[key] = memoryStore[key] || [];

  const now = Date.now();
  // Nettoyer les entrées expirées
  const windowRequests = memoryStore[key].filter(
    (time) => time > now - WINDOW_SIZE,
  );

  if (windowRequests.length >= limit) {
    res.status(429).json({
      status: 429,
      message: "Too many requests. Please try again later.",
    });
    return true;
  }

  // Ajouter cette requête
  windowRequests.push(now);
  memoryStore[key] = windowRequests;

  // Continuer normalement
  return false;
}

// Implémentation pour la production
async function prodRateLimiter(req, res, key, limit) {
  try {
    // Import dynamique pour éviter les erreurs en dev
    const { Redis } = await import("@upstash/redis");

    // Utilisation des variables d'environnement disponibles
    const redis = new Redis({
      url:
        process.env.KV_REST_API_KV_REST_API_URL ||
        process.env.UPSTASH_REDIS_REST_URL,
      token:
        process.env.KV_REST_API_KV_REST_API_TOKEN ||
        process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    const requests = (await redis.get(key)) || [];
    const now = Date.now();
    const windowRequests = requests.filter((time) => time > now - WINDOW_SIZE);

    if (windowRequests.length >= limit) {
      res.status(429).json({
        status: 429,
        message: "Too many update requests. Please try again later.",
      });
      return true;
    }

    windowRequests.push(now);
    await redis.set(key, windowRequests, { ex: 60 * 60 });

    return false;
  } catch (error) {
    console.error("Redis error:", error);
    // En cas d'erreur avec Redis, utiliser la version mémoire
    return await devRateLimiter(req, res, key, limit); // <-- Ajoutez 'limit' ici
  }
}
