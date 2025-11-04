import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InformacionProyectoPage } from './informacion-proyecto.page';

describe('InformacionProyectoPage', () => {
  let component: InformacionProyectoPage;
  let fixture: ComponentFixture<InformacionProyectoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(InformacionProyectoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
