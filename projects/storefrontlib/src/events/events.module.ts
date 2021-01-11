import { NgModule } from '@angular/core';
import { CartPageEventModule } from './cart/cart-page-event.module';
import { PageEventModule } from './page/page-event.module';
import { ProductPageEventModule } from './product/product-page-event.module';

/**
 * @deprecated since 3.2
 */
@NgModule({
  imports: [CartPageEventModule, PageEventModule, ProductPageEventModule],
})
export class EventsModule {}
