import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { GoogleMapsClient } from '../src/shared/clients/google-maps.client';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('GoogleMapsClient', () => {
  const mockConfigService = { get: jest.fn().mockReturnValue('API_KEY') } as any as ConfigService;
  const client = new GoogleMapsClient(mockConfigService);

  it('should fetch coordinates successfully', async () => {
    const fakeData = { results: [{ geometry: { location: { lat: 1, lng: 2 } } }] };
    mockedAxios.get.mockResolvedValue({ data: fakeData });

    const coords = await client.getCoordinates('01001000');
    expect(coords).toEqual({ lat: 1, lng: 2 });
    expect(mockedAxios.get).toHaveBeenCalledWith(
      'https://maps.googleapis.com/maps/api/geocode/json',
      { params: { address: '01001000', key: 'API_KEY' } }
    );
  });

  it('should throw when no results', async () => {
    mockedAxios.get.mockResolvedValue({ data: { results: [] } });
    await expect(client.getCoordinates('00000000')).rejects.toThrow('Falha ao obter coordenadas');
  });
});