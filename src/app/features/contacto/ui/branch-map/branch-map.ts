import {
  Component,
  effect,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { GoogleMap, MapMarker } from '@angular/google-maps';
import {
  BRANCH_MARKER_ICON,
  Branch,
  MAP_DEFAULT_CENTER,
  MAP_DEFAULT_ZOOM,
  MAP_FOCUS_ZOOM,
} from '../../util/contacto-data';
import { LatLng } from '../../util/geo';
import { loadGoogleMaps } from '../../util/google-maps-loader';

@Component({
  selector: 'app-branch-map',
  imports: [GoogleMap, MapMarker],
  templateUrl: './branch-map.html',
  styleUrl: './branch-map.css',
})
export class BranchMap {
  readonly branches = input.required<Branch[]>();
  readonly selectedId = input<string | null>(null);
  /** Ubicación del usuario (si aceptó geolocalización). */
  readonly userLocation = input<LatLng | null>(null);
  readonly markerClick = output<string>();

  protected readonly ready = signal(false);
  protected readonly loadError = signal(false);
  protected readonly center = signal(MAP_DEFAULT_CENTER);
  protected readonly zoom = signal(MAP_DEFAULT_ZOOM);

  protected readonly markerOptions = signal<google.maps.MarkerOptions>({});
  protected readonly userMarkerOptions = signal<google.maps.MarkerOptions>({});

  private readonly map = viewChild(GoogleMap);
  private didCenterOnUser = false;

  constructor() {
    void loadGoogleMaps()
      .then(() => {
        this.markerOptions.set({
          icon: {
            url: BRANCH_MARKER_ICON,
            scaledSize: new google.maps.Size(40, 41),
          },
        });
        this.userMarkerOptions.set({
          title: 'Tu ubicación',
          zIndex: 999,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: '#4285F4',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 3,
          },
        });
        this.ready.set(true);
      })
      .catch(() => this.loadError.set(true));

    // Centrar en el usuario la primera vez que llega la ubicación.
    effect(() => {
      const user = this.userLocation();
      if (!user || !this.ready() || this.didCenterOnUser) {
        return;
      }
      this.didCenterOnUser = true;
      this.center.set(user);
      this.zoom.set(MAP_FOCUS_ZOOM);
      const gmap = this.map()?.googleMap;
      gmap?.panTo(user);
      gmap?.setZoom(MAP_FOCUS_ZOOM);
    });

    // Click en lista → focus a esa sucursal.
    effect(() => {
      const id = this.selectedId();
      const list = this.branches();
      if (!id || !this.ready()) {
        return;
      }
      const branch = list.find((b) => b.id === id);
      if (!branch) {
        return;
      }
      this.center.set({ lat: branch.lat, lng: branch.lng });
      this.zoom.set(MAP_FOCUS_ZOOM);
      const gmap = this.map()?.googleMap;
      gmap?.panTo({ lat: branch.lat, lng: branch.lng });
      gmap?.setZoom(MAP_FOCUS_ZOOM);
    });
  }

  protected positionOf(branch: Branch): google.maps.LatLngLiteral {
    return { lat: branch.lat, lng: branch.lng };
  }

  protected onMarkerClick(branchId: string): void {
    this.markerClick.emit(branchId);
  }
}
