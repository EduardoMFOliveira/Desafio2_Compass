import axios from 'axios';
import { ViaCEPClient } from '../src/shared/clients/viacep.client';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ViaCEPClient', () => {
  const client = new ViaCEPClient();

  it('should fetch address successfully', async () => {
    const apiData = {
      cep: '01001-000',
      logradouro: 'Praça da Sé',
      localidade: 'São Paulo',
      uf: 'SP',
      bairro: ''
    };
    mockedAxios.get.mockResolvedValue({ data: apiData });

    const result = await client.getAddress('01001000');
    expect(result).toEqual({
      cep: '01001000',
      street: 'Praça da Sé',
      city: 'São Paulo',
      state: 'SP',
      neighborhood: 'Bairro não especificado'
    });
    expect(mockedAxios.get).toHaveBeenCalledWith('https://viacep.com.br/ws/01001000/json');
  });

  it('should throw specific message on invalid CEP', async () => {
    mockedAxios.get.mockResolvedValue({ data: { erro: true } });
    await expect(client.getAddress('00000000')).rejects.toThrow('CEP inválido ou não encontrado');
  });

  it('should throw fallback message on network error', async () => {
    mockedAxios.get.mockRejectedValue(new Error('Network error'));
    await expect(client.getAddress('01001000')).rejects.toThrow('Falha temporária na consulta de CEP');
  });

  it('should throw on unsupported CEP response (missing cep)', async () => {
    // Simula resposta sem campo cep, CEP possivelmente não suportado
    mockedAxios.get.mockResolvedValue({ data: {} });
    await expect(client.getAddress('99999999')).rejects.toThrow('CEP inválido ou não encontrado');
  });
});