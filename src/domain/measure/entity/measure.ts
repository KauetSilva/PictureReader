export class Measure {
    constructor(
      public readonly measure_uuid: string,
      public measure_type: string,
      public measure_datetime: Date,
      public measure_value: number,
      public image_url: string,
      public has_confirmed: boolean = false,
      public created_at: Date = new Date(),
      public updated_at: Date = new Date(),
      public customer_code: string
    ) {}
  
    confirmMeasure(value: number): void {
      if (this.has_confirmed) {
        throw new Error("This measure has already been confirmed.");
      }
  
      this.measure_value = value;
      this.has_confirmed = true;
    }
  
    updateTimestamp(): void {
      this.updated_at = new Date();
    }
  }
  