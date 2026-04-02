import { Service } from '../types';
import { User } from '../../db';

const handleGetBasicUserInformation: Service = async (req, res) => {
  const userId = req.params.id;
  const user = await User.findById(userId);

  if (user == null) {
    res.status(404).send({ success: false, message: 'User not found' });
    return;
  }

  // TODO: create type in shared directory
  const userInformation = {
    usernameDisplay: user.displayUsername,
    biography: user.biography,
    createdAt: user.createdAt,
  };

  res.status(200).send({
    success: true,
    message: 'User successfully found',
    data: userInformation,
  });
};

export { handleGetBasicUserInformation };
