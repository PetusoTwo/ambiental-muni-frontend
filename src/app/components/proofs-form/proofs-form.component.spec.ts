import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProofsFormComponent } from './proofs-form.component';

describe('ProofsFormComponent', () => {
  let component: ProofsFormComponent;
  let fixture: ComponentFixture<ProofsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProofsFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProofsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
