import { Request, Response, Router } from 'express';
import { ListMeasureUsecase } from '../../../../../usecases/list-measure/list-measure.usecase';
import { Route } from '../route';

export class ListMeasureRoute implements Route {
  private router: Router;

  constructor(private listMeasureUsecase: ListMeasureUsecase) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(this.getPath(), this.getHandler());
  }

  private async validateMeasureType(measure_type?: string): Promise<string | null> {
    if (measure_type && !['WATER', 'GAS'].includes(measure_type.toUpperCase())) {
      return 'Tipo de medição não permitida';
    }
    return null;
  }

  private async listMeasures(req: Request, res: Response): Promise<void> {
    try {
      const { customer_code } = req.params;
      const { measure_type } = req.query;

      const validationError = await this.validateMeasureType(measure_type as string);
      if (validationError) {
        res.status(400).json({
          error_code: 'INVALID_TYPE',
          error_description: validationError,
        });
        return;
      }

      const measures = await this.listMeasureUsecase.execute(customer_code, measure_type as string);

      if (measures.length === 0) {
        res.status(404).json({
          error_code: 'MEASURES_NOT_FOUND',
          error_description: 'Nenhuma leitura encontrada',
        });
        return;
      }

      res.status(200).json({
        customer_code,
        measures,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error_code: 'INTERNAL_ERROR', error_description: 'Erro interno do servidor' });
    }
  }

  public getHandler(): (req: Request, res: Response) => Promise<void> {
    return this.listMeasures.bind(this);
  }

  public getPath(): string {
    return '/:customer_code/list';
  }

  public getMethod(): string {
    return 'get';
  }

  public static create(listMeasureUsecase: ListMeasureUsecase): ListMeasureRoute {
    return new ListMeasureRoute(listMeasureUsecase);
  }
}
