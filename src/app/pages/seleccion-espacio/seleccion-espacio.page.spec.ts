import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SeleccionEspacioPage } from './seleccion-espacio.page';

describe('SeleccionEspacioPage', () => {
  let component: SeleccionEspacioPage;
  let fixture: ComponentFixture<SeleccionEspacioPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SeleccionEspacioPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
