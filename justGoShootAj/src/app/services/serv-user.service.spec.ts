import { TestBed } from '@angular/core/testing';

import { ServUser } from './serv-user.service';

describe('ServUserService', () => {
  let service: ServUser;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServUser);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
