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
    loadComponent: () => import('./pages/confirmar-solicitud/confirmar-solicitud.page').then( m => m.ConfirmarSolicitudPage)
  },
  {
    path: 'confirmacion-realizada',
    loadComponent: () => import('./pages/confirmacion-realizada/confirmacion-realizada.page').then( m => m.ConfirmacionRealizadaPage)
  },
  {
    path: 'informacion-proyecto',
    loadComponent: () => import('./pages/informacion-proyecto/informacion-proyecto.page').then( m => m.InformacionProyectoPage)
  },
];
