import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CrearMemoriaPage } from './crear-memoria.page';

describe('CrearMemoriaPage', () => {
  let component: CrearMemoriaPage;
  let fixture: ComponentFixture<CrearMemoriaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CrearMemoriaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
