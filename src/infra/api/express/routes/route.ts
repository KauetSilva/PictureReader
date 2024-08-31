import { Request, Response } from 'express';

export interface Route {
  getHandler(): (req: Request, res: Response) => Promise<void> | void;
  getPath(): string;
  getMethod(): string;
}
