import { Request, Response, Router } from 'express';
import { StreamChat } from 'stream-chat';
import { hashSync, compareSync } from 'bcrypt';
import { USERS, UserRole } from '../models/user';
import dotenv from 'dotenv';
import { sign } from 'jsonwebtoken';

// Load environment variables
dotenv.config();

const router = Router();

const SALT = parseInt(process.env.SALT || '10', 10); // Ensure SALT is a valid number
const streamApiKey = process.env.STREAM_API_KEY;
const streamApiSecret = process.env.STREAM_API_SECRET;

if (!streamApiKey || !streamApiSecret) {
  throw new Error(
    'STREAM_API_KEY and STREAM_API_SECRET must be defined in environment variables'
  );
}

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be defined in environment variables');
}

const client = StreamChat.getInstance(streamApiKey, streamApiSecret);

// Register endpoint
router.post('/register', async (req: Request, res: Response): Promise<any> => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: 'Email and password are required.',
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      message: 'Password must be at least 6 characters.',
    });
  }

  const existingUser = USERS.find((user) => user.email === email);

  if (existingUser) {
    return res.status(400).json({
      message: 'User already exists.',
    });
  }

  try {
    const hashed_password = hashSync(password, SALT);
    const id = Math.random().toString(36).substring(2, 9);
    const user = {
      id,
      email,
      hashed_password,
      role: UserRole.Student,
    };
    USERS.push(user);

    await client.upsertUser({
      id,
      email,
      name: email,
    });

    const token = client.createToken(id);

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (e) {
    console.error('Error during registration:', e);
    return res.status(500).json({
      message: 'An error occurred during registration.',
    });
  }
});

// Login endpoint
router.post('/login', async (req: Request, res: Response): Promise<any> => {
  const { email, password } = req.body;
  const user = USERS.find((user) => user.email === email);

  if (!user || !compareSync(password, user.hashed_password)) {
    return res.status(400).json({
      message: 'Invalid credentials.',
    });
  }

  const token = client.createToken(user.id);

  const jwt = sign({ userId: user.id }, process.env.JWT_SECRET!);

  return res.json({
    token,
    jwt,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  });
});

// Endpoint to create a professor user
router.post(
  '/create-professor',
  async (req: Request, res: Response): Promise<any> => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters.',
      });
    }

    const existingUser = USERS.find((user) => user.email === email);

    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists.',
      });
    }

    try {
      const hashed_password = hashSync(password, SALT);
      const id = Math.random().toString(36).substring(2, 9);
      const user = {
        id,
        email,
        hashed_password,
        role: UserRole.Professor,
      };

      USERS.push(user);

      await client.upsertUser({
        id,
        email,
        name: email,
        role: UserRole.Professor,
      });

      return res.json({
        message: 'Professor user created successfully.',
        user,
      });
    } catch (e) {
      console.error('Error during professor creation:', e);
      return res.status(500).json({
        message: 'An error occurred while creating the professor user.',
      });
    }
  }
);

export default router;
