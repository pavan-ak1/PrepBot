export const SERVICES = {
  USER: process.env.USER_SERVICE || "http://localhost:8080",
  JOBPREP: process.env.JOBPREP_SERVICE || "http://localhost:8081",
  SESSION: process.env.SESSION_SERVICE || "http://localhost:8082",
};

console.log("Services:", SERVICES);