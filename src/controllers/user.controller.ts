import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { fetchIpDetails } from '../services/user.service';

export const getIpInfo = async (req: Request, res: Response) => {
  try {
    const ip =
      req.query.ip as string ||
      req.headers['x-forwarded-for']?.toString().split(',')[0] || // real client IP
      req.socket?.remoteAddress || // fallback (usually local IP)
      '';

    // if (!ip) {
    //   return res.status(400).json({ message: 'Missing IP address in query params' });
    // }

    const data = await fetchIpDetails(ip);
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch IP details' });
  }
};
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
