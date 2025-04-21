import { ConfigService } from '@nestjs/config';
import { MelhorEnvioClient, ShippingOption } from '../src/shared/clients/melhor-envio.client';

jest.mock('axios');
import axios from 'axios';
const mockedAxios = axios as jest.Mocked<typeof axios>;

// For mocking http instance, override in test

describe('MelhorEnvioClient', () => {
  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      switch (key) {
        case 'MELHOR_ENVIO_BASE_URL': return 'https://api.mock';
        case 'MELHOR_ENVIO_ACCESS_TOKEN': return 'TOKEN';
        case 'DEFAULT_PRODUCT_WIDTH':
        case 'DEFAULT_PRODUCT_HEIGHT':
        case 'DEFAULT_PRODUCT_LENGTH':
        case 'DEFAULT_PRODUCT_WEIGHT': return 1;
        default: return undefined;
      }
    })
  } as any as ConfigService;

  const client = new MelhorEnvioClient(mockConfigService) as any;
  const mockHttp = { post: jest.fn() };
  client['http'] = mockHttp;

  it('should calculate shipping successfully', async () => {
    const apiResponse = [{ name: 'PAC', price: 10, delivery_time: 5 }];
    mockHttp.post.mockResolvedValue({ data: apiResponse });

    const result = await client.calculateShipping('01001000', '02002000');
    expect(result).toEqual([{ type: 'PAC', price: 10, deliveryTime: '5 dias úteis' }]);
    expect(mockHttp.post).toHaveBeenCalledWith(
      '/me/shipment/calculate',
      expect.objectContaining({
        from: { postal_code: '01001000' },
        to: { postal_code: '02002000' }
      })
    );
  });

  it('should return empty array on error', async () => {
    mockHttp.post.mockRejectedValue(new Error('Service unavailable'));
    const result = await client.calculateShipping('00000000', '11111111');
    expect(result).toEqual([]);
  });
});