import type {Service, UserRequest} from "../types.js";

const handleGetUserInfo: Service = (req: UserRequest, res) => {
  const user = req.userSessionInfo.user;
  res.status(200).send(user);
}

export {handleGetUserInfo};