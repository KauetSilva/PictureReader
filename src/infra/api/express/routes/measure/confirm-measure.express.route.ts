import { Request, Response, Router } from 'express';
import { ConfirmMeasureUsecase } from '../../../../../usecases/confirm-measure/confirm-measure.usecases';
import { Route } from '../route';

export class ConfirmMeasureRoute implements Route {
  private router: Router;

  constructor(private confirmMeasureUsecase: ConfirmMeasureUsecase) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.patch('/confirm', this.confirmMeasure.bind(this));
  }

  private async confirmMeasure(req: Request, res: Response): Promise<void> {
    try {
      const { measure_uuid, confirmed_value } = req.body;

      // Valida se measure_uuid e confirmed_value são fornecidos e são do tipo correto
      if (typeof measure_uuid !== 'string' || typeof confirmed_value !== 'number') {
        res.status(400).json({
          error_code: 'INVALID_DATA',
          error_description: 'Dados fornecidos no corpo da requisição são inválidos',
        });
        return;
      }

      // Valida se a leitura existe e se já foi confirmada
      const result = await this.confirmMeasureUsecase.execute(measure_uuid, confirmed_value);

      if (result === 'NOT_FOUND') {
        res.status(404).json({
          error_code: 'MEASURE_NOT_FOUND',
          error_description: 'Leitura não encontrada',
        });
      } else if (result === 'ALREADY_CONFIRMED') {
        res.status(409).json({
          error_code: 'CONFIRMATION_DUPLICATE',
          error_description: 'Leitura já confirmada',
        });
      } else {
        res.status(200).json({ success: true });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error_code: 'INTERNAL_ERROR',
        error_description: 'Erro interno do servidor',
      });
    }
  }

  public getHandler(): (req: Request, res: Response) => Promise<void> {
    return this.confirmMeasure.bind(this);
  }

  public getPath(): string {
    return '/confirm';
  }

  public getMethod(): string {
    return 'patch';
  }

  public static create(confirmMeasureUsecase: ConfirmMeasureUsecase): ConfirmMeasureRoute {
    return new ConfirmMeasureRoute(confirmMeasureUsecase);
  }
}
