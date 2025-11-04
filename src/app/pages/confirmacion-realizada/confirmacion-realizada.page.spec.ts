import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmacionRealizadaPage } from './confirmacion-realizada.page';

describe('ConfirmacionRealizadaPage', () => {
  let component: ConfirmacionRealizadaPage;
  let fixture: ComponentFixture<ConfirmacionRealizadaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmacionRealizadaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
