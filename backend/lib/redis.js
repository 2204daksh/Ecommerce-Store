import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

// In-memory fallback cache used when Redis is unavailable
const memoryCache = new Map();

const hasRedisUrl = process.env.UPSTASH_REDIS_URL && process.env.UPSTASH_REDIS_URL.trim() !== "";

let redisClient = null;
let redisAvailable = false;

if (hasRedisUrl) {
	redisClient = new Redis(process.env.UPSTASH_REDIS_URL, {
        retryStrategy: (times) => {
			const delay = Math.min(1000 * Math.pow(2, times), 30000);
            console.warn(`Redis connection lost. Attempting to reconnect in ${delay / 1000} seconds...`);

			if (times > 5) {
				console.error("Redis reconnect attempts stopped");
				return null;
			}

			return delay;
		},
		maxRetriesPerRequest: null,
		commandTimeout: 5000,
	});

	redisClient.on("error", (err) => {
		redisAvailable = false;
		console.error(
			"Redis error detected. Switching to in-memory cache:",
			err.message
		);
	});

	redisClient.on("connect", () => {
		redisAvailable = true;
		console.log("Connected to Redis");
	});

	redisClient.on("close", () => {
		redisAvailable = false;
		console.warn(
			"Redis connection closed. Using in-memory cache until reconnect succeeds"
		);
	});

	redisClient.on("reconnecting", () => {
		console.log("Attempting to reconnect to Redis...");
	});

	redisClient.on("ready", () => {
		redisAvailable = true;
		console.log("Redis connection is ready");
	});
} else {
	console.warn("No UPSTASH_REDIS_URL configured — using in-memory cache only");
}

// ---- Wrapper that falls back to in-memory cache ----
const redisFallback = {
	async get(key) {
		if (redisAvailable && redisClient) {
			try {
				const value = await redisClient.get(key);
				if (value !== null) return value;
			} catch (err) {
				redisAvailable = false;
				console.warn(`Redis get failed for "${key}", using in-memory fallback:`, err.message);
			}
		}
		const entry = memoryCache.get(key);
		if (!entry) return null;
		if (entry.expiry && Date.now() > entry.expiry) {
			memoryCache.delete(key);
			return null;
		}
		return entry.value;
	},

	async set(key, value, ...args) {
		if (redisAvailable && redisClient) {
			try {
				return await redisClient.set(key, value, ...args);
			} catch (err) {
				redisAvailable = false;
				console.warn(`Redis set failed for "${key}", using in-memory fallback:`, err.message);
			}
		}
		let ttlSeconds = null;
		for (let i = 0; i < args.length; i++) {
			if (args[i] === "EX" && i + 1 < args.length) {
				ttlSeconds = args[i + 1];
				break;
			}
		}
		memoryCache.set(key, {
			value,
			expiry: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null,
		});
		return "OK";
	},

	async setex(key, seconds, value) {
		if (redisAvailable && redisClient) {
			try {
				return await redisClient.setex(key, seconds, value);
			} catch (err) {
				redisAvailable = false;
				console.warn(`Redis setex failed for "${key}", using in-memory fallback:`, err.message);
			}
		}
		memoryCache.set(key, {
			value,
			expiry: Date.now() + seconds * 1000,
		});
		return "OK";
	},

	async del(key) {
		if (redisAvailable && redisClient) {
			try {
				return await redisClient.del(key);
			} catch (err) {
				redisAvailable = false;
				console.warn(`Redis del failed for "${key}", using in-memory fallback:`, err.message);
			}
		}
		memoryCache.delete(key);
		return 1;
	},

	get status() {
		return redisAvailable ? "redis" : "memory-fallback";
	},
};

export { redisFallback as redis };
