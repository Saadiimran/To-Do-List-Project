import { IsString, IsEmail, IsStrongPassword, Length } from 'class-validator';

export class SignUpDto {
  @IsString()
  @Length(1, 15)
  firstName: string;

  @IsString()
  @Length(1, 15)
  lastName: string;

  @IsEmail()
  email: string;

  @IsStrongPassword()
  @Length(8, 30)
  password: string;

  @IsStrongPassword()
  @Length(8, 30)
  confirmPassword: string;
}
