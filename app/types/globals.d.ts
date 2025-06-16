// app/types/globals.d.ts
declare namespace google.maps {
  class LatLngBounds {
    constructor(sw?: LatLng, ne?: LatLng);
    extend(point: LatLng): void;
  }

  class LatLng {
    constructor(lat: number, lng: number);
    lat(): number;
    lng(): number;
  }

  class event {
    static clearInstanceListeners(instance: any): void;
  }

  namespace places {
    class Autocomplete {
      constructor(inputField: HTMLInputElement, opts?: AutocompleteOptions);
      getPlace(): PlaceResult;
      addListener(eventName: string, handler: Function): MapsEventListener;
    }

    interface AutocompleteOptions {
      bounds?: LatLngBounds;
      componentRestrictions?: ComponentRestrictions;
      fields?: string[];
      strictBounds?: boolean;
      types?: string[];
    }

    interface ComponentRestrictions {
      country: string | string[];
    }

    interface PlaceResult {
      formatted_address?: string;
      geometry?: PlaceGeometry;
      name?: string;
    }

    interface PlaceGeometry {
      location?: LatLng;
    }

    interface MapsEventListener {
      remove(): void;
    }
  }
}

declare var google: {
  maps: {
    LatLngBounds: typeof google.maps.LatLngBounds;
    LatLng: typeof google.maps.LatLng;
    places: typeof google.maps.places;
    event: typeof google.maps.event;
  };
};
