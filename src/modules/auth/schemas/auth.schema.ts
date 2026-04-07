import { z } from 'zod';

export const registerSchema = z.object({
  teamName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string(),
  lastName: z.string()
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

export const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'member'])
});