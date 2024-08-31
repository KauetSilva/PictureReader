import { Api } from "../api";
import express, { Express, Request, Response, Router } from "express";
import { Route } from "./routes/route";

export class ApiExpress implements Api {
    private app: Express;

    // Construtor público para permitir a criação de instâncias
    public constructor(routes: Route[]) {
        this.app = express();
        this.app.use(express.json());
        this.addRoutes(routes);
    }

    // Método estático para criar instâncias
    public static create(routes: Route[]) {
        return new ApiExpress(routes);
    }

    private addRoutes(routes: Route[]) {
        routes.forEach((route) => {
            const path = route.getPath();
            const method = route.getMethod();
            const handler = route.getHandler();

            // Adiciona a rota baseada no método HTTP
            switch (method.toLowerCase()) {
                case 'get':
                    this.app.get(path, handler);
                    break;
                case 'post':
                    this.app.post(path, handler);
                    break;
                case 'put':
                    this.app.put(path, handler);
                case 'patch':
                    this.app.patch(path, handler);
                    break;
                case 'delete':
                    this.app.delete(path, handler);
                    break;
                default:
                    throw new Error(`Método HTTP não suportado: ${method}`);
            }
        });
    }

    public start(port: number) {
        this.app.listen(port, () => {
            console.log(`Server running on port ${port}`);
            this.listRoutes();
        });
    }

    private listRoutes() {
        const routes = this.app._router.stack
            .filter((route: any) => route.route)
            .map((route: any) => {
                return {
                    path: route.route.path,
                    method: route.route.stack[0].method,
                };
            });

        console.log(routes);
    }
}
