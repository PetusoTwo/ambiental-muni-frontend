import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AmbientalDenounceFormComponent } from './ambiental-denounce-form.component';

describe('AmbientalDenounceFormComponent', () => {
  let component: AmbientalDenounceFormComponent;
  let fixture: ComponentFixture<AmbientalDenounceFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AmbientalDenounceFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AmbientalDenounceFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
