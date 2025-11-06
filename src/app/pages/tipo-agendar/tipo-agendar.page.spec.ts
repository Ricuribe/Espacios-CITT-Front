import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TipoAgendarPage } from './tipo-agendar.page';

describe('TipoAgendarPage', () => {
  let component: TipoAgendarPage;
  let fixture: ComponentFixture<TipoAgendarPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TipoAgendarPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
