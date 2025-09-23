import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DenounceTrackingModalComponent } from './denounce-tracking-modal.component';

describe('DenounceTrackingModalComponent', () => {
  let component: DenounceTrackingModalComponent;
  let fixture: ComponentFixture<DenounceTrackingModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DenounceTrackingModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DenounceTrackingModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
