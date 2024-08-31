import { Request, Response } from 'express';
import path from 'path';
import { Route } from '../route';

export class ViewImageRoute implements Route {
    public getPath() {
        return '/images/:filename';
    }

    public getMethod() {
        return 'get';
    }

    public getHandler() {
        return (req: Request, res: Response) => {
            const { filename } = req.params;
            const imagePath = path.join(__dirname, '../../../../../temp', filename);

            res.sendFile(imagePath, (err) => {
                if (err) {
                    res.status(404).send('Image not found');
                }
            });
        };
    }
}
