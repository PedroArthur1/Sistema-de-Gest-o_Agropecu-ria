import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GruposRebanhoComponent } from './grupos-rebanho';

describe('GruposRebanho', () => {
  let component: GruposRebanhoComponent;
  let fixture: ComponentFixture<GruposRebanhoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GruposRebanhoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GruposRebanhoComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
