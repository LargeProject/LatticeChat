import type { Service } from '../types';
import { User } from '../../db/models';
import { isEmailTaken, isUsernameTaken } from '../../db';
import { handleHttpError } from '../../util/error';

const handleEmailTaken: Service = async (req, res) => {
  const email = req.query?.email as string ?? '';
  
  try {
    const isTaken = await isEmailTaken(email);
    res.status(200).send({
      isTaken: isTaken,
    });
  } catch (error) {
    handleHttpError(error, res);
  }
};

const handleUsernameTaken: Service = async (req, res) => {
  const username = req.query?.username as string ?? '';

  try {
    const isTaken = await isUsernameTaken(username);
    res.status(200).send({
      isTaken: isTaken,
    });
  } catch (error) {
    handleHttpError(error, res);
  }
};

export { handleEmailTaken, handleUsernameTaken };
