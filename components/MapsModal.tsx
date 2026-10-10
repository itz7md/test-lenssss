'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X, Search, MapPin, Loader2, Navigation, Check } from 'lucide-react';

declare global {
  interface Window {
    google?: any;
  }
}

interface MapsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (details: {
    city: string;
    district: string;
    address: string;
    buildingNumber?: string;
    shortAddressCode?: string;
    postalCode?: string;
    block?: string;
    houseNumber?: string;
    civilId?: string;
    zone?: string;
    emirate?: string;
  }) => void;
  activeCountry: string; // 'SA', 'AE', 'QA', 'BH', 'KW', 'OM'
}

const COUNTRY_FALLBACKS: Record<string, { lat: number; lng: number }> = {
  SA: { lat: 24.7136, lng: 46.6753 }, // Riyadh
  AE: { lat: 25.2048, lng: 55.2708 }, // Dubai
  QA: { lat: 25.2854, lng: 51.5310 }, // Doha
  BH: { lat: 26.2285, lng: 50.5860 }, // Manama
  KW: { lat: 29.3759, lng: 47.9774 }, // Kuwait City
  OM: { lat: 23.5859, lng: 58.4059 }, // Muscat
};

const SUPPORTED_GCC_COUNTRIES = ['SA', 'AE', 'QA', 'BH', 'KW', 'OM'];

