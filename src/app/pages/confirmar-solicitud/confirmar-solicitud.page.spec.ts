import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmarSolicitudPage } from './confirmar-solicitud.page';

describe('ConfirmarSolicitudPage', () => {
  let component: ConfirmarSolicitudPage;
  let fixture: ComponentFixture<ConfirmarSolicitudPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmarSolicitudPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
