import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import MobileScreenHeader from '../components/MobileScreenHeader';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

interface PhotoAnalysisScreenProps {
  onBack: () => void;
}

type UploadedPhoto = {
  id: string;
  assetType: string;
  photoUrl: string;
  contentType: string;
  size: number;
  originalFileName: string;
};

export default function PhotoAnalysisScreen({ onBack }: PhotoAnalysisScreenProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [materialQuote, setMaterialQuote] = useState<any>(null);
  const [projectId, setProjectId] = useState('proj1');
  const [userId, setUserId] = useState('user_2');
  const [city, setCity] = useState('Austin');
  const [state, setState] = useState('TX');
  const [zipCode, setZipCode] = useState('78701');
  const [storeInput, setStoreInput] = useState('');
  const [comparisonStores, setComparisonStores] = useState<string[]>([]);
  const [uploads, setUploads] = useState<UploadedPhoto[]>([]);
  const [renamingUploadId, setRenamingUploadId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const loadPhotoUploads = async (nextProjectId: string) => {
    if (!nextProjectId.trim()) {
      setUploads([]);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/photos/upload?projectId=${encodeURIComponent(nextProjectId)}&assetType=photo`);
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to load uploaded photos');
      }

      const nextUploads = data.uploads || [];
      setUploads(nextUploads);
      if (!selectedImage && nextUploads.length > 0) {
        setSelectedImage(nextUploads[0].photoUrl);
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

  const handleSelectPhoto = () => {
    Alert.alert('Photo Upload', 'Select how you want to upload a photo.', [
      {
        text: 'Choose From Library',
        onPress: () => {
          void pickAndUploadPhoto();
        },
      },
      {
        text: 'Use Demo Photo',
        onPress: () => {
          setSelectedImage('https://via.placeholder.com/400x300.png?text=Construction+Site');
          void analyzePhoto('https://via.placeholder.com/400x300.png?text=Construction+Site');
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const pickAndUploadPhoto = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Required', 'Media library permission is required to upload photos.');
        return;
      }

      const picked = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.85,
      });

      if (picked.canceled || !picked.assets?.length) return;

      const asset = picked.assets[0];
      const formData = new FormData();
      formData.append('projectId', projectId);
      formData.append('photo', {
        uri: asset.uri,
        name: asset.fileName || `photo_${Date.now()}.jpg`,
        type: asset.mimeType || 'image/jpeg',
      } as any);

      const uploadResponse = await fetch(`${API_BASE_URL}/photos/upload`, {
        method: 'POST',
        body: formData,
      });

      const uploadData = await uploadResponse.json();
      if (!uploadResponse.ok || !uploadData.success) {
        throw new Error(uploadData.error || 'Photo upload failed');
      }

      const photoUrl = uploadData.photo?.photoUrl;
      if (!photoUrl) {
        throw new Error('Upload did not return a valid photo URL');
      }

      setSelectedImage(photoUrl);
      await loadPhotoUploads(projectId);
      await analyzePhoto(photoUrl);
    } catch (uploadError) {
      Alert.alert('Upload Error', uploadError instanceof Error ? uploadError.message : 'Failed to upload photo');
    }
  };

  const beginRename = (upload: UploadedPhoto) => {
    setRenamingUploadId(upload.id);
    setRenameValue(upload.originalFileName);
  };

  const cancelRename = () => {
    setRenamingUploadId(null);
    setRenameValue('');
  };

  const submitRename = async (upload: UploadedPhoto) => {
    const nextName = renameValue.trim();
    if (!nextName || nextName === upload.originalFileName) {
      cancelRename();
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/photos/upload`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: upload.id,
          originalFileName: nextName,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to rename photo file');
      }

      cancelRename();
      await loadPhotoUploads(projectId);
    } catch (renameError) {
      Alert.alert('Rename Error', renameError instanceof Error ? renameError.message : 'Failed to rename photo file');
    }
  };

  const deleteUpload = async (upload: UploadedPhoto) => {
    try {
      const response = await fetch(`${API_BASE_URL}/photos/upload?id=${encodeURIComponent(upload.id)}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete photo file');
      }

      if (selectedImage === upload.photoUrl) {
        const next = uploads.find((item) => item.id !== upload.id);
        setSelectedImage(next?.photoUrl || null);
      }

      await loadPhotoUploads(projectId);
    } catch (deleteError) {
      Alert.alert('Delete Error', deleteError instanceof Error ? deleteError.message : 'Failed to delete photo file');
    }
  };

  React.useEffect(() => {
    void loadPhotoUploads(projectId);
  }, [projectId]);

  const analyzeSelectedPhoto = async () => {
    if (!selectedImage) {
      Alert.alert('No Photo Selected', 'Select a photo from the project library first.');
      return;
    }
    await analyzePhoto(selectedImage);
  };

  const analyzePhoto = async (photoUri: string) => {
    setAnalyzing(true);
    setAnalysis(null);
    setMaterialQuote(null);

    try {
      // TODO: In a real app, upload the photo file first
      // For now, just call the analysis endpoint with mock data
      const response = await fetch(`${API_BASE_URL}/ai/analyze-photo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          photoUrl: photoUri,
          projectType: 'renovation',
          projectId,
          userId,
          comparisonStores,
          location: { city, state, zipCode },
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAnalysis(data.analysis);
        setMaterialQuote(data.materialQuote || null);
      } else {
        Alert.alert('Error', data.error || 'Failed to analyze photo');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to connect to server');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGetQuotes = async () => {
    if (!analysis) return;

    try {
      const response = await fetch(`${API_BASE_URL}/material-quotes/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          materials: analysis.materials,
          projectType: 'renovation',
          city,
          state,
          zipCode,
          userAddedStores: comparisonStores,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMaterialQuote(data.quote);
        Alert.alert(
          'Price Quotes',
          `Total Estimate: $${data.quote.totalCost}\n\nCompared: ${(data.quote.retailersCompared || []).join(', ')}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to fetch quotes');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <MobileScreenHeader
        onBack={onBack}
        backLabel="← Back"
        title="Photo Analysis"
        subtitle="AI-powered material estimation and supplier comparison"
        theme="dark"
      />

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Project & Location</Text>
          <TextInput style={styles.inlineInput} value={projectId} onChangeText={setProjectId} placeholder="Project ID" placeholderTextColor="#94a3b8" />
          <TextInput style={styles.inlineInput} value={userId} onChangeText={setUserId} placeholder="User ID" placeholderTextColor="#94a3b8" />
          <TextInput style={styles.inlineInput} value={city} onChangeText={setCity} placeholder="City" placeholderTextColor="#94a3b8" />
          <TextInput style={styles.inlineInput} value={state} onChangeText={(text) => setState(text.toUpperCase())} placeholder="State" placeholderTextColor="#94a3b8" maxLength={2} />
          <TextInput style={styles.inlineInput} value={zipCode} onChangeText={setZipCode} placeholder="ZIP" placeholderTextColor="#94a3b8" />

          <View style={styles.storeRow}>
            <TextInput style={[styles.inlineInput, styles.storeInput]} value={storeInput} onChangeText={setStoreInput} placeholder="Add store" placeholderTextColor="#94a3b8" />
            <TouchableOpacity style={styles.smallButton} onPress={addStore}>
              <Text style={styles.smallButtonText}>Add</Text>
            </TouchableOpacity>
          </View>

          {comparisonStores.length > 0 && (
            <Text style={styles.storeSummary}>Custom Stores: {comparisonStores.join(', ')}</Text>
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.libraryHeader}>
            <Text style={styles.cardTitle}>Project Photo Library</Text>
            <View style={styles.libraryActions}>
              <TouchableOpacity
                style={[styles.smallButton, (!selectedImage || analyzing) ? styles.disabledButton : null]}
                onPress={() => void analyzeSelectedPhoto()}
                disabled={!selectedImage || analyzing}
              >
                <Text style={styles.smallButtonText}>{analyzing ? 'Analyzing...' : 'Analyze'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.smallButton} onPress={() => void loadPhotoUploads(projectId)}>
                <Text style={styles.smallButtonText}>Refresh</Text>
              </TouchableOpacity>
            </View>
          </View>
          {uploads.length === 0 ? (
            <Text style={styles.storeSummary}>No uploaded photos found for this project yet.</Text>
          ) : (
            uploads.map((upload) => {
              const selected = selectedImage === upload.photoUrl;
              const isRenaming = renamingUploadId === upload.id;
              return (
                <TouchableOpacity
                  key={upload.id}
                  style={[styles.libraryItem, selected ? styles.libraryItemSelected : null]}
                  onPress={() => setSelectedImage(upload.photoUrl)}
                >
                  <View style={styles.libraryItemTextWrap}>
                    {isRenaming ? (
                      <TextInput
                        style={styles.renameInput}
                        value={renameValue}
                        onChangeText={setRenameValue}
                        placeholder="Photo file name"
                        placeholderTextColor="#94a3b8"
                      />
                    ) : (
                      <Text style={styles.libraryItemTitle}>{upload.originalFileName}</Text>
                    )}
                    <Text style={styles.libraryItemMeta}>{upload.contentType} • {(upload.size / 1024).toFixed(1)} KB</Text>
                    <View style={styles.libraryItemActions}>
                      <TouchableOpacity style={styles.smallActionButton} onPress={() => { void analyzePhoto(upload.photoUrl); }}>
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
                                'Delete Photo File',
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
                  <Text style={styles.libraryItemState}>{selected ? 'Selected' : 'Use Photo'}</Text>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {!selectedImage ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📸</Text>
            <Text style={styles.emptyTitle}>No Photo Selected</Text>
            <Text style={styles.emptyText}>
              Take a photo of your construction project to get instant material estimates
            </Text>
            <TouchableOpacity style={styles.uploadButton} onPress={handleSelectPhoto}>
              <Text style={styles.uploadButtonText}>Select Photo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.imageContainer}>
              <Image source={{ uri: selectedImage }} style={styles.image} />
              <TouchableOpacity
                style={styles.changePhotoButton}
                onPress={handleSelectPhoto}
              >
                <Text style={styles.changePhotoText}>Change Photo</Text>
              </TouchableOpacity>
            </View>

            {analyzing && (
              <View style={styles.analyzingContainer}>
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text style={styles.analyzingText}>Analyzing photo with AI...</Text>
                <Text style={styles.analyzingSubtext}>
                  Identifying materials, measuring dimensions, and estimating costs
                </Text>
              </View>
            )}

            {analysis && (
              <View style={styles.resultsContainer}>
                <Text style={styles.resultsTitle}>Analysis Results</Text>

                <View style={styles.card}>
                  <Text style={styles.cardTitle}>📋 Project Summary</Text>
                  <Text style={styles.cardText}>{analysis.summary}</Text>
                </View>

                <View style={styles.card}>
                  <Text style={styles.cardTitle}>🔨 Materials Needed</Text>
                  {analysis.materials.map((material: any, index: number) => (
                    <View key={index} style={styles.materialRow}>
                      <Text style={styles.materialName}>{material.name}</Text>
                      <Text style={styles.materialQuantity}>
                        {material.quantity} {material.unit}
                      </Text>
                    </View>
                  ))}
                </View>

                <View style={styles.card}>
                  <Text style={styles.cardTitle}>📏 Measurements</Text>
                  {analysis.dimensions && (
                    <>
                      <Text style={styles.measurementText}>
                        Length: {analysis.dimensions.length}
                      </Text>
                      <Text style={styles.measurementText}>
                        Width: {analysis.dimensions.width}
                      </Text>
                      <Text style={styles.measurementText}>
                        Area: {analysis.dimensions.area}
                      </Text>
                    </>
                  )}
                </View>

                 <View style={styles.card}>
                  <Text style={styles.cardTitle}>💰 Estimated Cost</Text>
                  <Text style={styles.costEstimate}>{analysis.estimatedCost}</Text>
                  <Text style={styles.costNote}>
                    Based on average material prices. Actual costs may vary.
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.quotesButton}
                  onPress={handleGetQuotes}
                >
                  <Text style={styles.quotesButtonText}>Get Price Quotes</Text>
                </TouchableOpacity>

                {materialQuote && (
                  <View style={styles.card}>
                    <Text style={styles.cardTitle}>🏪 Supplier Comparison</Text>
                    <Text style={styles.measurementText}>Total: ${materialQuote.totalCost}</Text>
                    <Text style={styles.measurementText}>Primary: {(materialQuote.primaryRetailers || []).join(', ')}</Text>
                    <Text style={styles.measurementText}>Compared: {(materialQuote.retailersCompared || []).join(', ')}</Text>
                  </View>
                )}
              </View>
            )}
          </>
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
  inlineInput: {
    backgroundColor: 'rgba(15,23,42,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.25)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#ffffff',
    marginBottom: 8,
  },
  storeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  storeInput: {
    flex: 1,
    marginBottom: 0,
  },
  smallButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  smallButtonText: {
    color: '#0f172a',
    fontWeight: '700',
    fontSize: 12,
  },
  storeSummary: {
    marginTop: 8,
    fontSize: 12,
    color: '#94a3b8',
  },
  libraryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  libraryActions: {
    flexDirection: 'row',
    gap: 6,
  },
  disabledButton: {
    opacity: 0.6,
  },
  libraryItem: {
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.2)',
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginBottom: 8,
  },
  libraryItemSelected: {
    borderColor: '#D4AF37',
    backgroundColor: 'rgba(212,175,55,0.12)',
  },
  libraryItemTextWrap: {
    flex: 1,
  },
  libraryItemTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  libraryItemMeta: {
    color: '#94a3b8',
    fontSize: 12,
  },
  libraryItemState: {
    color: '#D4AF37',
    fontSize: 12,
    fontWeight: '700',
  },
  renameInput: {
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.3)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    color: '#ffffff',
    backgroundColor: 'rgba(15,23,42,0.92)',
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
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 60,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 15,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  uploadButton: {
    backgroundColor: '#D4AF37',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  uploadButtonText: {
    color: '#0f172a',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  imageContainer: {
    marginBottom: 24,
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    backgroundColor: '#1e293b',
  },
  changePhotoButton: {
    marginTop: 12,
    alignItems: 'center',
  },
  changePhotoText: {
    color: '#D4AF37',
    fontSize: 15,
    fontWeight: '600',
  },
  analyzingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  analyzingText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 16,
  },
  analyzingSubtext: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 8,
  },
  resultsContainer: {
    marginTop: 8,
  },
  resultsTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 20,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(212,175,55,0.22)',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
  },
  cardText: {
    fontSize: 15,
    color: '#cbd5e1',
    lineHeight: 22,
  },
  materialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  materialName: {
    fontSize: 15,
    color: '#e2e8f0',
    fontWeight: '500',
  },
  materialQuantity: {
    fontSize: 15,
    color: '#94a3b8',
  },
  measurementText: {
    fontSize: 15,
    color: '#cbd5e1',
    marginBottom: 6,
  },
  costEstimate: {
    fontSize: 32,
    fontWeight: '800',
    color: '#059669',
    marginBottom: 8,
  },
  costNote: {
    fontSize: 13,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  quotesButton: {
    backgroundColor: '#059669',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  quotesButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
