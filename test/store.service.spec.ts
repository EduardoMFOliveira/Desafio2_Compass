import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { StoreService } from '../src/modules/store/store.service';
import { Store } from '../src/modules/store/entities/store.entity';
import { ViaCEPClient } from '../src/shared/clients/viacep.client';
import { GoogleMapsClient } from '../src/shared/clients/google-maps.client';
import { MelhorEnvioClient } from '../src/shared/clients/melhor-envio.client';
import { ConfigService } from '@nestjs/config';
import { CacheUtil } from '../src/shared/utils/cache.util';

describe('StoreService', () => {
  let service: StoreService;
  const mockRepo = { find: jest.fn(), findOneBy: jest.fn() };
  const mockViaCEP = { getAddress: jest.fn() };
  const mockGoogle = { getCoordinates: jest.fn(), calculateDistance: jest.fn() };
  const mockMelhor = { calculateShipping: jest.fn() };
  const mockConfig = { get: jest.fn().mockReturnValue(50) };
  const mockCache = { get: jest.fn(), set: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoreService,
        { provide: getRepositoryToken(Store), useValue: mockRepo },
        { provide: ViaCEPClient, useValue: mockViaCEP },
        { provide: GoogleMapsClient, useValue: mockGoogle },
        { provide: MelhorEnvioClient, useValue: mockMelhor },
        { provide: ConfigService, useValue: mockConfig },
        { provide: CacheUtil, useValue: mockCache },
      ],
    }).compile();

    service = module.get<StoreService>(StoreService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return mapped DTOs', async () => {
      const stores = [
        { id: '1', name: 'Test', city: 'C', postalCode: '000', type: 'PDV', latitude: 0, longitude: 0, state: 'SP' }
      ];
      mockRepo.find.mockResolvedValue(stores);
      const result = await service.findAll();
      expect(result).toEqual([
        { name: 'Test', city: 'C', postalCode: '000', type: 'PDV', distance: '', shippingOptions: [] }
      ]);
    });
  });

  describe('findById', () => {
    it('should return a single mapped DTO', async () => {
      const store = { id: '1', name: 'X', city: 'Y', postalCode: '111', type: 'LOJA', latitude: 1, longitude: 1, state: 'RJ' };
      mockRepo.findOneBy.mockResolvedValue(store);
      const result = await service.findById('1');
      expect(result).toEqual({ name: 'X', city: 'Y', postalCode: '111', type: 'LOJA', distance: '', shippingOptions: [] });
    });
  });
});