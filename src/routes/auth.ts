import { Request, Response, Router } from 'express';
import { StreamChat } from 'stream-chat';
import { hashSync, compareSync } from 'bcrypt'; // 🧂 Kita gunakan hashSync dan compareSync dari bcrypt
import { USERS, UserRole } from '../models/user';
import dotenv from 'dotenv';
import { sign } from 'jsonwebtoken';

//  Memuat variabel lingkungan dari file .env
dotenv.config();

const router = Router();

//  Ambil konfigurasi penting dari .env
const SALT = process.env.SALT as string;
const streamApiKey = process.env.STREAM_API_KEY;
const streamApiSecret = process.env.STREAM_API_SECRET;

//  Cek apakah API key dan secret sudah disiapkan
if (!streamApiKey || !streamApiSecret) {
  throw new Error(
    'STREAM_API_KEY and STREAM_API_SECRET must be defined in environment variables'
  );
}

//  Inisialisasi koneksi dengan Stream Chat
const client = StreamChat.getInstance(streamApiKey, streamApiSecret);

//  Endpoint untuk registrasi mahasiswa baru
router.post('/register', async (req: Request, res: Response): Promise<any> => {
  const { email, password, name, department } = req.body;

  //  Validasi data input
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

  //  Cek apakah user sudah ada
  const existingUser = USERS.find((user) => user.email === email);

  if (existingUser) {
    return res.status(400).json({
      message: 'User already exists.',
    });
  }

  try {
    //  Hash password sebelum disimpan
    const hashed_password = hashSync(password, SALT);
    const id = Math.random().toString(36).substring(2, 9); // Generate ID random

    const user = {
      id,
      email,
      name,
      department,
      hashed_password,
      role: UserRole.Student, //  Default-nya sebagai mahasiswa
    };

    USERS.push(user); //  Simpan user ke memory (mock database)

    //  Sinkronisasi user ke Stream
    await client.upsertUser({
      id,
      email,
      name: name || email,
    });

    const token = client.createToken(id); // 🪙 Token untuk Stream Chat

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        department: user.department,
        role: user.role,
      },
    });
  } catch (e) {
    return res.json({
      message: 'User already exists.',
    });
  }
});

//  Endpoint login
router.post('/login', async (req: Request, res: Response): Promise<any> => {
  const { email, password } = req.body;

  //  Cari user berdasarkan email
  const user = USERS.find((user) => user.email === email);

  //  Kalau user tidak ditemukan atau password salah, tolak akses
  if (!user || !compareSync(password, user.hashed_password)) {
    return res.status(400).json({
      message: 'Invalid credentials.',
    });
  }

  //  Buat token untuk Stream Chat
  const token = client.createToken(user.id);

  //  Buat token JWT untuk otentikasi umum
  const jwt = sign({ userId: user.id }, process.env.JWT_SECRET!);

  return res.json({
    token,
    jwt,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      department: user.department,
      role: user.role,
    },
  });
});

//  Endpoint khusus untuk membuat akun professor
router.post(
  '/create-professor',
  async (req: Request, res: Response): Promise<any> => {
    const { email, password, name, department } = req.body;

    //  Hash password
    const hashed_password = hashSync(password, SALT);
    const id = Math.random().toString(36).substring(2, 9); //  ID random

    const user = {
      id,
      email,
      name,
      department,
      hashed_password,
      role: UserRole.Professor, // 👨 Peran professor
    };

    USERS.push(user); //  Tambahkan ke list user lokal

    //  Sinkronisasi ke Stream
    await client.upsertUser({
      id,
      email,
      name: name || email,
      role: UserRole.Professor,
    });

    return res.json({
      message: 'Professor user created successfully.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        department: user.department,
        role: user.role,
      },
    });
  }
);

export default router; //  Jangan lupa ekspor router-nya
