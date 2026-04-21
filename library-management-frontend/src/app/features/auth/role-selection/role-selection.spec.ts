import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleSelectionComponent } from './role-selection';

describe('RoleSelection', () => {
  let component: RoleSelectionComponent;
  let fixture: ComponentFixture<RoleSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoleSelectionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RoleSelectionComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
