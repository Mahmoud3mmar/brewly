import { ApiProperty } from '@nestjs/swagger';

export class UserProfileDto {
  @ApiProperty({ example: 1, description: 'User ID' })
  id!: number;

  @ApiProperty({ example: 'user@example.com', description: 'User email address' })
  email!: string;

  @ApiProperty({ example: 'John', description: 'User first name' })
  firstName!: string;

  @ApiProperty({ example: 'Doe', description: 'User last name' })
  lastName!: string;

  @ApiProperty({ example: '+1234567890', description: 'User phone number', required: false })
  phoneNumber?: string;

  @ApiProperty({ example: true, description: 'Whether email is verified' })
  emailVerified!: boolean;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Account creation date' })
  createdAt!: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', description: 'Last update date' })
  updatedAt!: Date;

  constructor(user: any) {
    this.id = user.id;
    this.email = user.email;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.phoneNumber = user.phoneNumber;
    this.emailVerified = user.emailVerified;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }
}

