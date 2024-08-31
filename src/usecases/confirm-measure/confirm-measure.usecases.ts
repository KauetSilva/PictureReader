import { MeasureRepository } from '../../infra/repositories/measure/measure.repository';

export class ConfirmMeasureUsecase {
  constructor(private measureRepository: MeasureRepository) {}

  public static create(measureRepository: MeasureRepository) {
    return new ConfirmMeasureUsecase(measureRepository);
  }

  public async execute(measure_uuid: string, confirmed_value: number): Promise<'SUCCESS' | 'NOT_FOUND' | 'ALREADY_CONFIRMED'> {
    // Verifica se a leitura existe
    const measure = await this.measureRepository.findByUUID(measure_uuid) as any;

    if (!measure) {
      return 'NOT_FOUND';
    }

    // Verifica se a leitura já foi confirmada
    if (measure.confirmed_value === true) {
      return 'ALREADY_CONFIRMED';
    }

    // Atualiza o valor confirmado
    await this.measureRepository.update(measure_uuid, confirmed_value);

    return 'SUCCESS';
  }
}
