import { Routes } from '@angular/router';
import { AuthGuard } from './service/auth.guard';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.page').then( m => m.HomePage)
  },
  {
    path: 'registro',
    loadComponent: () => import('./pages/registro/registro.page').then( m => m.RegistroPage)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'inicio-usuario',
    loadComponent: () => import('./pages/inicio-usuario/inicio-usuario.page').then( m => m.InicioUsuarioPage),
    canActivate: [AuthGuard] // Acceso general (cualquier rol logueado)
  },
  
  // --- RUTAS DE GESTIÓN DE EVENTOS (Coordinador y Administrativo) ---
  {
    path: 'gestionar-eventos',
    loadComponent: () => import('./pages/management/gestionar-eventos/gestionar-eventos.page').then( m => m.GestionarEventosPage),
    canActivate: [AuthGuard],
    data: { roles: ['coordinador', 'administrativo'] } // <--- RESTRICCIÓN
  },
  {
    path: 'evento-agendar',
    loadComponent: () => import('./pages/evento-agendar/evento-agendar.page').then( m => m.EventoAgendarPage),
    canActivate: [AuthGuard],
    data: { roles: ['coordinador', 'administrativo'] } // <--- RESTRICCIÓN
  },
  {
    path: 'confirmar-evento',
    loadComponent: () => import('./pages/confirmar-evento/confirmar-evento.page').then( m => m.ConfirmarEventoPage),
    canActivate: [AuthGuard],
    data: { roles: ['coordinador', 'administrativo'] } // <--- RESTRICCIÓN
  },
  {
    path: 'confirmacion-realizada',
    loadComponent: () => import('./pages/confirmacion-realizada/confirmacion-realizada.page').then( m => m.ConfirmacionRealizadaPage),
    canActivate: [AuthGuard],
    data: { roles: ['coordinador', 'administrativo'] } // <--- RESTRICCIÓN
  },
  {
    path: 'editar-evento/:id',
    loadComponent: () => import('./pages/management/editar-evento/editar-evento.page').then( m => m.EditarEventoPage),
    canActivate: [AuthGuard],
    data: { roles: ['coordinador', 'administrativo'] } // <--- RESTRICCIÓN
  },

  // --- RUTAS DE GESTIÓN DE MEMORIAS (Solo Administrativo) ---
  {
    path: 'crear-memoria',
    loadComponent: () => import('./pages/management/crear-memoria/crear-memoria.page').then( m => m.CrearMemoriaPage),
    canActivate: [AuthGuard],
    data: { roles: ['administrativo'] } // <--- RESTRICCIÓN TOTAL
  },
  {
    path: 'editar-memoria/:id',
    loadComponent: () => import('./pages/management/editar-memoria/editar-memoria.page').then( m => m.EditarMemoriaPage),
    canActivate: [AuthGuard],
    data: { roles: ['administrativo'] } // <--- RESTRICCIÓN TOTAL
  },

  // --- RUTAS GENERALES / ALUMNO ---
  {
    path: 'ver-eventos',
    loadComponent: () => import('./ver-eventos/ver-eventos.page').then( m => m.VerEventosPage),
    // Si esta es pública, no lleva Guard. Si es solo para alumnos logueados, agregas AuthGuard sin roles.
  },
  {
    path: 'proyectos',
    loadComponent: () => import('./pages/proyectos/proyectos.page').then( m => m.ProyectosPage),
    canActivate: [AuthGuard] // Accesible para todos los logueados
  },
  {
    path: 'informacion-proyecto/:id',
    loadComponent: () => import('./pages/informacion-proyecto/informacion-proyecto.page').then( m => m.InformacionProyectoPage),
    canActivate: [AuthGuard] // Accesible para todos los logueados
  },
  {
    path: 'seleccion-espacio',
    loadComponent: () => import('./pages/seleccion-espacio/seleccion-espacio.page').then( m => m.SeleccionEspacioPage),
    canActivate: [AuthGuard],
    // Asumiendo que esto también es de gestión ahora:
    data: { roles: ['coordinador', 'administrativo'] } 
  },
  {
    path: 'mis-solicitudes',
    loadComponent: () => import('./pages/mis-solicitudes/mis-solicitudes.page').then( m => m.MisSolicitudesPage),
    canActivate: [AuthGuard]
  },
  {
    path: 'mis-solicitudes-detalle',
    loadComponent: () => import('./pages/mis-solicitudes-detalle/mis-solicitudes-detalle.page').then( m => m.MisSolicitudesDetallePage),
    canActivate: [AuthGuard]
  },
  {
    path: 'guia-uso',
    loadComponent: () => import('./pages/guia-uso/guia-uso.page').then( m => m.GuiaUsoPage)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  // Fallback para rutas no encontradas (opcional)
  {
    path: '**',
    redirectTo: 'home'
  }
];