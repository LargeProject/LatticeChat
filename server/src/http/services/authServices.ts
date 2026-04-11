import type { Service } from '../types';
import { handleHttpError } from '../../util/error';
import { UserService } from '../../db';

const handleEmailTaken: Service = async (req, res) => {
  const email = (req.body?.email as string) ?? '';

  try {
    const isTaken = await UserService.isEmailTaken(email);
    res.status(200).send({
      isTaken: isTaken,
    });
  } catch (error) {
    handleHttpError(error, res);
  }
};

const handleUsernameTaken: Service = async (req, res) => {
  const username = (req.query?.username as string) ?? '';

  try {
    const isTaken = await UserService.isUsernameTaken(username);
    res.status(200).send({
      isTaken: isTaken,
    });
  } catch (error) {
    handleHttpError(error, res);
  }
};

const handleEmailVerified: Service = async (req, res) => {
  const email = (req.body?.email as string) ?? '';

  try {
    const isVerified = await UserService.isEmailVerified(email);
    res.status(200).send({
      isVerified: isVerified,
    });
  } catch (error) {
    handleHttpError(error, res);
  }
};

export { handleEmailTaken, handleUsernameTaken, handleEmailVerified };
