import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetalleEspacioPage } from './detalle-espacio.page';

describe('DetalleEspacioPage', () => {
  let component: DetalleEspacioPage;
  let fixture: ComponentFixture<DetalleEspacioPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DetalleEspacioPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
