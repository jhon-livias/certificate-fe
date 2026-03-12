import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerateSend } from './generate-send';

describe('GenerateSend', () => {
  let component: GenerateSend;
  let fixture: ComponentFixture<GenerateSend>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenerateSend]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenerateSend);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
