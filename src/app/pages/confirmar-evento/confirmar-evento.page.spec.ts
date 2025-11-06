import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmarEventoPage } from './confirmar-evento.page';

describe('ConfirmarEventoPage', () => {
  let component: ConfirmarEventoPage;
  let fixture: ComponentFixture<ConfirmarEventoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmarEventoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
