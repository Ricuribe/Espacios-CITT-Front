import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgendarHoraPage } from './agendar-hora.page';

describe('AgendarHoraPage', () => {
  let component: AgendarHoraPage;
  let fixture: ComponentFixture<AgendarHoraPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AgendarHoraPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
