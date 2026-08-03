import {
  Component,
  effect,
  inject,
  Injector,
  input,
  output,
  runInInjectionContext,
  signal,
} from '@angular/core';
import { GoogleMap, MapMarker } from '@angular/google-maps';
import {
  MAP_DEFAULT_CENTER,
  MAP_DEFAULT_ZOOM,
} from '../../../../contacto/data/contacto.models';
import { loadGoogleMaps } from '../../../../contacto/util/google-maps-loader';

@Component({
  selector: 'app-branch-picker-map',
  imports: [GoogleMap, MapMarker],
  templateUrl: './branch-picker-map.html',
  styleUrl: './branch-picker-map.css',
})
export class BranchPickerMap {
  private readonly injector = inject(Injector);

  readonly lat = input.required<number>();
  readonly lng = input.required<number>();
  readonly positionChange = output<{ lat: number; lng: number }>();

  protected readonly ready = signal(false);
  protected readonly loadError = signal(false);
  protected readonly center = signal(MAP_DEFAULT_CENTER);
  protected readonly zoom = signal(MAP_DEFAULT_ZOOM);
  protected readonly markerPos = signal(MAP_DEFAULT_CENTER);
  protected readonly markerOptions: google.maps.MarkerOptions = {
    draggable: true,
    title: 'Arrastrá el pin o hacé click en el mapa',
  };

  constructor() {
    void loadGoogleMaps()
      .then(() => this.ready.set(true))
      .catch(() => this.loadError.set(true));

    // Solo recentrar cuando llegan coords nuevas desde el form (abrir/editar),
    // no pelear con el drag del pin.
    runInInjectionContext(this.injector, () =>
      effect(() => {
        const lat = this.lat();
        const lng = this.lng();
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
        const cur = this.markerPos();
        if (cur.lat === lat && cur.lng === lng) return;
        const next = { lat, lng };
        this.markerPos.set(next);
        this.center.set(next);
      }),
    );
  }

  protected onMapClick(
    event: google.maps.MapMouseEvent | google.maps.IconMouseEvent,
  ): void {
    const latLng = event.latLng;
    if (!latLng) return;
    this.applyPosition(latLng.lat(), latLng.lng());
  }

  protected onMarkerDragEnd(
    event: google.maps.MapMouseEvent | google.maps.IconMouseEvent,
  ): void {
    const latLng = event.latLng;
    if (!latLng) return;
    this.applyPosition(latLng.lat(), latLng.lng());
  }

  private applyPosition(lat: number, lng: number): void {
    this.markerPos.set({ lat, lng });
    this.positionChange.emit({ lat, lng });
  }
}
