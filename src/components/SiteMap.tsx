import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import { fonts } from '../theme';

// Where the map pictures come from. To switch sources, change only this block.
export const TILE_SOURCE = {
  url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
  maxZoom: 19,
  attribution: '© OpenStreetMap contributors',
};
// Satellite option. Check Esri's terms of use before using it in a public app:
//   url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
//   maxZoom: 18,
//   attribution: 'Tiles © Esri, Maxar, Earthstar Geographics, and the GIS User Community',

// Commands the screen can send to the map.
export type SiteMapHandle = {
  flyTo: (latitude: number, longitude: number, zoom?: number) => void;
  showUser: (latitude: number, longitude: number) => void;
  showSite: (latitude: number, longitude: number, radiusMeters: number) => void;
  clearSite: () => void;
};

type Props = {
  initialLatitude: number;
  initialLongitude: number;
  initialZoom?: number;
  // Called when the map first loads and every time it stops moving.
  onCenterChange: (latitude: number, longitude: number) => void;
};

// The small web page that holds the map.
function buildHtml(lat: number, lng: number, zoom: number) {
  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css" />
<style>
  html, body, #map { height: 100%; margin: 0; padding: 0; background: #2B3B2B; }
</style>
</head>
<body>
<div id="map"></div>

<!-- Reports any JavaScript error to the app, so problems are visible. -->
<script>
  window.onerror = function (message) {
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'jserror', message: String(message) }));
  };
</script>

<!-- Loads the map tool. Do NOT put your own code inside this tag: it would be ignored. -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"></script>

<!-- Our own map code. New map functions go here, before the closing script tag below. -->
<script>
  var map = L.map('map', { zoomControl: false, attributionControl: false }).setView([${lat}, ${lng}], ${zoom});
  var layer = L.tileLayer('${TILE_SOURCE.url}', { maxZoom: ${TILE_SOURCE.maxZoom} }).addTo(map);

  function send(type) {
    var c = map.getCenter();
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: type, lat: c.lat, lng: c.lng }));
  }
  map.on('moveend', function () { send('center'); });
  map.whenReady(function () { send('ready'); });

  var tileErrors = 0;
  layer.on('tileerror', function () {
    tileErrors++;
    if (tileErrors === 5) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'tileerror' }));
    }
  });

  // Blue dot for the phone's GPS position.
  var userDot = null;
  window.setUser = function (lat, lng) {
    if (userDot) { userDot.setLatLng([lat, lng]); }
    else {
      userDot = L.circleMarker([lat, lng], {
        radius: 7, color: '#ffffff', weight: 2, fillColor: '#2F80ED', fillOpacity: 1
      }).addTo(map);
    }
  };

  window.flyTo = function (lat, lng, zoom) { map.flyTo([lat, lng], zoom, { duration: 0.8 }); };

  // Red circle that marks the assessed spot.
  var siteCircle = null;
  window.showSite = function (lat, lng, radius) {
    if (siteCircle) { map.removeLayer(siteCircle); }
    siteCircle = L.circle([lat, lng], {
      radius: radius, color: '#E53935', weight: 3, fillColor: '#E53935', fillOpacity: 0.12
    }).addTo(map);
    map.flyTo([lat, lng], 18, { duration: 0.8 });
  };
  window.clearSite = function () {
    if (siteCircle) { map.removeLayer(siteCircle); siteCircle = null; }
  };
</script>
</body>
</html>`;
}

export const SiteMap = forwardRef<SiteMapHandle, Props>(function SiteMap(
  { initialLatitude, initialLongitude, initialZoom = 16, onCenterChange },
  ref,
) {
  const webRef = useRef<WebView>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'failed' | 'tiles'>('loading');
  const [jsError, setJsError] = useState('');
  // Built once, so later changes to the starting position never reload the map.
  const [html] = useState(() => buildHtml(initialLatitude, initialLongitude, initialZoom));

  useImperativeHandle(
    ref,
    () => ({
      flyTo: (lat, lng, zoom = 17) => {
        webRef.current?.injectJavaScript(`window.flyTo(${lat}, ${lng}, ${zoom}); true;`);
      },
      showUser: (lat, lng) => {
        webRef.current?.injectJavaScript(`window.setUser(${lat}, ${lng}); true;`);
      },
      showSite: (lat, lng, radius) => {
        webRef.current?.injectJavaScript(`window.showSite(${lat}, ${lng}, ${radius}); true;`);
      },
      clearSite: () => {
        webRef.current?.injectJavaScript('window.clearSite(); true;');
      },
    }),
    [],
  );

  // If the map hasn't reported "ready" after 10 seconds, show a message.
  useEffect(() => {
    const t = setTimeout(() => setStatus((s) => (s === 'loading' ? 'failed' : s)), 10000);
    return () => clearTimeout(t);
  }, []);

  const onMessage = (e: WebViewMessageEvent) => {
    try {
      const m = JSON.parse(e.nativeEvent.data) as { type: string; lat?: number; lng?: number; message?: string };
      if (m.type === 'ready') setStatus('ready');
      if (m.type === 'tileerror') setStatus('tiles');
      if (m.type === 'jserror') setJsError(m.message ?? 'unknown error');
      if ((m.type === 'ready' || m.type === 'center') && m.lat !== undefined && m.lng !== undefined) {
        onCenterChange(m.lat, m.lng);
      }
    } catch {
      // ignore messages we don't understand
    }
  };

  const notice =
    jsError !== ''
      ? `Map error: ${jsError}`
      : status === 'loading'
        ? 'Loading map…'
        : status === 'failed'
          ? 'The map could not load. Check your internet connection.'
          : status === 'tiles'
            ? 'Map pictures are not loading. Check your internet, or change the map source in SiteMap.tsx.'
            : '';

  return (
    <View style={StyleSheet.absoluteFill}>
      <WebView
        ref={webRef}
        originWhitelist={['*']}
        // The base address gives the picture requests a "Referer", which OpenStreetMap asks for.
        source={{ html, baseUrl: 'https://localhost' }}
        onMessage={onMessage}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        overScrollMode="never"
        bounces={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        style={styles.web}
      />
      {notice !== '' && (
        <View style={styles.notice} pointerEvents="none">
          <Text style={styles.noticeText}>{notice}</Text>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  web: { flex: 1, backgroundColor: '#2B3B2B' },
  notice: {
    position: 'absolute',
    left: 25,
    right: 25,
    top: '30%',
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: 10,
    padding: 10,
  },
  noticeText: { fontFamily: fonts.hindRegular, fontSize: 12, color: '#fff', textAlign: 'center' },
});