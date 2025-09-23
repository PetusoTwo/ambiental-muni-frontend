import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DenounceQueryComponent } from './denounce-query.component';

describe('DenounceQueryComponent', () => {
  let component: DenounceQueryComponent;
  let fixture: ComponentFixture<DenounceQueryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DenounceQueryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DenounceQueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
