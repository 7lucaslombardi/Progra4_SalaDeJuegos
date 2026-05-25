import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClickTheCircle } from './click-the-circle';

describe('ClickTheCircle', () => {
  let component: ClickTheCircle;
  let fixture: ComponentFixture<ClickTheCircle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClickTheCircle],
    }).compileComponents();

    fixture = TestBed.createComponent(ClickTheCircle);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
