// src/shared/clients/viacep.client.ts
import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

export interface AddressDto {
  cep: string;
  street: string;
  city: string;
  state: string;
  neighborhood: string;
}

@Injectable()
export class ViaCEPClient {
  private readonly http: AxiosInstance;
  private readonly logger = new Logger(ViaCEPClient.name);

  constructor() {
    // Usa diretamente o axios para facilitar mock em testes
    this.http = axios;
  }

  async getAddress(cep: string): Promise<AddressDto> {
    try {
      // Remove tudo que não for dígito para aceitar formatos como "01.001-000"
      const sanitizedCep = cep.replace(/\D/g, '');
      // Faz a chamada à API usando apenas números
      const { data } = await this.http.get(`https://viacep.com.br/ws/${sanitizedCep}/json`);

      // Se a resposta indicar erro ou não trouxer campo 'cep', considera inválido
      if (data.erro || typeof data.cep !== 'string') {
        throw new Error('CEP_INVALIDO');
      }

      return {
        cep: sanitizedCep,
        street: data.logradouro,
        city: data.localidade,
        state: data.uf,
        neighborhood: data.bairro && data.bairro.trim().length > 0
          ? data.bairro
          : 'Bairro não especificado',
      };
    } catch (error: any) {
      this.logger.error(`Erro no ViaCEP: ${error.message}`);
      // Ajusta a mensagem de erro para o consumidor
      if (error.message === 'CEP_INVALIDO') {
        throw new Error('CEP inválido ou não encontrado');
      }
      throw new Error('Falha temporária na consulta de CEP');
    }
  }
}