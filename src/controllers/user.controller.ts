import { Request, Response } from 'express';
import prisma from '../services/user.service';

export const getAllUsers = async (_: Request, res: Response) => {
  const users = await prisma.user.findMany();
  res.json(users);
};

export const createUser = async (req: Request, res: Response) => {
  const { name, email } = req.body;
  try {
    const newUser = await prisma.user.create({ data: { name, email } });
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ error: 'Email must be unique.' });
  }
};
