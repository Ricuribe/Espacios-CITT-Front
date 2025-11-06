import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { ApiService } from './http-client';

export interface ActivityResponse {
  events: Array<any>;
  bookings: Array<any>;
}

@Injectable({ providedIn: 'root' })
export class SlotService {
  private cachedActivities: ActivityResponse | null = null;

  constructor(private api: ApiService) {}

  /** Carga actividades futuras generales */
  async loadActivities(forceRefresh = false): Promise<ActivityResponse> {
    if (this.cachedActivities && !forceRefresh) return this.cachedActivities;
    const obs = this.api.getFutureActivities();
    const resp = await lastValueFrom(obs);
    this.cachedActivities = resp;
    return resp;
  }

  /** Carga actividades para workspace específico */
  async loadActivitiesByWorkspace(workspaceId: number, forceRefresh = false): Promise<ActivityResponse> {
    // For simplicity we reuse the same cache; forceRefresh will bypass it
    if (this.cachedActivities && !forceRefresh) return this.cachedActivities;
    const obs = this.api.getFutureActivitiesByWorkspaceId(workspaceId);
    const resp = await lastValueFrom(obs);
    this.cachedActivities = resp;
    return resp;
  }

  clearCache() {
    this.cachedActivities = null;
  }

  /** Genera slots a partir de 10:00 hasta 17:30 en step de 30 minutos, ajustando maxStart según duración */
  generateSlotsForDate(dateISO: string, durationMin: number): Date[] {
    const [y, m, d] = dateISO.split('-').map(Number);
    const slots: Date[] = [];
    const base = new Date(y, m - 1, d, 10, 0, 0, 0);
    // max start minute: for 30min -> 17:30, for 60 -> 17:00, for 90 -> 16:30
    const maxStartHour = 17;
    const maxStartMinute = durationMin === 30 ? 30 : durationMin === 60 ? 0 : 30;

    const endLimit = new Date(y, m - 1, d, maxStartHour, maxStartMinute, 0, 0);

    for (let dt = new Date(base); dt <= endLimit; dt.setMinutes(dt.getMinutes() + 30)) {
      // push a copy
      slots.push(new Date(dt));
    }
    return slots;
  }

  /** Comprueba si dos rangos [aStart,aEnd) y [bStart,bEnd) se sobrelapan */
  rangesOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
    return aStart < bEnd && aEnd > bStart;
  }

  /** Convierte hora de start_time (iso string) al Date usando dateScheduled si aplica */
  private bookingRangeToDates(booking: any): { start: Date; end: Date } {
    // booking.date_scheduled tiene la fecha correcta
    const dateParts = (booking.date_scheduled || '').split('-').map(Number);
    // start_time tiene hora correcta pero la fecha puede no ser correcta -> extraer hora
    const startTime = new Date(booking.start_time);
    const endTime = new Date(booking.end_time);
    const start = new Date(dateParts[0], dateParts[1] - 1, dateParts[2], startTime.getHours(), startTime.getMinutes(), 0, 0);
    const end = new Date(dateParts[0], dateParts[1] - 1, dateParts[2], endTime.getHours(), endTime.getMinutes(), 0, 0);
    return { start, end };
  }

  /** Dado un array de slots (Date) y la respuesta de actividades, devuelve los labels de slots filtrados */
  filterSlots(slots: Date[], activities: ActivityResponse, dateISO: string, durationMin: number, considerNowIfToday = true): string[] {
    const result: string[] = [];
    const [y, m, d] = dateISO.split('-').map(Number);
    const isToday = (() => {
      const today = new Date();
      return today.getFullYear() === y && (today.getMonth() + 1) === m && today.getDate() === d;
    })();

    const now = new Date();

    // Build busy ranges from bookings and events
    const busyRanges: Array<{ start: Date; end: Date }> = [];

    // bookings: use date_scheduled and time from start_time/end_time
    if (activities.bookings && activities.bookings.length) {
      for (const b of activities.bookings) {
        // Ignore bookings with statuses que NO deben bloquear: 0 (rechazado), 4 (inasistido), 6 (cancelado)
        if ([0, 4, 6].includes(b.status)) continue;
        try {
          const r = this.bookingRangeToDates(b);
          busyRanges.push(r);
        } catch (e) {
          // ignore malformed
        }
      }
    }

    // events: start_datetime & end_datetime are proper
    if (activities.events && activities.events.length) {
      for (const ev of activities.events) {
        try {
          const s = new Date(ev.start_datetime);
          const e = new Date(ev.end_datetime);
          busyRanges.push({ start: s, end: e });
        } catch (e) {
          // ignore malformed
        }
      }
    }

    for (const slotStart of slots) {
      // If today and considerNowIfToday true, skip slots that start before now
      if (isToday && considerNowIfToday) {
        if (slotStart < now) continue;
      }

      const slotEnd = new Date(slotStart);
      slotEnd.setMinutes(slotEnd.getMinutes() + durationMin);

      let collision = false;
      for (const busy of busyRanges) {
        if (this.rangesOverlap(slotStart, slotEnd, busy.start, busy.end)) {
          collision = true;
          break;
        }
      }

      if (!collision) {
        const hh = slotStart.getHours().toString().padStart(2, '0');
        const mm = slotStart.getMinutes().toString().padStart(2, '0');
        result.push(`${hh}:${mm}`);
      }
    }

    return result;
  }

  /** Alta-nivel: obtener slots filtrados, carga actividades si es necesario */
  /**
   * Obtener slots filtrados. Si forceRefresh=true hará re-fetch de actividades desde el backend.
   */
  async getAvailableSlots(dateISO: string, durationMin: number, workspaceId?: number, forceRefresh = false): Promise<string[]> {
    let activities: ActivityResponse;
    if (workspaceId != null) activities = await this.loadActivitiesByWorkspace(workspaceId, forceRefresh);
    else activities = await this.loadActivities(forceRefresh);

    const slots = this.generateSlotsForDate(dateISO, durationMin);
    return this.filterSlots(slots, activities, dateISO, durationMin, true);
  }
}
