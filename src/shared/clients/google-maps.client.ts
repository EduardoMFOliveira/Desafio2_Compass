// src/shared/clients/google-maps.client.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

export interface Coordinates {
  lat: number;
  lng: number;
}

@Injectable()
export class GoogleMapsClient {
  private readonly http: AxiosInstance;
  private readonly apiKey: string;
  private readonly logger = new Logger(GoogleMapsClient.name);

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('GOOGLE_MAPS_API_KEY');
    this.http = axios;
  }

  async getCoordinates(address: string): Promise<Coordinates> {
    try {
      const { data } = await this.http.get(
        'https://maps.googleapis.com/maps/api/geocode/json',
        { params: { address, key: this.apiKey } }
      );

      if (!data.results || data.results.length === 0) {
        throw new Error('NO_RESULTS');
      }
      const loc = data.results[0].geometry.location;
      return { lat: loc.lat, lng: loc.lng };
    } catch (error: any) {
      this.logger.error(`Erro no Google Maps: ${error.message}`);
      if (error.message === 'NO_RESULTS') {
        throw new Error('Falha ao obter coordenadas');
      }
      throw new Error('Falha temporária ao consultar Google Maps');
    }
  }

  async calculateDistance(
    origin: Coordinates,
    destination: Coordinates
  ): Promise<{ distance: number; duration: number }> {
    // Cálculo de distância Haversine
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(destination.lat - origin.lat);
    const dLng = toRad(destination.lng - origin.lng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(origin.lat)) *
        Math.cos(toRad(destination.lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const km = R * c;
    const duration = (km / 50) * 3600;
    return { distance: km, duration };
  }
}