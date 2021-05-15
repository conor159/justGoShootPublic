import { TestBed } from '@angular/core/testing';

import { UserGalleryGuard } from './user-gallery.guard';

describe('UserGalleryGuard', () => {
  let guard: UserGalleryGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(UserGalleryGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
