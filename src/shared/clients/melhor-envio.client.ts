// src/shared/clients/melhor-envio.client.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

export interface ShippingOption {
  type: string;
  price: number;
  deliveryTime: string;
}

@Injectable()
export class MelhorEnvioClient {
  private readonly logger = new Logger(MelhorEnvioClient.name);
  private readonly http: AxiosInstance;

  constructor(private configService: ConfigService) {
    this.http = axios.create({
      baseURL:
        this.configService.get<string>('MELHOR_ENVIO_BASE_URL') ||
        'https://melhorenvio.com.br/api/v2',
      headers: {
        Authorization: `Bearer ${this.configService.get<string>(
          'MELHOR_ENVIO_ACCESS_TOKEN',
        )}`,
        'User-Agent': `${this.configService.get<string>('APP_NAME')}/1.0`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });
  }

  private getDefaultProducts() {
    return [
      {
        id: 'default',
        width: this.configService.get<number>('DEFAULT_PRODUCT_WIDTH'),
        height: this.configService.get<number>('DEFAULT_PRODUCT_HEIGHT'),
        length: this.configService.get<number>('DEFAULT_PRODUCT_LENGTH'),
        weight: this.configService.get<number>('DEFAULT_PRODUCT_WEIGHT'),
        quantity: 1,
      },
    ];
  }

  async calculateShipping(
    from: string,
    to: string,
  ): Promise<ShippingOption[]> {
    try {
      const response = await this.http.post('/me/shipment/calculate', {
        from: { postal_code: from },
        to: { postal_code: to },
        products: this.getDefaultProducts(),
        options: {
          insurance_value: 0,
          receipt: false,
          own_hand: false,
        },
      });

      return this.parseShippingOptions(response.data);
    } catch (error: any) {
      this.logger.error(`Erro no cálculo de frete: ${error.message}`, error.stack);
      return [];
    }
  }

  private parseShippingOptions(data: any[]): ShippingOption[] {
    return data
      .map((option) => {
        const typeName = option.name ?? 'Serviço Desconhecido';
        const priceValue = Number(option.custom_price ?? option.price ?? 0);
        let deliveryStr: string;

        if (option.custom_delivery_time != null) {
          deliveryStr = `${option.custom_delivery_time} dias úteis`;
        } else if (option.delivery_time != null) {
          deliveryStr = `${option.delivery_time} dias úteis`;
        } else {
          deliveryStr = 'Consulte-nos';
        }

        return {
          type: typeName,
          price: priceValue,
          deliveryTime: deliveryStr,
        };
      })
      .filter(
        (option) =>
          option.price > 0 &&
          option.deliveryTime !== 'Consulte-nos' &&
          !option.type.includes('Indisponível'),
      )
      .sort((a, b) => a.price - b.price);
  }
}
