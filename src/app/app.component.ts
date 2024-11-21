import {AfterViewInit, Component, effect, OnInit, signal, Input, getModuleFactory, inject} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Product } from './app.constant';
import {NgOptimizedImage} from "@angular/common";
import {MatDialog, MatDialogContent, MatDialogRef, MatDialogTitle} from "@angular/material/dialog";
import {arrRemove} from "rxjs/internal/util/arrRemove";
import {Breakpoints} from "@angular/cdk/layout";
import {AppService} from "./app.service";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgOptimizedImage],
  providers: [AppService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'angular-shopping-cart';
  products: any[] = [];

  carts = signal(this.products);
  totalCart: number = 0;
  totalPrice: string | number = '';

  phoneLayout: boolean = false;

  constructor(
    private _dialog: MatDialog,
    private _appService: AppService,
  ) {
    this.fetchProducts();
  }

  ngOnInit() {
    this._appService.phoneLayout$.subscribe((res) => {
      this.phoneLayout = res;
    })
  }

  ngAfterViewInit() {
    // this.carts = this.cart().items;
    // this.totalCart = this.cart().total;
  }


  private fetchProducts() {
    this.products = Product;
    this.products = this.products.map((product) => {
      product.qty = 0;
      product.price = product.price.toFixed(2);

      return product;
    })

  }

  public addToCart(item: any) {
    item.qty += 1;
    this.totalCart += 1;
    this.carts.update((currentItem) => {
      const existingItems = currentItem.some((value: any) => value.name === item.name);

      if (existingItems) {
        currentItem.map((value: any) => {
          if(value.name === item.name) {
            value.qty += 0;
          }

          return value
        })
      } else {
        currentItem.push(item);
      }

      currentItem.map((value: any) => {
        value.total = (value.price * value.qty).toFixed(2);

        return value;
      })

      return currentItem;
    })

    this.totalPrice = this.carts().reduce((acc, item) => acc + parseInt(item.total), 0).toFixed(2);
  }

  public onDecreaseItem(item: any) {
    item.qty -= 1;
    this.totalCart -= 1;
    this.carts.update((currentItem) => {
      const existingItems = currentItem.some((value: any) => value.name === item.name);
      if (existingItems) {
        currentItem.map((value: any) => {
          if(value.name === item.name) {
            value.qty -= 0;
          }
          value.total += value.price;
          return value;
        })
      } else {
        currentItem.splice(currentItem.findIndex((value: any) => value.name === item.name), 1);
      }

      currentItem.map((value: any) => {
        value.total = (value.price * value.qty).toFixed(2);

        return value;
      })

      if(item.qty < 1) {
        currentItem.splice(currentItem.findIndex((value: any) => value.qty < 1), 1);
      }
      return currentItem;
    })
    this.totalPrice = this.carts().reduce((acc, item) => acc + parseInt(item.total), 0).toFixed(2);
  }

  public onOrder() {
    const modalRef = this._dialog.open(DialogOrder, { width: '720px'})

    modalRef.componentInstance.items = this.carts();
    modalRef.componentInstance.total = this.totalPrice

    modalRef.afterClosed().subscribe({
      next: (result: boolean) => {
        if(result) {
          this.products = this.products.map((product) => {
            product.qty = 0;
            product.price = 0;

            return product;
          })

          this.carts.update((currentItems) => {
            currentItems = []
            this.totalCart = 0;

            return currentItems;
          })
        }
      }
    })
  }
}

@Component({
  selector: 'app-dialog-order',
  standalone: true,
  imports: [RouterOutlet, NgOptimizedImage, MatDialogTitle, MatDialogContent],
  template: `
    <div class="p-8">
      <img src="./assets/images/icon-order-confirmed.svg" alt="order-confirmed" class="mb-8">
      <div class="mb-4">
        <h2 class="font-bold text-4xl">Order Confirmed</h2>
        <span class="text-lg text-gray-500">We hope you enjoy your food</span>
      </div>

      <div class="flex flex-col gap-8 bg-orange-50 p-4 w-full rounded-lg">
          @for (item of items; track item) {
            <div class="flex flex-row justify-between items-center">
              <div class="flex flex-row gap-4 items-center">
                <div class="rounded-lg overflow-hidden">
                  <img [src]="item.image?.mobile" alt="product-image" class="w-24 h-24 object-cover">
                </div>
                <div class="me-2">
                  <h6 class="text-xl font-bold mb-4">{{ item.name }}</h6>
                  <div class="flex flex-row gap-4">
                    <span class="font-bold text-orange-600 text-xl">{{ item.qty }}x</span>
                    <span class="text-gray-400 text-xl">{{ '@ ' + item.price}}</span>
                  </div>
                </div>
              </div>

              <div class="text-2xl font-bold">
                {{ '$' + item.total }}
              </div>
            </div>
          }

          <div class="flex flex-row justify-between items-center my-8">
            <span class="text-gray-500 text-lg">Order Total</span>
            <div class="font-bold text-2xl">{{ '$' + total }}</div>
          </div>

          <button class="rounded-full w-full m-auto p-4 relative border group bg-orange-600 hover:bg-orange-800 transition-all" (click)="onStartOrder()">
            <span class="text-white text-2xl">Start New Order</span>
          </button>
        </div>

    </div>

  `,
})

export class DialogOrder {
  @Input() items: any
  @Input() total!: number | string;

  public dialog = inject(MatDialogRef)

  public onStartOrder() {
    this.dialog.close(true);
  }
}
