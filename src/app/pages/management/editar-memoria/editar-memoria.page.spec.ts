import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditarMemoriaPage } from './editar-memoria.page';

describe('EditarMemoriaPage', () => {
  let component: EditarMemoriaPage;
  let fixture: ComponentFixture<EditarMemoriaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EditarMemoriaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
