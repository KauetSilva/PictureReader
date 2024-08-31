import axios from 'axios';
import { MeasureRepository } from '../../infra/repositories/measure/measure.repository';
import { Measure } from '../../domain/measure/entity/measure';
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export class CreateMeasureUsecase {
  private apiKey = process.env.GEMINI_API_KEY;

  constructor(private measureRepository: MeasureRepository) {}

  public static create(measureRepository: MeasureRepository) {
    return new CreateMeasureUsecase(measureRepository);
  }
  
  public async execute(
    customer_code: string,
    image: string,
    measure_datetime: Date,
    measure_type: string
  ): Promise<{ image_url: string; measure_value: number; measure_uuid: string }> {
    // Validate measure_type
    const validTypes = ['WATER', 'GAS'];
    if (!validTypes.includes(measure_type)) {
      throw new Error('Tipo de medição inválido');
    }

     // Verifica se já existe uma leitura para o tipo e mês atual
    if (await this.measureRepository.existsForMonthAndType(customer_code, measure_type, measure_datetime)) {
      throw new Error('Leitura do mês já realizada');
    }

    // Generate a UUID for the measure
    const measure_uuid = this.generateUUID();

    // Call the Gemini API for image processing
    const { measure_value } = await this.callGeminiAPI(image);

    // Save the image temporarily and get its URL
    const image_url = this.saveImageAndGetUrl(image, measure_uuid);

    // Create measure entity
    const measure = new Measure(
      measure_uuid,
      measure_type,
      measure_datetime,
      measure_value,
      image_url,
      false,
      new Date(),
      new Date(),
      customer_code
    );

    // Save the measure to the repository
    await this.measureRepository.create(measure);

    return { image_url, measure_value, measure_uuid };
  }

  private generateUUID(): string {
    return uuidv4();
  }

  private async callGeminiAPI(imageBase64: string): Promise<{ measure_value: number }> {
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY is not set');
    }

    try {
      const genAi = new GoogleGenerativeAI(this.apiKey);
      const model = genAi.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = "Please analyze the provided image and return only the measured value extracted from it.";
      const image = {
        inlineData: {
          data: imageBase64,
          mimeType: "image/jpeg",
        },
      };

      const response: any = await model.generateContent([prompt, image]);
      const measure_value = response.response.candidates[0].content.parts[0].text;

      return { measure_value: parseFloat(measure_value) };
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw new Error('Failed to process image with Gemini API');
    }
  }

  private saveImageAndGetUrl(imageBase64: string, measure_uuid: string): string {
    // Define the path for saving the image
    const tempDir = path.join(__dirname, '../../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Decode base64 image and save it as a file
    const buffer = Buffer.from(imageBase64, 'base64');
    const imagePath = path.join(tempDir, `${measure_uuid}.jpg`);

    try {
      fs.writeFileSync(imagePath, buffer);
    } catch (error) {
      console.error('Error saving image:', error);
      throw new Error('Failed to save image');
    }

    // Generate a URL that points to the saved image
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    return `${baseUrl}/images/${measure_uuid}.jpg`;
  }
}
