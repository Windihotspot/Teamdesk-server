import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import {
  registerSchema,
  loginSchema,
  inviteSchema,
} from "../schema/auth.schema";

export class AuthController {
  static async register(req: Request, res: Response) {
    const body = registerSchema.parse(req.body);
    const data = await AuthService.register(body);

    res.status(201).json(data);
  }

  static async login(req: Request, res: Response) {
    const body = loginSchema.parse(req.body);
    const data = await AuthService.login(body);

    res.json(data);
  }

  static async invite(req: Request, res: Response) {
    const body = inviteSchema.parse(req.body);

    const teamId = (req as any).user.teamId;

    const data = await AuthService.inviteMember(teamId, body);

    res.json(data);
  }
}
