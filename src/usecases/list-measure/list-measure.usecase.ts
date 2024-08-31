import { MeasureRepository } from '../../infra/repositories/measure/measure.repository';

export class ListMeasureUsecase {
  public constructor(private measureRepository: MeasureRepository) {}

  public static create(measureRepository: MeasureRepository) {
    return new ListMeasureUsecase(measureRepository);
  }

  public async execute(customer_code: string, measure_type?: string) {
    const measures = await this.measureRepository.findByCustomerCode(customer_code, measure_type);
    return measures.map(measure => ({
      measure_uuid: measure.measure_uuid,
      measure_datetime: measure.measure_datetime,
      measure_type: measure.measure_type,
      has_confirmed: measure.has_confirmed,
      image_url: measure.image_url
    }));
  }

  public async executeAll(measure_type?: string) {
    const measures = await this.measureRepository.findAll(measure_type);
    return measures.map(measure => ({
      measure_uuid: measure.measure_uuid,
      measure_datetime: measure.measure_datetime,
      measure_type: measure.measure_type,
      has_confirmed: measure.has_confirmed,
      image_url: measure.image_url
    }));
  }
}
