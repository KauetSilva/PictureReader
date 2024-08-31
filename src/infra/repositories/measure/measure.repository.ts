import { PrismaClient, Measure as PrismaMeasure } from '@prisma/client';
import { Measure } from '../../../domain/measure/entity/measure';

export class MeasureRepository {
  private prisma = new PrismaClient();

  async create(measure: Measure): Promise<void> {
    await this.prisma.measure.create({
      data: {
        measure_uuid: measure.measure_uuid,
        measure_type: measure.measure_type,
        measure_datetime: measure.measure_datetime,
        measure_value: measure.measure_value,
        image_url: measure.image_url,
        has_confirmed: measure.has_confirmed,
        customer_code: measure.customer_code
      },
    });
  }

  async findByCustomerCode(customer_code: string, measure_type?: string): Promise<Measure[]> {
    const where: any = {
      customer_code: customer_code,
    };
    
    if (measure_type) {
      where.measure_type = measure_type;
    }

    const measures: PrismaMeasure[] = await this.prisma.measure.findMany({
      where: where,
    });

    return measures.map(measure => new Measure(
      measure.measure_uuid,
      measure.measure_type,
      measure.measure_datetime,
      measure.measure_value,
      measure.image_url,
      measure.has_confirmed,
      measure.created_at,
      measure.updated_at,
      measure.customer_code
    ));
  }

  public async findAll(measure_type?: string): Promise<Measure[]> {
    const where: any = {};

    if (measure_type) {
      where.measure_type = measure_type;
    }

    const measures: PrismaMeasure[] = await this.prisma.measure.findMany({
      where: where,
    });

    return measures.map(measure => new Measure(
      measure.measure_uuid,
      measure.measure_type,
      measure.measure_datetime,
      measure.measure_value,
      measure.image_url,
      measure.has_confirmed,
      measure.created_at,
      measure.updated_at,
      measure.customer_code
    ));
  }

  public async existsForMonthAndType(customer_code: string, measure_type: string, measure_datetime: Date): Promise<boolean> {
    if (!(measure_datetime instanceof Date) || isNaN(measure_datetime.getTime())) {
      throw new Error('Data de medição inválida.');
    }
  
    const startOfMonth = new Date(measure_datetime.getFullYear(), measure_datetime.getMonth(), 1);
  
    const endOfMonth = new Date(measure_datetime.getFullYear(), measure_datetime.getMonth() + 1, 0, 23, 59, 59, 999);
  
    if (isNaN(startOfMonth.getTime()) || isNaN(endOfMonth.getTime())) {
      throw new Error('Data inválida para o início ou fim do mês.');
    }
  
    // Consulta ao banco de dados
    const existingMeasure = await this.prisma.measure.findFirst({
      where: {
        customer_code,
        measure_type,
        measure_datetime: {
          gte: startOfMonth,
          lt: endOfMonth,
        },
      },
    });
  
    return !!existingMeasure;
  }
  

  public async findByUUID(measure_uuid: string) {
    return this.prisma.measure.findUnique({
      where: { measure_uuid },
    });
  }

  public async update(measure_uuid: string, confirmed_value: number) {
    return this.prisma.measure.update({
      where: { measure_uuid },
      data: { 
        measure_value: confirmed_value,
        has_confirmed: true,
       },
    });
  }
  
}
