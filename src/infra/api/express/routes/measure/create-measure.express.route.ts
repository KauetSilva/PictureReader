import { Request, Response, Router } from 'express';
import { CreateMeasureUsecase } from '../../../../../usecases/upload-measure/upload-measure.usecase';
import { Route } from '../route';

export class CreateMeasureRoute implements Route {
  private router: Router;

  constructor(private createMeasureUsecase: CreateMeasureUsecase) {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/upload', this.createMeasure.bind(this));
  }

  private async createMeasure(req: Request, res: Response): Promise<void> {
    try {
      const { customer_code, image, measure_datetime, measure_type } = req.body;
  
      // Valida o corpo da requisição
      if (!customer_code || !image || !measure_datetime || !measure_type) {
        res.status(400).json({
          error_code: 'INVALID_DATA',
          error_description: 'Dados fornecidos são inválidos',
        });
        return;
      }

      const cleanedImage = image.replace(/^data:image\/[a-zA-Z]+;base64,/, '');

      if (!this.isBase64Image(cleanedImage)) {
        res.status(400).json({
          error_code: 'INVALID_IMAGE',
          error_description: 'Formato da imagem é inválido',
        });
        return;
      }
  
      // Valida o tipo de medição
      if (!['WATER', 'GAS'].includes(measure_type)) {
        res.status(400).json({
          error_code: 'INVALID_TYPE',
          error_description: 'Tipo de medição não permitido',
        });
        return;
      }
  
      // Converte measure_datetime para Date
      const measureDate = new Date(measure_datetime);
      if (isNaN(measureDate.getTime())) {
        res.status(400).json({
          error_code: 'INVALID_DATE',
          error_description: 'Data fornecida é inválida',
        });
        return;
      }
  

      
      // Chama o use case
      try {
        const result = await this.createMeasureUsecase.execute(
          customer_code,
          cleanedImage,
          measureDate,
          measure_type
        );
  
        res.status(200).json(result);
      } catch (error: any) {
        if (error.message === 'Leitura do mês já realizada') {
          res.status(409).json({
            error_code: 'DOUBLE_REPORT',
            error_description: 'Leitura do mês já realizada',
          });
        } else {
          res.status(500).json({
            error_code: 'INTERNAL_ERROR',
            error_description: 'Erro interno do servidor',
          });
        }
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error_code: 'INTERNAL_ERROR', error_description: 'Erro interno do servidor' });
    }
  }
    
  
  
  private isBase64Image(str: string): boolean {
    const base64String = str.replace(/^data:image\/[a-zA-Z]+;base64,/, '');
  
    const base64Pattern = /^[A-Za-z0-9+/=]+$/;
    return base64Pattern.test(base64String) && (base64String.length % 4 === 0);
  }  
  
  

  public getHandler(): (req: Request, res: Response) => Promise<void> {
    return this.createMeasure.bind(this);
  }

  public getPath(): string {
    return '/upload';
  }

  public getMethod(): string {
    return 'post';
  }

  public static create(createMeasureUsecase: CreateMeasureUsecase): CreateMeasureRoute {
    return new CreateMeasureRoute(createMeasureUsecase);
  }
}
