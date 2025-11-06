import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventoAgendarPage } from './evento-agendar.page';

describe('EventoAgendarPage', () => {
  let component: EventoAgendarPage;
  let fixture: ComponentFixture<EventoAgendarPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EventoAgendarPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
