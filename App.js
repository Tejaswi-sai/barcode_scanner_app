/**
 * Barcode Scanner with Multi-Language UI
 *
 * Scans a barcode with the device camera, looks up basic product info
 * from the free OpenFoodFacts API, saves scans to a local history list,
 * and lets the user switch the entire UI between English/Spanish/Hindi.
 *
 * Stack: React Native (Expo) + expo-camera + AsyncStorage
 * Author: Tejaswi Sai Gadadasu
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LANGUAGES, translations } from './Translations';

const STORAGE_KEY = '@barcode_scan_history';
const SCANNED_TYPES = ['ean13', 'ean8', 'upc_a', 'upc_e', 'qr', 'code128', 'code39'];

export default function App() {
  const [lang, setLang] = useState('en');
  const t = translations[lang];

  const [activeTab, setActiveTab] = useState('scan'); // 'scan' | 'history'
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedData, setScannedData] = useState(null); // last raw scan
  const [productInfo, setProductInfo] = useState(null);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [history, setHistory] = useState([]);
  const lockRef = useRef(false); // prevents rapid duplicate scans firing

  // Load history on mount
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setHistory(JSON.parse(raw));
      } catch (e) {
        console.warn('Failed to load history', e);
      }
    })();
  }, []);

  // Persist history whenever it changes
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(history)).catch((e) =>
      console.warn('Failed to save history', e)
    );
  }, [history]);

  const lookupProduct = useCallback(async (barcode) => {
    setLoadingProduct(true);
    setProductInfo(null);
    // Try each source in turn; the first one that returns a match wins.
    const sources = [
      { name: 'openfoodfacts', baseUrl: 'https://world.openfoodfacts.org' },
      { name: 'openproductsfacts', baseUrl: 'https://world.openproductsfacts.org' },
    ];

    let found = null;
    for (const source of sources) {
      try {
        const res = await fetch(`${source.baseUrl}/api/v2/product/${barcode}.json`);
        const json = await res.json();
        if (json.status === 1 && json.product) {
          found = {
            name: json.product.product_name || null,
            brand: json.product.brands || null,
            imageUrl: json.product.image_front_small_url || null,
            source: source.name,
          };
          break; // stop trying further sources once we have a match
        }
      } catch (e) {
        console.warn(`Lookup failed against ${source.name}`, e);
        // don't return here — fall through and let the loop try the next source
      }
    }

    if (found) {
      setProductInfo(found);
      setHistory((prev) => [
        { id: Date.now().toString(), barcode, ...found, scannedAt: new Date().toISOString() },
        ...prev,
      ]);
    } else {
      setProductInfo({ notFound: true });
      setHistory((prev) => [
        { id: Date.now().toString(), barcode, notFound: true, scannedAt: new Date().toISOString() },
        ...prev,
      ]);
    }

    setLoadingProduct(false);
  }, []);

  const handleBarcodeScanned = useCallback(
    ({ data }) => {
      if (lockRef.current) return;
      lockRef.current = true;
      setScannedData(data);
      lookupProduct(data);
    },
    [lookupProduct]
  );

  const handlePermissionPress = useCallback(() => {
    // If iOS already asked once and the user said no, requestPermission()
    // silently resolves 'denied' again with no native dialog — the only way
    // back is the Settings app.
    if (permission && !permission.canAskAgain) {
      Linking.openSettings();
    } else {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const resetScan = useCallback(() => {
    lockRef.current = false;
    setScannedData(null);
    setProductInfo(null);
  }, []);

  const clearHistory = useCallback(() => {
    Alert.alert(t.clearHistoryConfirmTitle, t.clearHistoryConfirmMsg, [
      { text: t.cancel, style: 'cancel' },
      { text: t.clear, style: 'destructive', onPress: () => setHistory([]) },
    ]);
  }, [t]);

  const renderHistoryItem = ({ item }) => (
    <View style={styles.historyCard}>
      <Text style={styles.historyBarcode}>{item.barcode}</Text>
      {item.notFound ? (
        <Text style={styles.historyNotFound}>{t.productNotFound}</Text>
      ) : (
        <>
          {!!item.name && <Text style={styles.historyName}>{item.name}</Text>}
          {!!item.brand && (
            <Text style={styles.historyBrand}>
              {t.brand}: {item.brand}
            </Text>
          )}
        </>
      )}
      <Text style={styles.historyDate}>
        {new Date(item.scannedAt).toLocaleString()}
      </Text>
    </View>
  );

  const renderScanTab = () => {
    if (!permission) {
      return <View style={styles.centered} />;
    }

    if (!permission.granted) {
      return (
        <View style={styles.centered}>
          <Text style={styles.permissionText}>{t.permissionMessage}</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={handlePermissionPress}>
            <Text style={styles.primaryBtnText}>
              {permission.canAskAgain ? t.grantPermission : t.openSettings}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (scannedData) {
      return (
        <View style={styles.resultContainer}>
          <Text style={styles.resultBarcodeLabel}>{t.barcode}</Text>
          <Text style={styles.resultBarcode}>{scannedData}</Text>

          {loadingProduct && (
            <View style={styles.loadingRow}>
              <ActivityIndicator color="#2F6FED" />
              <Text style={styles.loadingText}>{t.lookingUp}</Text>
            </View>
          )}

          {!loadingProduct && productInfo && !productInfo.notFound && (
            <View style={styles.productCard}>
              <Text style={styles.productName}>{productInfo.name || '—'}</Text>
              {!!productInfo.brand && (
                <Text style={styles.productBrand}>
                  {t.brand}: {productInfo.brand}
                </Text>
              )}
            </View>
          )}

          {!loadingProduct && productInfo?.notFound && (
            <Text style={styles.notFoundText}>{t.productNotFound}</Text>
          )}

          <TouchableOpacity style={styles.primaryBtn} onPress={resetScan}>
            <Text style={styles.primaryBtnText}>{t.scanAgain}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.cameraContainer}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: SCANNED_TYPES }}
          onBarcodeScanned={handleBarcodeScanned}
        />
        <View style={styles.scanFrame} />
        <Text style={styles.scanHint}>{t.pointCamera}</Text>
      </View>
    );
  };

  const renderHistoryTab = () => (
    <View style={{ flex: 1 }}>
      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={renderHistoryItem}
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
        ListEmptyComponent={<Text style={styles.empty}>{t.noHistory}</Text>}
      />
      {history.length > 0 && (
        <TouchableOpacity style={styles.clearBtn} onPress={clearHistory}>
          <Text style={styles.clearBtnText}>{t.clearHistory}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
          {t.appTitle}
        </Text>
        <View style={styles.langRow}>
          {LANGUAGES.map((l) => (
            <TouchableOpacity
              key={l.code}
              style={[styles.langChip, lang === l.code && styles.langChipActive]}
              onPress={() => setLang(l.code)}
            >
              <Text style={[styles.langChipText, lang === l.code && styles.langChipTextActive]}>
                {l.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <Text style={styles.subtitle} numberOfLines={1} ellipsizeMode="tail">
        {t.appSubtitle}
      </Text>

      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'scan' && styles.tabBtnActive]}
          onPress={() => setActiveTab('scan')}
        >
          <Text style={[styles.tabText, activeTab === 'scan' && styles.tabTextActive]}>
            {t.scanTab}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'history' && styles.tabBtnActive]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
            {t.historyTab}
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'scan' ? renderScanTab() : renderHistoryTab()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6FA' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
  },
  title: { fontSize: 20, fontWeight: '700', color: '#1F2430', flexShrink: 1, marginRight: 8 },
  subtitle: { fontSize: 12, color: '#8A8F9C', paddingHorizontal: 16, marginBottom: 10 },
  langRow: { flexDirection: 'row', flexShrink: 0 },
  langChip: {
    borderWidth: 1,
    borderColor: '#E1E4EA',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginLeft: 6,
  },
  langChipActive: { backgroundColor: '#2F6FED', borderColor: '#2F6FED' },
  langChipText: { fontSize: 12, color: '#3C4257', fontWeight: '600' },
  langChipTextActive: { color: '#fff' },
  tabRow: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 8 },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    alignItems: 'center',
  },
  tabBtnActive: { borderBottomColor: '#2F6FED' },
  tabText: { fontSize: 14, color: '#8A8F9C', fontWeight: '600' },
  tabTextActive: { color: '#2F6FED' },
  cameraContainer: { flex: 1, backgroundColor: '#000' },
  scanFrame: {
    position: 'absolute',
    top: '30%',
    left: '15%',
    width: '70%',
    height: '25%',
    borderWidth: 2,
    borderColor: '#2F6FED',
    borderRadius: 12,
  },
  scanHint: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    color: '#fff',
    fontSize: 14,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  permissionText: { textAlign: 'center', color: '#3C4257', marginBottom: 16, fontSize: 14 },
  primaryBtn: {
    backgroundColor: '#2F6FED',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  primaryBtnText: { color: '#fff', fontWeight: '700' },
  resultContainer: { flex: 1, padding: 20, alignItems: 'center' },
  resultBarcodeLabel: { fontSize: 12, color: '#8A8F9C', marginTop: 16 },
  resultBarcode: { fontSize: 20, fontWeight: '700', color: '#1F2430', marginBottom: 16 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 12 },
  loadingText: { marginLeft: 8, color: '#5A6072' },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    width: '100%',
    marginVertical: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
  },
  productName: { fontSize: 16, fontWeight: '700', color: '#1F2430' },
  productBrand: { fontSize: 14, color: '#5A6072', marginTop: 4 },
  notFoundText: { color: '#C0392B', marginVertical: 12, textAlign: 'center' },
  historyCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 1 },
  },
  historyBarcode: { fontSize: 12, color: '#8A8F9C', fontWeight: '600' },
  historyName: { fontSize: 15, fontWeight: '700', color: '#1F2430', marginTop: 2 },
  historyBrand: { fontSize: 13, color: '#5A6072', marginTop: 2 },
  historyNotFound: { fontSize: 13, color: '#C0392B', marginTop: 2, fontStyle: 'italic' },
  historyDate: { fontSize: 11, color: '#8A8F9C', marginTop: 6 },
  empty: { textAlign: 'center', color: '#8A8F9C', marginTop: 40 },
  clearBtn: { alignSelf: 'center', marginBottom: 20, paddingVertical: 8, paddingHorizontal: 16 },
  clearBtnText: { color: '#C0392B', fontWeight: '600', fontSize: 13 },
});

