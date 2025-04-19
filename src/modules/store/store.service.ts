// src/modules/store/store.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from './entities/store.entity';
import { ViaCEPClient } from '../../shared/clients/viacep.client';
import { GoogleMapsClient } from '../../shared/clients/google-maps.client';
import { MelhorEnvioClient } from '../../shared/clients/melhor-envio.client';
import { StoreResponseDto, ShippingOptionDto } from './dto/store-response.dto';
import { ConfigService } from '@nestjs/config';
import { CacheUtil } from '../../shared/utils/cache.util';

@Injectable()
export class StoreService {
  private readonly logger = new Logger(StoreService.name);
  private readonly PDV_RADIUS: number;
  private readonly PDV_SHIPPING_PRICE: number;

  constructor(
    @InjectRepository(Store) private storeRepository: Repository<Store>,
    private viaCEP: ViaCEPClient,
    private googleMaps: GoogleMapsClient,
    private melhorEnvio: MelhorEnvioClient,
    private configService: ConfigService,
    private cache: CacheUtil
  ) {
    this.PDV_RADIUS = this.configService.get<number>('PDV_RADIUS', 50);
    this.PDV_SHIPPING_PRICE = this.configService.get<number>('PDV_SHIPPING_PRICE', 15);
  }

  async findAll(): Promise<StoreResponseDto[]> {
    const stores = await this.storeRepository.find();
    return stores.map(store => this.mapToDto(store));
  }

  async findById(id: string): Promise<StoreResponseDto> {
    const store = await this.storeRepository.findOneBy({ id });
    return this.mapToDto(store);
  }

  async findByState(uf: string): Promise<StoreResponseDto[]> {
    const stores = await this.storeRepository.find({
      where: { state: uf.toUpperCase() }
    });
    return stores.map(store => this.mapToDto(store));
  }

  async findNearbyStores(cep: string, radius?: number): Promise<StoreResponseDto[]> {
    const effectiveRadius = radius ?? this.PDV_RADIUS;
    const cacheKey = `stores_${cep}_${effectiveRadius}`;
    const cached = this.cache.get<StoreResponseDto[]>(cacheKey);
    if (cached) return cached;

    try {
      const address = await this.viaCEP.getAddress(cep);
      const userCoords = await this.googleMaps.getCoordinates(`${address.street}, ${address.city}`);
      const stores = await this.storeRepository.find();

      const results = await Promise.all(
        stores.map(async store => {
          try {
            const origin = `${store.latitude},${store.longitude}`;
            const destination = `${userCoords.lat},${userCoords.lng}`;
            const { distance, duration } = await this.googleMaps.calculateDistance(origin, destination);

            const isPDV = distance <= effectiveRadius;
            const shippingOptions = isPDV 
              ? this.getPDVShippingOptions(duration) 
              : await this.getMelhorEnvioShipping(store.postalCode, cep);

            return {
              ...this.mapToDto(store),
              distance: this.formatDistance(distance),
              type: isPDV ? 'PDV' : 'LOJA',
              shippingOptions
            };
          } catch (error) {
            this.logger.error(`Erro processando loja ${store.id}: ${error.message}`);
            return null;
          }
        })
      );

      const filtered = results.filter(r => r !== null) as StoreResponseDto[];
      this.cache.set(cacheKey, filtered, 300);
      return filtered;
    } catch (error) {
      this.logger.error(`Erro ao buscar lojas: ${error.message}`);
      throw error;
    }
  }

  private mapToDto(store: Store): StoreResponseDto {
    return {
      name: store.name,
      city: store.city,
      postalCode: store.postalCode,
      type: store.type,
      distance: '',
      shippingOptions: []
    };
  }

  private formatDistance(distance: number): string {
    return distance < 1
      ? `${Math.round(distance * 1000)} metros`
      : `${distance.toFixed(1).replace('.', ',')} km`;
  }

  private getPDVShippingOptions(durationSeconds: number): ShippingOptionDto[] {
    const hours = durationSeconds / 3600;
    let deliveryTime: string;

    if (hours < 1) {
      deliveryTime = 'Menos de 1 hora';
    } else if (hours <= 8) {
      deliveryTime = `${Math.ceil(hours)} hora${hours >= 2 ? 's' : ''}`;
    } else {
      const days = Math.ceil(hours / 24);
      deliveryTime = `${days} dia${days > 1 ? 's' : ''} útil${days > 1 ? 'es' : ''}`;
    }

    return [{
      type: 'Motoboy',
      price: this.PDV_SHIPPING_PRICE,
      deliveryTime
    }];
  }

  /**
   * Agora retorna todas as opções do Melhor Envio, sem filtro restritivo.
   */
  private async getMelhorEnvioShipping(from: string, to: string): Promise<ShippingOptionDto[]> {
    try {
      // retorna todas as modalidades (PAC, Sedex, etc.) já mapeadas pelo client
      return await this.melhorEnvio.calculateShipping(from, to);
    } catch (error) {
      this.logger.error(`Erro Melhor Envio: ${error.message}`);
      return [{
        type: 'Indisponível',
        price: 0,
        deliveryTime: 'Consulte-nos'
      }];
    }
  }
}
