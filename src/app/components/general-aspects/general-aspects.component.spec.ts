import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralAspectsComponent } from './general-aspects.component';

describe('GeneralAspectsComponent', () => {
  let component: GeneralAspectsComponent;
  let fixture: ComponentFixture<GeneralAspectsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GeneralAspectsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GeneralAspectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
