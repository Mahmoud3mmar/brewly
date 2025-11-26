import { TokenTypeEnum } from '../../enums/token-type.enum';

export type AdminJwtPayloadType = {
  id: number;
  email: string;
  tokenType: TokenTypeEnum.ADMIN;
};

export type UserJwtPayloadType = {
  id: number;
  email: string;
  tokenType: TokenTypeEnum.USER;
};

export type JwtPayloadType = AdminJwtPayloadType | UserJwtPayloadType;

