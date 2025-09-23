import { TestBed } from '@angular/core/testing';

import { ApiReniecService } from './api-reniec.service';

describe('ApiReniecService', () => {
  let service: ApiReniecService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiReniecService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
