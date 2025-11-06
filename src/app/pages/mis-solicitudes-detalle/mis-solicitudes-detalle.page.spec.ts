import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MisSolicitudesDetallePage } from './mis-solicitudes-detalle.page';

describe('MisSolicitudesDetallePage', () => {
  let component: MisSolicitudesDetallePage;
  let fixture: ComponentFixture<MisSolicitudesDetallePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MisSolicitudesDetallePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
