import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductModule } from './product/products.module';

@Module({
  imports: [ProductModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
