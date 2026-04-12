import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

interface BlueprintAnalysisScreenProps {
  onBack: () => void;
}

type UploadedBlueprint = {
  id: string;
  assetType: string;
  photoUrl: string;
  contentType: string;
  size: number;
  originalFileName: string;
};

export default function BlueprintAnalysisScreen({ onBack }: BlueprintAnalysisScreenProps) {
  const [projectId, setProjectId] = useState('proj1');
  const [userId, setUserId] = useState('user_2');
  const [projectType, setProjectType] = useState('residential-remodel');
  const [blueprintUrl, setBlueprintUrl] = useState('https://via.placeholder.com/1200x900.png?text=Blueprint+Plan');
  const [city, setCity] = useState('Austin');
  const [state, setState] = useState('TX');
  const [zipCode, setZipCode] = useState('78701');
  const [storeInput, setStoreInput] = useState('');
  const [comparisonStores, setComparisonStores] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploads, setUploads] = useState<UploadedBlueprint[]>([]);
  const [selectedBlueprintUrls, setSelectedBlueprintUrls] = useState<string[]>([]);
  const [renamingUploadId, setRenamingUploadId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const loadBlueprintUploads = async (nextProjectId: string) => {
    if (!nextProjectId.trim()) {
      setUploads([]);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/photos/upload?projectId=${encodeURIComponent(nextProjectId)}&assetType=blueprint`);
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to load uploaded blueprints');
      }

      const nextUploads = data.uploads || [];
      setUploads(nextUploads);
      if (!blueprintUrl && nextUploads.length > 0) {
        setBlueprintUrl(nextUploads[0].photoUrl);
        setUploadedFileName(nextUploads[0].originalFileName);
      }
      if (nextUploads.length > 0 && selectedBlueprintUrls.length === 0) {
        setSelectedBlueprintUrls([nextUploads[0].photoUrl]);
      }
    } catch {
      setUploads([]);
    }
  };

  const addStore = () => {
    const value = storeInput.trim();
    if (!value) return;
    if (!comparisonStores.includes(value)) {
      setComparisonStores([...comparisonStores, value]);
    }
    setStoreInput('');
  };

  const uploadBlueprintFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        multiple: false,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const asset = result.assets[0];
      const formData = new FormData();
      formData.append('projectId', projectId);
      formData.append('assetType', 'blueprint');
      formData.append('photo', {
        uri: asset.uri,
        name: asset.name || `blueprint_${Date.now()}`,
        type: asset.mimeType || 'application/octet-stream',
      } as any);

      const uploadResponse = await fetch(`${API_BASE_URL}/photos/upload`, {
        method: 'POST',
        body: formData,
      });

      const uploadData = await uploadResponse.json();
      if (!uploadResponse.ok || !uploadData.success) {
        throw new Error(uploadData.error || 'Blueprint upload failed');
      }

      const nextUrl = uploadData.photo?.photoUrl;
      if (nextUrl) {
        setBlueprintUrl(nextUrl);
      }
      setUploadedFileName(uploadData.photo?.originalFileName || asset.name || 'Uploaded file');
      await loadBlueprintUploads(projectId);
    } catch (uploadError) {
      Alert.alert('Upload Error', uploadError instanceof Error ? uploadError.message : 'Failed to upload blueprint');
    }
  };

  const beginRename = (upload: UploadedBlueprint) => {
    setRenamingUploadId(upload.id);
    setRenameValue(upload.originalFileName);
  };

  const cancelRename = () => {
    setRenamingUploadId(null);
    setRenameValue('');
  };

  const submitRename = async (upload: UploadedBlueprint) => {
    const nextName = renameValue.trim();
    if (!nextName || nextName === upload.originalFileName) {
      cancelRename();
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/photos/upload`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: upload.id, originalFileName: nextName }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to rename blueprint file');
      }

      cancelRename();
      await loadBlueprintUploads(projectId);
    } catch (renameError) {
      Alert.alert('Rename Error', renameError instanceof Error ? renameError.message : 'Failed to rename blueprint file');
    }
  };

  const deleteUpload = async (upload: UploadedBlueprint) => {
    try {
      const response = await fetch(`${API_BASE_URL}/photos/upload?id=${encodeURIComponent(upload.id)}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete blueprint file');
      }

      setSelectedBlueprintUrls((current) => current.filter((url) => url !== upload.photoUrl));
      if (blueprintUrl === upload.photoUrl) {
        setBlueprintUrl('');
        setUploadedFileName('');
      }

      await loadBlueprintUploads(projectId);
    } catch (deleteError) {
      Alert.alert('Delete Error', deleteError instanceof Error ? deleteError.message : 'Failed to delete blueprint file');
    }
  };

  const runAnalysis = async (overrideBlueprintUrls?: string[]) => {
    setLoading(true);
    setError('');

    try {
      const blueprintUrls = (overrideBlueprintUrls && overrideBlueprintUrls.length > 0)
        ? overrideBlueprintUrls
        : selectedBlueprintUrls.length > 0
          ? selectedBlueprintUrls
          : blueprintUrl
            ? [blueprintUrl]
            : [];

      if (blueprintUrls.length === 0) {
        throw new Error('Select at least one blueprint file or enter a blueprint URL');
      }

      const response = await fetch(`${API_BASE_URL}/ai/analyze-blueprint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          userId,
          projectType,
          blueprintUrl: blueprintUrls[0],
          blueprintUrls,
          comparisonStores,
          location: { city, state, zipCode },
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Blueprint analysis failed');
      }

      setResult(data);
    } catch (analysisError) {
      setError(analysisError instanceof Error ? analysisError.message : 'Blueprint analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const analyzeSelectedBlueprints = async () => {
    const blueprintUrls = selectedBlueprintUrls.length > 0
      ? selectedBlueprintUrls
      : blueprintUrl
        ? [blueprintUrl]
        : [];

    if (blueprintUrls.length === 0) {
      setError('Select at least one blueprint file first');
      return;
    }

    await runAnalysis(blueprintUrls);
  };

  const analyzeSingleBlueprint = async (upload: UploadedBlueprint) => {
    setBlueprintUrl(upload.photoUrl);
    setUploadedFileName(upload.originalFileName);
    setSelectedBlueprintUrls([upload.photoUrl]);
    await runAnalysis([upload.photoUrl]);
  };

  React.useEffect(() => {
    void loadBlueprintUploads(projectId);
  }, [projectId]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Blueprint Analysis</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>📐 Blueprint Analysis</Text>
          <Text style={styles.description}>
            Analyze blueprints, infer missing code-required hardware, and compare suppliers.
          </Text>

          <View style={styles.formGrid}>
            <TextInput style={styles.input} value={projectId} onChangeText={setProjectId} placeholder="Project ID" placeholderTextColor="#94a3b8" />
            <TextInput style={styles.input} value={userId} onChangeText={setUserId} placeholder="User ID" placeholderTextColor="#94a3b8" />
            <TextInput style={styles.input} value={projectType} onChangeText={setProjectType} placeholder="Project Type" placeholderTextColor="#94a3b8" />
            <TextInput style={styles.input} value={blueprintUrl} onChangeText={setBlueprintUrl} placeholder="Blueprint URL" placeholderTextColor="#94a3b8" />
            <TextInput style={styles.input} value={city} onChangeText={setCity} placeholder="City" placeholderTextColor="#94a3b8" />
            <TextInput style={styles.input} value={state} onChangeText={(text) => setState(text.toUpperCase())} placeholder="State" placeholderTextColor="#94a3b8" maxLength={2} />
            <TextInput style={styles.input} value={zipCode} onChangeText={setZipCode} placeholder="ZIP" placeholderTextColor="#94a3b8" />

            <View style={styles.storeRow}>
              <TextInput style={[styles.input, styles.storeInput]} value={storeInput} onChangeText={setStoreInput} placeholder="Add store" placeholderTextColor="#94a3b8" />
              <TouchableOpacity style={styles.addButton} onPress={addStore}>
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>

            {comparisonStores.length > 0 && (
              <View style={styles.chips}>
                {comparisonStores.map((store) => (
                  <Text key={store} style={styles.chip}>{store}</Text>
                ))}
              </View>
            )}

            <TouchableOpacity style={styles.addButton} onPress={() => void uploadBlueprintFile()}>
              <Text style={styles.addButtonText}>Upload Blueprint Files (Image/PDF)</Text>
            </TouchableOpacity>
            {uploadedFileName ? <Text style={styles.uploadedFileText}>Uploaded: {uploadedFileName}</Text> : null}

            <View style={styles.libraryCard}>
              <View style={styles.libraryHeader}>
                <Text style={styles.libraryTitle}>Project Blueprint Library</Text>
                <View style={styles.libraryActions}>
                  <TouchableOpacity
                    style={[styles.refreshButton, loading ? styles.disabledButton : null]}
                    onPress={() => void analyzeSelectedBlueprints()}
                    disabled={loading}
                  >
                    <Text style={styles.refreshButtonText}>{loading ? 'Analyzing...' : 'Analyze'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.refreshButton} onPress={() => setSelectedBlueprintUrls(uploads.map((upload) => upload.photoUrl))}>
                    <Text style={styles.refreshButtonText}>All</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.refreshButton} onPress={() => setSelectedBlueprintUrls([])}>
                    <Text style={styles.refreshButtonText}>Clear</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.refreshButton} onPress={() => void loadBlueprintUploads(projectId)}>
                    <Text style={styles.refreshButtonText}>Refresh</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.uploadedFileText}>Selected files: {selectedBlueprintUrls.length}</Text>
              {uploads.length === 0 ? (
                <Text style={styles.placeholderText}>No blueprint files uploaded for this project yet.</Text>
              ) : (
                uploads.map((upload) => {
                  const selected = selectedBlueprintUrls.includes(upload.photoUrl);
                  const isRenaming = renamingUploadId === upload.id;
                  return (
                    <TouchableOpacity
                      key={upload.id}
                      style={[styles.libraryItem, selected ? styles.libraryItemSelected : null]}
                      onPress={() => {
                        setBlueprintUrl(upload.photoUrl);
                        setUploadedFileName(upload.originalFileName);
                        setSelectedBlueprintUrls((current) => {
                          if (current.includes(upload.photoUrl)) {
                            return current.filter((url) => url !== upload.photoUrl);
                          }
                          return [...current, upload.photoUrl];
                        });
                      }}
                    >
                      <View style={styles.libraryItemTextWrap}>
                        {isRenaming ? (
                          <TextInput
                            style={styles.renameInput}
                            value={renameValue}
                            onChangeText={setRenameValue}
                            placeholder="Blueprint file name"
                            placeholderTextColor="#94a3b8"
                          />
                        ) : (
                          <Text style={styles.libraryItemTitle}>{upload.originalFileName}</Text>
                        )}
                        <Text style={styles.libraryItemMeta}>{upload.contentType} • {(upload.size / 1024).toFixed(1)} KB</Text>
                        <View style={styles.libraryItemActions}>
                          <TouchableOpacity style={styles.smallActionButton} onPress={() => { void analyzeSingleBlueprint(upload); }}>
                            <Text style={styles.smallActionButtonText}>Analyze</Text>
                          </TouchableOpacity>
                          {isRenaming ? (
                            <>
                              <TouchableOpacity style={styles.smallActionButton} onPress={() => void submitRename(upload)}>
                                <Text style={styles.smallActionButtonText}>Save</Text>
                              </TouchableOpacity>
                              <TouchableOpacity style={styles.smallActionButton} onPress={cancelRename}>
                                <Text style={styles.smallActionButtonText}>Cancel</Text>
                              </TouchableOpacity>
                            </>
                          ) : (
                            <>
                              <TouchableOpacity style={styles.smallActionButton} onPress={() => beginRename(upload)}>
                                <Text style={styles.smallActionButtonText}>Rename</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={[styles.smallActionButton, styles.deleteActionButton]}
                                onPress={() =>
                                  Alert.alert(
                                    'Delete Blueprint File',
                                    `Delete ${upload.originalFileName}?`,
                                    [
                                      { text: 'Cancel', style: 'cancel' },
                                      { text: 'Delete', style: 'destructive', onPress: () => { void deleteUpload(upload); } },
                                    ]
                                  )
                                }
                              >
                                <Text style={styles.smallActionButtonText}>Delete</Text>
                              </TouchableOpacity>
                            </>
                          )}
                        </View>
                      </View>
                      <Text style={styles.libraryItemState}>{selected ? 'Selected' : 'Select'}</Text>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity style={styles.actionButton} onPress={() => void runAnalysis()} disabled={loading}>
            <Text style={styles.actionButtonText}>{loading ? 'Analyzing...' : 'Analyze Blueprint'}</Text>
          </TouchableOpacity>
        </View>

        {loading && (
          <View style={styles.placeholder}>
            <ActivityIndicator size="large" color="#3b82f6" />
          </View>
        )}

        {result && (
          <View style={styles.placeholder}>
            <Text style={styles.sectionTitle}>Blueprint + Code Summary</Text>
            <Text style={styles.placeholderText}>Analysis Type: {result.analysisType || 'blueprint'}</Text>
            <Text style={styles.placeholderText}>Primary Stores: {(result.materialQuote?.primaryRetailers || []).join(', ')}</Text>
            <Text style={styles.placeholderText}>Compared Stores: {(result.materialQuote?.retailersCompared || []).join(', ')}</Text>
            <Text style={styles.placeholderText}>Files analyzed: {result.analyzedBlueprintCount || 1}</Text>
            <Text style={styles.sectionTitle}>Estimated Total: ${result.materialQuote?.totalCost}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  backButton: {
    marginBottom: 20,
  },
  backButtonText: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#cbd5e1',
    marginBottom: 16,
    lineHeight: 24,
  },
  formGrid: {
    gap: 10,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.4)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#fff',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
  },
  storeRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  storeInput: {
    flex: 1,
  },
  addButton: {
    backgroundColor: '#334155',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: 'rgba(59, 130, 246, 0.25)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.45)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    color: '#dbeafe',
    fontSize: 12,
    fontWeight: '600',
  },
  uploadedFileText: {
    color: '#cbd5e1',
    fontSize: 12,
  },
  libraryCard: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.8)',
    borderRadius: 12,
    backgroundColor: 'rgba(2, 6, 23, 0.35)',
    padding: 12,
    gap: 8,
  },
  libraryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  libraryActions: {
    flexDirection: 'row',
    gap: 6,
  },
  libraryTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  refreshButton: {
    backgroundColor: '#1e293b',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  refreshButtonText: {
    color: '#e2e8f0',
    fontSize: 12,
    fontWeight: '700',
  },
  libraryItem: {
    borderWidth: 1,
    borderColor: 'rgba(71, 85, 105, 0.8)',
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
  },
  libraryItemSelected: {
    borderColor: '#3b82f6',
    backgroundColor: 'rgba(30, 58, 138, 0.35)',
  },
  libraryItemTextWrap: {
    flex: 1,
  },
  libraryItemTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  libraryItemMeta: {
    color: '#94a3b8',
    fontSize: 12,
  },
  renameInput: {
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.5)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    color: '#fff',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    marginBottom: 6,
  },
  libraryItemActions: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  smallActionButton: {
    backgroundColor: '#1e293b',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  deleteActionButton: {
    backgroundColor: '#7f1d1d',
  },
  smallActionButtonText: {
    color: '#e2e8f0',
    fontSize: 11,
    fontWeight: '700',
  },
  libraryItemState: {
    color: '#e2e8f0',
    fontSize: 12,
    fontWeight: '700',
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 13,
    marginBottom: 10,
  },
  actionButton: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  placeholder: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  placeholderText: {
    color: '#94a3b8',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 6,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
});
