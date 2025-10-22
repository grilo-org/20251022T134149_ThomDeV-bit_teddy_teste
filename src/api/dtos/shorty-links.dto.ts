import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUrl, Length, Matches } from 'class-validator';

export class ShortenUrlDto {
  @ApiProperty({
    example: 'https://github.com/thomasjosetti',
    description: 'URL original a ser encurtada',
  })
  @IsUrl({}, { message: 'A URL original deve ser válida' })
  @IsNotEmpty()
  originalUrl: string;

  @ApiProperty({
    example: 'github-thomas',
    description: 'Slug ou alias personalizado (opcional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(3,30)
  @Matches(/^[a-z0-9-_]+$/i, {
    message: 'O alias deve conter até 30 caracteres e apenas letras, números, hífen ou underline.',
  })
  alias?: string;
}
