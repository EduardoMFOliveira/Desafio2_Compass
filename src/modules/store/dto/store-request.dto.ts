// src/modules/store/dto/store-request.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsIn, Min, Max } from 'class-validator';
import { IsCEP } from 'brazilian-class-validator';

export class StoreRequestDto {
  @ApiProperty({ 
    example: '01001000', 
    description: 'CEP válido no formato 8 dígitos',
    required: true 
  })
  @IsCEP({ message: 'CEP inválido. Utilize o formato 00000000' })
  cep: string;

  @ApiProperty({
    example: 50,
    description: 'Raio de busca em quilômetros (default: 50)',
    required: false
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(1000)
  radius?: number;

  @ApiProperty({
    enum: ['PDV', 'LOJA'],
    description: 'Filtrar por tipo de loja',
    required: false
  })
  @IsIn(['PDV', 'LOJA'])
  @IsOptional()
  type?: string;
}