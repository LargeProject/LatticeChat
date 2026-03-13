import type {Service} from "../types.js";

const handleRegister: Service = (req, res) => {
  res.send("register"); // temporary
}

const handleLogin: Service = (req, res) => {
  res.send("login"); // temporary
}

const handleLogout: Service = (req, res) => {
  res.send("logout"); // temporary
}

//... TODO: add more auth handlers.

export { handleRegister, handleLogin, handleLogout }