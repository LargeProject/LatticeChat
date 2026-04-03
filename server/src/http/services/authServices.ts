import { Service } from '../types';
import { User } from '../../db/models';

const handleEmailTaken: Service = async (req, res) => {
  const email = req.query.email as string;
  if (!email) {
    res.status(400).json({ error: 'Email is required' });
    return;
  }
  const user = await User.findOne({ email: email });
  res.json({ taken: user != null });
};

const handleUsernameTaken: Service = async (req, res) => {
  const username = req.query.username as string;
  if (!username) {
    res.status(400).json({ error: 'Username is required' });
    return;
  }
  const user = await User.findOne({ username: username });
  res.json({ taken: user != null });
};

export { handleEmailTaken, handleUsernameTaken };
