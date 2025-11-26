import { Module } from '@nestjs/common';
import { UserPersistenceModule } from './infrastructure/persistence/user-persistence.module';

@Module({
  imports: [UserPersistenceModule],
  exports: [UserPersistenceModule],
})
export class UserModule {}

