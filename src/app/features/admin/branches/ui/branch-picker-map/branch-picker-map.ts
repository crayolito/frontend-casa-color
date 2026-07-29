import {
  Component,
  effect,
  input,
  output,
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
  readonly lat = input.required<number>();
  readonly lng = input.required<number>();
  readonly positionChange = output<{ lat: number; lng: number }>();

  protected readonly ready = signal(false);
  protected readonly loadError = signal(false);
  protected readonly center = signal(MAP_DEFAULT_CENTER);
  protected readonly zoom = signal(MAP_DEFAULT_ZOOM);
  protected readonly markerPosition = signal(MAP_DEFAULT_CENTER);

  constructor() {
    void loadGoogleMaps()
      .then(() => this.ready.set(true))
      .catch(() => this.loadError.set(true));

    effect(() => {
      const lat = this.lat();
      const lng = this.lng();
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
      const pos = { lat, lng };
      this.markerPosition.set(pos);
      this.center.set(pos);
    });
  }

  protected onMapClick(event: google.maps.MapMouseEvent | google.maps.IconMouseEvent): void {
    const latLng = event.latLng;
    if (!latLng) return;
    const lat = latLng.lat();
    const lng = latLng.lng();
    this.markerPosition.set({ lat, lng });
    this.positionChange.emit({ lat, lng });
  }
}
