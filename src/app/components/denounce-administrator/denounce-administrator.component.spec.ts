import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DenounceAdministratorComponent } from './denounce-administrator.component';

describe('DenounceAdministratorComponent', () => {
  let component: DenounceAdministratorComponent;
  let fixture: ComponentFixture<DenounceAdministratorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DenounceAdministratorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DenounceAdministratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
