import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GruposRebanho } from './grupos-rebanho';

describe('GruposRebanho', () => {
  let component: GruposRebanho;
  let fixture: ComponentFixture<GruposRebanho>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GruposRebanho],
    }).compileComponents();

    fixture = TestBed.createComponent(GruposRebanho);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
