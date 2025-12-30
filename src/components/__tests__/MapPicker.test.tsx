import React, { StrictMode } from "react";
import { render, waitFor } from "@testing-library/react";
import { MapPicker } from "../MapPicker";

jest.mock("maplibre-gl", () => {
  const mapInstances: any[] = [];

  class Map {
    handlers: Record<string, (event: any) => void> = {};

    constructor() {
      mapInstances.push(this);
    }

    addControl() {}

    on(event: string, handler: (event: any) => void) {
      this.handlers[event] = handler;
    }

    flyTo() {}

    remove() {}
  }

  class Marker {
    setLngLat() {
      return this;
    }

    addTo() {
      return this;
    }
  }

  class NavigationControl {}

  const api = {
    Map,
    Marker,
    NavigationControl,
    __getMapInstances: () => mapInstances
  };

  return { __esModule: true, default: api };
});

const maplibre = require("maplibre-gl").default as {
  __getMapInstances: () => any[];
};

beforeEach(() => {
  maplibre.__getMapInstances().length = 0;
});

test("re-initializes the map in React strict mode", async () => {
  render(
    <StrictMode>
      <MapPicker label="Pickup pin" onChange={jest.fn()} />
    </StrictMode>
  );

  await waitFor(() => {
    expect(maplibre.__getMapInstances().length).toBe(2);
  });
});

test("calls onChange when the map is clicked", async () => {
  const onChange = jest.fn();

  render(<MapPicker label="Pickup pin" onChange={onChange} />);

  await waitFor(() => {
    expect(maplibre.__getMapInstances().length).toBe(1);
  });

  const [mapInstance] = maplibre.__getMapInstances();
  mapInstance.handlers.click({ lngLat: { lat: 23.75, lng: 90.39 } });

  expect(onChange).toHaveBeenCalledWith({ lat: 23.75, lng: 90.39 });
});
