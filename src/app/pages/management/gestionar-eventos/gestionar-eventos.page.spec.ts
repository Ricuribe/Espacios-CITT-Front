import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GestionarEventosPage } from './gestionar-eventos.page';

describe('GestionarEventosPage', () => {
  let component: GestionarEventosPage;
  let fixture: ComponentFixture<GestionarEventosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GestionarEventosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
