import { Module } from '@nestjs/common';
import { ErgonomiaController } from './ergonomia.controller';
import { ErgonomiaService } from './ergonomia.service';
import { ConsentGuard } from '../../common/guards/consent.guard';

@Module({
  controllers: [ErgonomiaController],
  providers: [ErgonomiaService, ConsentGuard],
  exports: [ErgonomiaService],
})
export class ErgonomiaModule {}
