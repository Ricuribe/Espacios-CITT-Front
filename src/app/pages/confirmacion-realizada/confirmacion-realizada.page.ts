import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonImg, IonButtons, IonButton, IonContent, IonGrid, IonRow, IonCol, IonIcon, IonMenu, IonMenuButton, IonList, IonItem, IonLabel, IonText } from '@ionic/angular/standalone';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-confirmacion-realizada',
  templateUrl: './confirmacion-realizada.page.html',
  styleUrls: ['./confirmacion-realizada.page.scss'],
  standalone: true,
  
  imports: [
    CommonModule,
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonImg,
    IonButtons,
    IonButton,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonIcon,
    IonMenu,
    IonMenuButton,
    IonList,
    IonItem,
    IonLabel,
    IonText
]
})
export class ConfirmacionRealizadaPage implements OnInit {
  
  public createdSchedule : any = null;
  private detail: any = null;
  public workspace: any = null;
  public date : string = '';
  public startHour: string = '';
  public endHour: string = '';


  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    [this.createdSchedule, this.workspace] = this.retrieveResponse();
    console.log('La reserva creada: ', this.createdSchedule);
    console.log('espacio:', this.workspace);
    this.reorderData(this.createdSchedule.schedule.date_scheduled, this.createdSchedule.schedule.start_time, this.createdSchedule.schedule.end_time)

  }

  retrieveResponse() {
    const response = this.router.getCurrentNavigation()?.extras.state?.['reserva'];
    const space = this.router.getCurrentNavigation()?.extras.state?.['workspace'];
    return [response, space];
  }

  reorderData(date : string, startTime : string, endTime: string) {
    this.date = date.split("-").reverse().join("-")
    this.startHour = startTime.split("T")[1].slice(0, 5);
    this.endHour = endTime.split("T")[1].slice(0, 5);

  }

}

