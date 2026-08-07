import { NextRequest, NextResponse } from "next/server";
import { googlePlacesProvider } from "@/services/grocery/providers";

/** City centroids used when geocoding is unavailable or address is a known location option */
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  Canberra: { lat: -35.2809, lng: 149.13 },
  Sydney: { lat: -33.8688, lng: 151.2093 },
  Melbourne: { lat: -37.8136, lng: 144.9631 },
  Brisbane: { lat: -27.4698, lng: 153.0251 },
  Perth: { lat: -31.9505, lng: 115.8605 },
  Adelaide: { lat: -34.9285, lng: 138.6007 },
  Hobart: { lat: -42.8821, lng: 147.3272 },
  Darwin: { lat: -12.4634, lng: 130.8456 },
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const latParam = searchParams.get("lat");
    const lngParam = searchParams.get("lng");
    const address = searchParams.get("address") || searchParams.get("location");
    const radius = Number(searchParams.get("radius") || 5000);

    let lat = latParam ? Number(latParam) : NaN;
    let lng = lngParam ? Number(lngParam) : NaN;

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      if (address && CITY_COORDS[address]) {
        lat = CITY_COORDS[address].lat;
        lng = CITY_COORDS[address].lng;
      } else if (address && googlePlacesProvider.isConfigured()) {
        const geo = await googlePlacesProvider.geocode(`${address}, Australia`);
        if (geo) {
          lat = geo.lat;
          lng = geo.lng;
        }
      }
    }

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return NextResponse.json(
        {
          error:
            "Provide lat/lng, or a known Australian city (e.g. Canberra). Configure GOOGLE_MAPS_API_KEY for geocoding.",
        },
        { status: 400 }
      );
    }

    if (!googlePlacesProvider.isConfigured()) {
      // Deterministic demo stores near the requested point
      return NextResponse.json({
        data: demoNearbyStores(lat, lng),
        source: "mock",
        center: { lat, lng },
      });
    }

    const stores = await googlePlacesProvider.findNearbySupermarkets(
      lat,
      lng,
      Number.isFinite(radius) ? radius : 5000
    );

    return NextResponse.json({
      data: stores,
      source: "google-places",
      center: { lat, lng },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Nearby store lookup failed" },
      { status: 500 }
    );
  }
}

function demoNearbyStores(lat: number, lng: number) {
  const offsets = [
    { chain: "coles" as const, name: "Coles", dLat: 0.008, dLng: 0.004 },
    {
      chain: "woolworths" as const,
      name: "Woolworths",
      dLat: -0.006,
      dLng: 0.01,
    },
    { chain: "aldi" as const, name: "ALDI", dLat: 0.003, dLng: -0.007 },
  ];

  return offsets.map((o, i) => {
    const sLat = lat + o.dLat;
    const sLng = lng + o.dLng;
    const distanceMeters = Math.round(
      Math.sqrt((o.dLat * 111_000) ** 2 + (o.dLng * 111_000 * Math.cos((lat * Math.PI) / 180)) ** 2)
    );
    return {
      id: `demo-${o.chain}-${i}`,
      name: `${o.name} (demo)`,
      chain: o.chain,
      address: "Demo address — configure Google Maps API key for live results",
      lat: sLat,
      lng: sLng,
      distanceMeters,
    };
  });
}
