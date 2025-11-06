import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.page').then( m => m.HomePage)
  },
  {
    path: 'inicio-usuario',
    loadComponent: () => import('./pages/inicio-usuario/inicio-usuario.page').then( m => m.InicioUsuarioPage)
  },
  {
    path: 'guia-uso',
    loadComponent: () => import('./pages/guia-uso/guia-uso.page').then( m => m.GuiaUsoPage)
  },
  {
    path: 'seleccion-espacio',
    loadComponent: () => import('./pages/seleccion-espacio/seleccion-espacio.page').then( m => m.SeleccionEspacioPage)
  },
  {
    path: 'agendar-hora',
    loadComponent: () => import('./pages/agendar-hora/agendar-hora.page').then( m => m.AgendarHoraPage)
  },
  {
    path: 'detalle-espacio/:id',
    loadComponent: () => import('./pages/detalle-espacio/detalle-espacio.page').then( m => m.DetalleEspacioPage)
  },
  {
    path: 'mis-solicitudes',
    loadComponent: () => import('./pages/mis-solicitudes/mis-solicitudes.page').then( m => m.MisSolicitudesPage)
  },
  {
    path: 'proyectos',
    loadComponent: () => import('./pages/proyectos/proyectos.page').then( m => m.ProyectosPage)
  },
  {
    path: 'confirmar-solicitud',
    // CAMBIO: Volvemos a m.ConfirmarSolicitudPage porque tu archivo NO usa 'default'
    // ...
loadComponent: () => import('./pages/confirmar-solicitud/confirmar-solicitud.page').then( m => m.ConfirmarSolicitudPage) // <-- ASÍ ES CORRECTO
// ...
  },
  {
    path: 'confirmacion-realizada',
    // CAMBIO: Volvemos a m.ConfirmacionRealizadaPage
    loadComponent: () => import('./pages/confirmacion-realizada/confirmacion-realizada.page').then( m => m.ConfirmacionRealizadaPage)
  },
  {
  path: 'informacion-proyecto/:id',
  loadComponent: () => import('./pages/informacion-proyecto/informacion-proyecto.page').then( m => m.InformacionProyectoPage)
  },
  {
    path: 'registro',
    loadComponent: () => import('./pages/registro/registro.page').then( m => m.RegistroPage)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then( m => m.LoginPage)
  },  {
    path: 'tipo-agendar',
    loadComponent: () => import('./pages/tipo-agendar/tipo-agendar.page').then( m => m.TipoAgendarPage)
  },
  {
    path: 'evento-agendar',
    loadComponent: () => import('./pages/evento-agendar/evento-agendar.page').then( m => m.EventoAgendarPage)
  },
  {
    path: 'otro-agendar-espacio',
    loadComponent: () => import('./pages/otro-agendar-espacio/otro-agendar-espacio.page').then( m => m.OtroAgendarEspacioPage)
  },




  
];
