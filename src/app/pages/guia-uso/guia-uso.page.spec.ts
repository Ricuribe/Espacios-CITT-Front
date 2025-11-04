import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GuiaUsoPage } from './guia-uso.page';

describe('GuiaUsoPage', () => {
  let component: GuiaUsoPage;
  let fixture: ComponentFixture<GuiaUsoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GuiaUsoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
