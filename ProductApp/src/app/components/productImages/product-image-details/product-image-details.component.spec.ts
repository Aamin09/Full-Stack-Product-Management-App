import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductImageDetailsComponent } from './product-image-details.component';

describe('ProductImageDetailsComponent', () => {
  let component: ProductImageDetailsComponent;
  let fixture: ComponentFixture<ProductImageDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProductImageDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductImageDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
