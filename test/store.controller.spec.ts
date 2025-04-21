import { Test, TestingModule } from '@nestjs/testing';
import { StoreController } from '../src/modules/store/store.controller';
import { StoreService } from '../src/modules/store/store.service';
import { StoreResponseDto } from '../src/modules/store/dto/store-response.dto';

describe('StoreController', () => {
  let controller: StoreController;
  const mockService = {
    findAll: jest.fn(),
    findNearbyStores: jest.fn(),
    findById: jest.fn(),
    findByState: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StoreController],
      providers: [{ provide: StoreService, useValue: mockService }],
    }).compile();

    controller = module.get<StoreController>(StoreController);
  });

  it('should list all stores', async () => {
    const dto: StoreResponseDto[] = [{ name: 'A', city: 'B', postalCode: '000', type: 'PDV', distance: '1 km', shippingOptions: [] }];
    mockService.findAll.mockResolvedValue(dto);
    expect(await controller.listAll()).toBe(dto);
  });

  it('should return stores by CEP', async () => {
    mockService.findNearbyStores.mockResolvedValue([]);
    const params = { cep: '00000000', radius: 50 };
    await controller.storeByCep(params as any);
    expect(mockService.findNearbyStores).toHaveBeenCalledWith(params.cep, params.radius);
  });

  it('should return store by id', async () => {
    mockService.findById.mockResolvedValue({} as any);
    await controller.storeById('1');
    expect(mockService.findById).toHaveBeenCalledWith('1');
  });

  it('should return stores by state', async () => {
    mockService.findByState.mockResolvedValue([]);
    await controller.storeByState('sp');
    expect(mockService.findByState).toHaveBeenCalledWith('SP');
  });
});