import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VerEventosPage } from './ver-eventos.page';

describe('VerEventosPage', () => {
  let component: VerEventosPage;
  let fixture: ComponentFixture<VerEventosPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(VerEventosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
