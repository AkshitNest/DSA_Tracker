import { auth0 } from "../lib/auth0.js";
console.log("Auth0 instance:", auth0);
console.log("Auth0 prototype:", Object.getPrototypeOf(auth0));
console.log("Auth0 methods:", Object.getOwnPropertyNames(Object.getPrototypeOf(auth0)));