export const MapsModal: React.FC<MapsModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  activeCountry,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [apiKey, setApiKey] = useState<string>('');
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isMapInitialized, setIsMapInitialized] = useState(false);

  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  // Reverse-geocoding states
  const [currentAddress, setCurrentAddress] = useState('جاري جلب تفاصيل الموقع...');
  const [parsedDetails, setParsedDetails] = useState<any>(null);
  const [isValidCountry, setIsValidCountry] = useState(true);
  const [detectedCountry, setDetectedCountry] = useState('');
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);

  // Load API Key and Initialize Script
  useEffect(() => {
    if (!isOpen) return;

    // Use key from public env
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
    setApiKey(key);

    if ((window as any).google && (window as any).google.maps) {
      setIsScriptLoaded(true);
      return;
    }

    const scriptId = 'google-maps-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places&language=ar&region=${activeCountry.toLowerCase()}`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setIsScriptLoaded(true);
      };
      script.onerror = () => {
        console.error('Failed to load Google Maps script.');
      };
      document.head.appendChild(script);
    } else {
      setIsScriptLoaded(true);
    }
  }, [isOpen, activeCountry]);

  // Handle Geolocation and Map Init
  useEffect(() => {
    if (!isOpen || !isScriptLoaded || !mapRef.current || isMapInitialized) return;

    const defaultCoords = COUNTRY_FALLBACKS[activeCountry] || COUNTRY_FALLBACKS.SA;

    const initMap = (lat: number, lng: number) => {
      const mapOptions = {
        center: { lat, lng },
        zoom: 15,
        disableDefaultUI: true, // Disable all default map overlays
        zoomControl: false,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
        gestureHandling: 'greedy', // One finger drag on mobile, standard drag on desktop
        styles: [
          {
            featureType: 'administrative',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#334155' }],
          },
          {
            featureType: 'landscape',
            elementType: 'all',
            stylers: [{ color: '#f8fafc' }],
          },
          {
            featureType: 'poi',
            elementType: 'all',
            stylers: [{ visibility: 'off' }], // Clean up clutter
          },
          {
            featureType: 'road',
            elementType: 'all',
            stylers: [{ saturation: -10 }, { lightness: 10 }],
          },
          {
            featureType: 'road.highway',
            elementType: 'all',
            stylers: [{ visibility: 'simplified' }],
          },
          {
            featureType: 'road.arterial',
            elementType: 'labels.icon',
            stylers: [{ visibility: 'off' }],
          },
          {
            featureType: 'transit',
            elementType: 'all',
            stylers: [{ visibility: 'off' }],
          },
          {
            featureType: 'water',
            elementType: 'all',
            stylers: [{ color: '#cbd5e1' }, { visibility: 'on' }],
          },
        ],
      };

      const map = new (window as any).google.maps.Map(mapRef.current, mapOptions);
      mapInstanceRef.current = map;
      setIsMapInitialized(true);

      // Trigger geocoding for the starting position
      handleReverseGeocode(lat, lng);

      // Set up idle listener to reverse-geocode when the center changes
      map.addListener('idle', () => {
        const center = map.getCenter();
        if (center) {
          handleReverseGeocode(center.lat(), center.lng());
        }
      });
    };

    // Ask for current browser location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          initMap(position.coords.latitude, position.coords.longitude);
        },
        () => {
          // If permission denied or error, fallback to country default coords
          initMap(defaultCoords.lat, defaultCoords.lng);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      initMap(defaultCoords.lat, defaultCoords.lng);
    }
  }, [isOpen, isScriptLoaded, isMapInitialized, activeCountry]);

  // Reset map initialized state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsMapInitialized(false);
    }
  }, [isOpen]);

  // Search Address Functionality
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(`/api/maps/geocode?address=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();

      if (data.status === 'OK' && data.results && data.results.length > 0) {
        const firstResult = data.results[0];
        const { lat, lng } = firstResult.geometry.location;

        if (mapInstanceRef.current) {
          mapInstanceRef.current.setCenter({ lat, lng });
          mapInstanceRef.current.setZoom(16);
        }
      } else {
        alert('لم يتم العثور على نتائج للعنوان المدخل. يرجى البحث بشكل أدق.');
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Reverse Geocoding via our secure server proxy
  const handleReverseGeocode = async (lat: number, lng: number) => {
    setIsReverseGeocoding(true);
    try {
      const res = await fetch(`/api/maps/geocode?lat=${lat}&lng=${lng}`);
      const data = await res.json();

      if (data.status === 'OK' && data.results && data.results.length > 0) {
        const result = data.results[0];
        setCurrentAddress(result.formatted_address);

        // Parse address components
        const addressComponents = result.address_components;
        let street = '';
        let streetNumber = '';
        let neighborhood = '';
        let city = '';
        let state = '';
        let postalCode = '';
        let countryCode = '';

        addressComponents.forEach((comp: any) => {
          const types = comp.types;
          if (types.includes('street_number')) {
            streetNumber = comp.long_name;
          } else if (types.includes('route')) {
            street = comp.long_name;
          } else if (
            types.includes('sublocality') ||
            types.includes('sublocality_level_1') ||
            types.includes('neighborhood')
          ) {
            neighborhood = comp.long_name;
          } else if (types.includes('locality')) {
            city = comp.long_name;
          } else if (types.includes('administrative_area_level_1')) {
            state = comp.long_name;
          } else if (types.includes('postal_code')) {
            postalCode = comp.long_name;
          } else if (types.includes('country')) {
            countryCode = comp.short_name; // 'SA', 'AE', etc.
          }
        });

        const formattedStreetAddress = street
          ? `${street}${streetNumber ? `، مبنى ${streetNumber}` : ''}`
          : result.formatted_address.split(',')[0];

        // Ensure we support the 6 GCC countries
        const isSupported = SUPPORTED_GCC_COUNTRIES.includes(countryCode);
        setIsValidCountry(isSupported);
        setDetectedCountry(countryCode);

        setParsedDetails({
          city: city || state || '',
          district: neighborhood || city || '',
          address: formattedStreetAddress || result.formatted_address,
          buildingNumber: streetNumber || '',
          shortAddressCode: postalCode ? `${activeCountry}${postalCode}` : '',
          postalCode: postalCode || '',
          block: postalCode || '',
          houseNumber: streetNumber || '',
          zone: postalCode || '',
          emirate: state || '',
        });
      }
    } catch (err) {
      console.error('Reverse geocoding error:', err);
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  const handleConfirmLocation = () => {
    if (!parsedDetails || !isValidCountry) return;
    onConfirm(parsedDetails);
    onClose();
  };

  const getCurrentCountryDefault = () => {
    return COUNTRY_FALLBACKS[activeCountry] || COUNTRY_FALLBACKS.SA;
  };

  const handleRecenterToCurrent = () => {
    if (navigator.geolocation && mapInstanceRef.current) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          mapInstanceRef.current.setCenter({ lat, lng });
          mapInstanceRef.current.setZoom(16);
        },
        () => {
          const defaultCoords = getCurrentCountryDefault();
          mapInstanceRef.current.setCenter(defaultCoords);
        }
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
      {/* Modal Container */}
      <div className="relative w-full h-full sm:max-w-2xl sm:h-[85vh] sm:rounded-3xl bg-white overflow-hidden shadow-2xl flex flex-col border border-slate-100">
        
        {/* MAP PORTAL */}
        <div className="relative flex-1 w-full h-full">
          {/* Map Target Element */}
          <div ref={mapRef} className="w-full h-full bg-slate-100" />

          {/* Centered Custom Beautiful Pin overlay */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="flex flex-col items-center justify-center relative -translate-y-5">
              {/* Visual pulsing ripple under pin */}
              <span className="w-2.5 h-1 bg-slate-900/40 rounded-full animate-ping scale-y-50" />
              
              {/* Custom premium pin design */}
              <div className="relative flex items-center justify-center">
                <MapPin className="w-10 h-10 text-[#A58454] drop-shadow-lg fill-white/80 shrink-0" />
                <div className="absolute w-2 h-2 bg-[#A58454] rounded-full top-[10px]" />
              </div>
            </div>
          </div>

          {/* FLOATING OVERLAY: Close Button (Top Left for RTL consistency, Top Right is search) */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 left-4 p-2.5 rounded-full bg-white text-slate-800 shadow-md hover:bg-slate-50 transition-all border border-slate-100 z-10 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* FLOATING OVERLAY: Recenter Navigation Pin */}
          <button
            type="button"
            onClick={handleRecenterToCurrent}
            className="absolute bottom-32 left-4 p-3 rounded-full bg-white text-[#A58454] shadow-md hover:bg-slate-50 transition-all border border-slate-100 z-10 cursor-pointer"
            title="تحديد موقعي الحالي"
          >
            <Navigation className="w-4 h-4 fill-[#A58454]" />
          </button>

          {/* FLOATING OVERLAY: Top Search Bar */}
          <form
            onSubmit={handleSearch}
            className="absolute top-4 right-4 left-16 sm:left-20 bg-white/95 backdrop-blur-xs rounded-2xl shadow-md border border-slate-100 p-1.5 flex items-center gap-1.5 z-10"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن الشارع، الحي أو المدينة..."
              className="flex-1 text-xs px-3 py-2 bg-transparent outline-none text-slate-800 placeholder-slate-400 font-sans"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="p-2 rounded-xl bg-[#A58454] text-white hover:bg-[#8C6D3F] transition-colors cursor-pointer shrink-0"
            >
              {isSearching ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Search className="w-3.5 h-3.5" />
              )}
            </button>
          </form>

          {/* FLOATING OVERLAY: Out of GCC Supported Countries Alert Banner */}
          {!isValidCountry && detectedCountry && (
            <div className="absolute top-20 left-4 right-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-4 shadow-lg text-xs flex items-start gap-3 z-10 animate-shake">
              <span className="text-lg">⚠️</span>
              <div className="flex-1">
                <p className="font-bold font-kufi">الموقع المحدد غير مدعوم للتوصيل</p>
                <p className="mt-1 text-[11px] leading-relaxed text-amber-800">
                  لقد حددت موقعاً في ({detectedCountry})، ونحن نشحن فقط إلى دول الخليج الست المدعومة (المملكة العربية السعودية، الإمارات، قطر، البحرين، الكويت، وعمان). يرجى تحريك الخريطة لتحديد مكان الشحن المدعوم.
                </p>
              </div>
            </div>
          )}

          {/* FLOATING OVERLAY: Bottom Address Details and Confirm Button */}
          <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-xs rounded-3xl p-4 sm:p-5 shadow-xl border border-slate-100/80 z-10 flex flex-col gap-3.5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#A58454]/10 text-[#A58454] flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[9px] uppercase tracking-wider font-bold text-[#A58454]">
                  العنوان المحدد حالياً
                </span>
                <p className="text-xs font-semibold text-slate-800 mt-0.5 truncate font-sans">
                  {isReverseGeocoding ? 'جاري جلب تفاصيل الموقع من الخريطة...' : currentAddress}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleConfirmLocation}
              disabled={!parsedDetails || !isValidCountry || isReverseGeocoding}
              className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-xs font-bold transition-all shadow-md ${
                !isValidCountry
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 shadow-none'
                  : 'bg-slate-950 text-white hover:bg-slate-900'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>تأكيد الموقع الجغرافي للعنوان</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
