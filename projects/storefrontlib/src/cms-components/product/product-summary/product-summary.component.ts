import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MultiCartService, OrderEntry, Product } from '@spartacus/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CurrentProductService } from '../current-product.service';
import { ProductDetailOutlets } from '../product-outlets.model';

@Component({
  selector: 'cx-product-summary',
  templateUrl: './product-summary.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductSummaryComponent implements OnInit {
  outlets = ProductDetailOutlets;

  product$: Observable<Product> = this.currentProductService.getProduct();
  wishListEntries$: Observable<
    OrderEntry[]
  > = this.multicartService.getWishList().pipe(map(cart => cart.entries));

  constructor(
    protected currentProductService: CurrentProductService,
    private multicartService: MultiCartService
  ) {}

  ngOnInit() {
    // this.multicartService.getCart('00000039').subscribe(cart => {
    //   console.log(cart);
    //   if (!cart) {
    //     console.log('dispatch');
    //     this.multicartService.loadCart({
    //       cartId: '00000039',
    //       userId: 'current',
    //     });
    //   }
    // });
  }

  wishListContainsProduct(product: Product, entries: OrderEntry[]) {
    const item = entries.find(entry => entry.product.code === product.code);
    return item;
  }

  addToWishList(product: Product) {
    this.multicartService.addEntries('current', '00001002', [
      { productCode: product.code, quantity: 1 },
    ]);
  }

  removeFromWishList(entry: OrderEntry) {
    this.multicartService.removeEntry('current', '0000', entry.entryNumber);
  }
}
