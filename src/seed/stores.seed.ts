// src/seed/stores.seed.ts
import { Injectable } from '@nestjs/common';
import { Store } from '../modules/store/entities/store.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class StoreSeedService {
  constructor(
    @InjectRepository(Store)
    private storeRepository: Repository<Store>
  ) {}

  async seed() {
    const capitals = [
      { name: 'Dudu Store - AC', city: 'Rio Branco',        state: 'AC', postalCode: '69900901', latitude: -9.97472,  longitude: -67.81 },
      { name: 'Dudu Store - AL', city: 'Maceió',            state: 'AL', postalCode: '57020040', latitude: -9.647684, longitude: -35.733926 },
      { name: 'Dudu Store - AP', city: 'Macapá',            state: 'AP', postalCode: '68900810', latitude: 0.038076,   longitude: -51.065566 },
      { name: 'Dudu Store - AM', city: 'Manaus',            state: 'AM', postalCode: '69020375', latitude: -3.101944,  longitude: -60.025 },
      { name: 'Dudu Store - BA', city: 'Salvador',          state: 'BA', postalCode: '40020000', latitude: -12.9714,   longitude: -38.5014 },
      { name: 'Dudu Store - CE', city: 'Fortaleza',         state: 'CE', postalCode: '60025230', latitude: -3.71722,   longitude: -38.54306 },
      { name: 'Dudu Store - DF', city: 'Brasília',          state: 'DF', postalCode: '70075900', latitude: -15.793889, longitude: -47.882778 },
      { name: 'Dudu Store - ES', city: 'Vitória',           state: 'ES', postalCode: '29050945', latitude: -20.3155,   longitude: -40.3128 },
      { name: 'Dudu Store - GO', city: 'Goiânia',           state: 'GO', postalCode: '74003010', latitude: -16.686389, longitude: -49.264444 },
      { name: 'Dudu Store - MA', city: 'São Luís',          state: 'MA', postalCode: '65010905', latitude: -2.53944,   longitude: -44.28222 },
      { name: 'Dudu Store - MG', city: 'Belo Horizonte',    state: 'MG', postalCode: '30140071', latitude: -19.920833, longitude: -43.937778 },
      { name: 'Dudu Store - MS', city: 'Campo Grande',      state: 'MS', postalCode: '79002000', latitude: -20.469722, longitude: -54.620833 },
      { name: 'Dudu Store - MT', city: 'Cuiabá',            state: 'MT', postalCode: '78005000', latitude: -15.596667, longitude: -56.096944 },
      { name: 'Dudu Store - PA', city: 'Belém',             state: 'PA', postalCode: '66040020', latitude: -1.455833,  longitude: -48.503889 },
      { name: 'Dudu Store - PB', city: 'João Pessoa',       state: 'PB', postalCode: '58010480', latitude: -7.115278,  longitude: -34.864167 },
      { name: 'Dudu Store - PE', city: 'Recife',            state: 'PE', postalCode: '50030170', latitude: -8.047562,  longitude: -34.877 },
      { name: 'Dudu Store - PI', city: 'Teresina',          state: 'PI', postalCode: '64000000', latitude: -5.089167,  longitude: -42.801389 },
      { name: 'Dudu Store - PR', city: 'Curitiba',          state: 'PR', postalCode: '80010000', latitude: -25.428333, longitude: -49.273056 },
      { name: 'Dudu Store - RJ', city: 'Rio de Janeiro',    state: 'RJ', postalCode: '20081240', latitude: -22.908333, longitude: -43.196389 },
      { name: 'Dudu Store - RN', city: 'Natal',             state: 'RN', postalCode: '59020040', latitude: -5.795,     longitude: -35.208056 },
      { name: 'Dudu Store - RO', city: 'Porto Velho',       state: 'RO', postalCode: '76801150', latitude: -8.761944,  longitude: -63.903889 },
      { name: 'Dudu Store - RR', city: 'Boa Vista',         state: 'RR', postalCode: '69301010', latitude: 2.819722,   longitude: -60.673056 },
      { name: 'Dudu Store - RS', city: 'Porto Alegre',      state: 'RS', postalCode: '90010000', latitude: -30.027778, longitude: -51.228611 },
      { name: 'Dudu Store - SC', city: 'Florianópolis',     state: 'SC', postalCode: '88010000', latitude: -27.594444, longitude: -48.548056 },
      { name: 'Dudu Store - SE', city: 'Aracaju',           state: 'SE', postalCode: '49010000', latitude: -10.947248, longitude: -37.073056 },
      { name: 'Dudu Store - SP', city: 'São Paulo',         state: 'SP', postalCode: '01001000', latitude: -23.55052,  longitude: -46.633309 },
      { name: 'Dudu Store - TO', city: 'Palmas',            state: 'TO', postalCode: '77001000', latitude: -10.184444, longitude: -48.333056 },
    ];

    await Promise.all(capitals.map(async (capital) => {
      const exists = await this.storeRepository.findOne({ where: { state: capital.state } });
      if (!exists) {
        await this.storeRepository.save({
          name: capital.name,
          city: capital.city,
          state: capital.state,
          postalCode: capital.postalCode,
          latitude: capital.latitude,
          longitude: capital.longitude,
          shippingTimeInDays: 1,
          type: 'LOJA'
        });
      }
    }));
  }
}
