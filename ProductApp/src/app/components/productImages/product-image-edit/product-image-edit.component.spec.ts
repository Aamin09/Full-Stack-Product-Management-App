import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductImageEditComponent } from './product-image-edit.component';

describe('ProductImageEditComponent', () => {
  let component: ProductImageEditComponent;
  let fixture: ComponentFixture<ProductImageEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProductImageEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductImageEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
