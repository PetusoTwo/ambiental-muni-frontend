import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DenouncedAspectsComponent } from './denounced-aspects.component';

describe('DenouncedAspectsComponent', () => {
  let component: DenouncedAspectsComponent;
  let fixture: ComponentFixture<DenouncedAspectsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DenouncedAspectsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DenouncedAspectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
