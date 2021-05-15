import { TestBed } from '@angular/core/testing';

import { NgGaurdGuard } from './ng-gaurd.guard';

describe('NgGaurdGuard', () => {
  let guard: NgGaurdGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(NgGaurdGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
