import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonButtons,
  ModalController
} from '@ionic/angular/standalone';
import { Workspace } from 'src/app/interfaces/workspace';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { informationCircleOutline, close } from 'ionicons/icons';

@Component({
  selector: 'app-workspace-details',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonList,
    IonItem,
    IonLabel,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonButtons
  ],
  template: `
    <ion-header translucent>
      <ion-toolbar>
        <ion-title>Detalles</ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="close()">
            <ion-icon [icon]="closeIcon"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <ion-card *ngIf="workspace">
        <ion-card-header>
          <ion-card-title>{{ workspace.name }}</ion-card-title>
          <ion-card-subtitle>{{ workspace.space_type }}</ion-card-subtitle>
        </ion-card-header>
        <ion-card-content>
          <div class="detail-row">
            <strong>Aforo Máximo:</strong>
            <span>{{ workspace.max_occupancy }}</span>
          </div>

          <div class="detail-row" *ngIf="workspace.description">
            <strong>Descripción:</strong>
            <div [innerHTML]="safeDescription"></div>
          </div>

          <div class="detail-row">
            <strong>Recursos:</strong>
            <div *ngIf="workspace.resources && workspace.resources.length; else noRes">
              <ion-list>
                <ion-item *ngFor="let r of workspace.resources">
                  <ion-label>{{ r.resource_name }} ({{ r.quantity }})</ion-label>
                </ion-item>
              </ion-list>
            </div>
            <ng-template #noRes><p>No hay recursos disponibles</p></ng-template>
          </div>

        </ion-card-content>
      </ion-card>
    </ion-content>
  `
})
export class WorkspaceDetailsComponent {
  @Input() workspace!: Workspace;
  public safeDescription: SafeHtml | string = '';
  public closeIcon = close;

  constructor(private modalCtrl: ModalController, private sanitizer: DomSanitizer) {}

  ngOnInit() {
    if (this.workspace && this.workspace.description) {
      // Allow basic HTML present in description but sanitize it
      this.safeDescription = this.sanitizer.bypassSecurityTrustHtml(this.workspace.description);
    }
  }

  close() {
    this.modalCtrl.dismiss();
  }
}
