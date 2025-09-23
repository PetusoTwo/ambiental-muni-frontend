import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonInformationFormComponent } from './person-information-form.component';

describe('PersonInformationFormComponent', () => {
  let component: PersonInformationFormComponent;
  let fixture: ComponentFixture<PersonInformationFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonInformationFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PersonInformationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
