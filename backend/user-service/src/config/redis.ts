import { createClient, type RedisClientType } from "redis";

const REDIS_URL = process.env.REDIS_URL;

if(!REDIS_URL){
    throw new Error("REDIS url not present in env");
}

const redisClient: RedisClientType = createClient({
    url : REDIS_URL,
});

redisClient.on("error",(err)=> console.log("Redis Error", err))

export async function connectRedis(){
    if(!redisClient.isOpen){
        await redisClient.connect();
        console.log("Redis connected");
    }
}

export default redisClient;