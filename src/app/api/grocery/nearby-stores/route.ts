import { NextRequest, NextResponse } from "next/server";
import {
  buildStoreId,
  googlePlacesProvider,
} from "@/services/grocery/providers/google-places.provider";
import type { NearbyStore } from "@/types/grocery";

/** City centroids used when geocoding is unavailable or address is a known location option */
const CITY_COORDS: Record<string, { lat: number; lng: number; postcode?: string }> = {
  Canberra: { lat: -35.2809, lng: 149.13, postcode: "2600" },
  Sydney: { lat: -33.8688, lng: 151.2093, postcode: "2000" },
  Melbourne: { lat: -37.8136, lng: 144.9631, postcode: "3000" },
  Brisbane: { lat: -27.4698, lng: 153.0251, postcode: "4000" },
  Perth: { lat: -31.9505, lng: 115.8605, postcode: "6000" },
  Adelaide: { lat: -34.9285, lng: 138.6007, postcode: "5000" },
  Hobart: { lat: -42.8821, lng: 147.3272, postcode: "7000" },
  Darwin: { lat: -12.4634, lng: 130.8456, postcode: "0800" },
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const latParam = searchParams.get("lat");
    const lngParam = searchParams.get("lng");
    const address = searchParams.get("address") || searchParams.get("location");
    const postcodeParam = searchParams.get("postcode") || undefined;
    const radius = Number(searchParams.get("radius") || 5000);

    let lat = latParam ? Number(latParam) : NaN;
    let lng = lngParam ? Number(lngParam) : NaN;
    let postcode = postcodeParam;

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      if (address && CITY_COORDS[address]) {
        lat = CITY_COORDS[address].lat;
        lng = CITY_COORDS[address].lng;
        postcode = postcode ?? CITY_COORDS[address].postcode;
      } else if (address && googlePlacesProvider.isConfigured()) {
        const geo = await googlePlacesProvider.geocode(
          postcode
            ? `${address} ${postcode}, Australia`
            : `${address}, Australia`
        );
        if (geo) {
          lat = geo.lat;
          lng = geo.lng;
        }
      } else if (postcode && googlePlacesProvider.isConfigured()) {
        const geo = await googlePlacesProvider.geocode(
          `${postcode}, Australia`
        );
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
            "Provide lat/lng, postcode, or a known Australian city (e.g. Canberra). Configure GOOGLE_MAPS_API_KEY for geocoding.",
        },
        { status: 400 }
      );
    }

    if (!googlePlacesProvider.isConfigured()) {
      return NextResponse.json({
        data: demoNearbyStores(lat, lng, postcode),
        source: "mock",
        center: { lat, lng, postcode },
        notice:
          "Showing sample nearby stores. Add GOOGLE_MAPS_API_KEY (or NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) to .env.local and restart the dev server for real Coles / Woolworths / ALDI / IGA locations.",
      });
    }

    const stores = await googlePlacesProvider.findNearbySupermarkets(
      lat,
      lng,
      Number.isFinite(radius) ? radius : 5000,
      postcode
    );

    return NextResponse.json({
      data: stores,
      source: "google-places-nearbysearch",
      center: { lat, lng, postcode },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Nearby store lookup failed" },
      { status: 500 }
    );
  }
}

function demoNearbyStores(
  lat: number,
  lng: number,
  postcode?: string
): NearbyStore[] {
  const offsets: Array<{
    chain: NearbyStore["chain"];
    name: string;
    dLat: number;
    dLng: number;
  }> = [
    { chain: "coles", name: "Coles", dLat: 0.008, dLng: 0.004 },
    { chain: "woolworths", name: "Woolworths", dLat: -0.006, dLng: 0.01 },
    { chain: "aldi", name: "ALDI", dLat: 0.003, dLng: -0.007 },
    { chain: "iga", name: "IGA", dLat: -0.004, dLng: -0.005 },
  ];

  return offsets.map((o, i) => {
    const sLat = lat + o.dLat;
    const sLng = lng + o.dLng;
    const distanceMeters = Math.round(
      Math.sqrt(
        (o.dLat * 111_000) ** 2 +
          (o.dLng * 111_000 * Math.cos((lat * Math.PI) / 180)) ** 2
      )
    );
    const id = `demo-${o.chain}-${postcode ?? "local"}-${i}`;
    return {
      id,
      name: o.name,
      chain: o.chain,
      storeId: buildStoreId(o.chain, id, postcode),
      address: postcode
        ? `Sample location near ${postcode} (Google Maps key not configured)`
        : "Sample location — add GOOGLE_MAPS_API_KEY to .env.local for live results",
      postcode,
      lat: sLat,
      lng: sLng,
      distanceMeters,
    };
  });
}
