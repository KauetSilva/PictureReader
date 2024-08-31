import dotenv from 'dotenv';
import { ApiExpress } from "./infra/api/express/api.express";
import { CreateMeasureRoute } from "./infra/api/express/routes/measure/create-measure.express.route";
import { ConfirmMeasureRoute } from "./infra/api/express/routes/measure/confirm-measure.express.route";
import { ListMeasureRoute } from "./infra/api/express/routes/measure/list-measure.express.route";
import { ViewImageRoute } from "./infra/api/express/routes/measure/view-image.express.route";
import { MeasureRepository } from "./infra/repositories/measure/measure.repository";
import { CreateMeasureUsecase } from "./usecases/upload-measure/upload-measure.usecase";
import { ConfirmMeasureUsecase } from "./usecases/confirm-measure/confirm-measure.usecases";
import { ListMeasureUsecase } from "./usecases/list-measure/list-measure.usecase";

dotenv.config();

function main() {
  const measureRepository = new MeasureRepository();

  const createMeasureUsecase = new CreateMeasureUsecase(measureRepository);
  const confirmMeasureUsecase = new ConfirmMeasureUsecase(measureRepository);
  const listMeasureUsecase = new ListMeasureUsecase(measureRepository);

  const createRoute = new CreateMeasureRoute(createMeasureUsecase);
  const confirmRoute = new ConfirmMeasureRoute(confirmMeasureUsecase);
  const listRoute = new ListMeasureRoute(listMeasureUsecase);
  const viewImageRoute = new ViewImageRoute();

  const api = new ApiExpress([createRoute, confirmRoute, listRoute, viewImageRoute]);
  const port = 80;
  
  api.start(port);
}

main();
