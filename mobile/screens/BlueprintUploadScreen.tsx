import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

interface Location {
  city: string;
  county: string;
  state: string;
  zipCode: string;
}

export default function BlueprintUploadScreen() {
  const [blueprint, setBlueprint] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [buildingCodes, setBuildingCodes] = useState<any>(null);
  const [location, setLocation] = useState<Location>({
    city: '',
    county: '',
    state: '',
    zipCode: '',
  });
  const [showLocationForm, setShowLocationForm] = useState(false);

  const pickBlueprint = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1.0, // High quality for blueprints
    });

    if (!result.canceled) {
      setBlueprint(result.assets[0].uri);
      setAnalysis(null);
      setBuildingCodes(null);
      setShowLocationForm(true);
    }
  };

  const analyzeBlueprint = async () => {
    if (!blueprint) return;

    setAnalyzing(true);
    try {
      // Upload blueprint
      const formData = new FormData();
      formData.append('photo', {
        uri: blueprint,
        type: 'image/jpeg',
        name: 'blueprint.jpg',
      } as any);
      formData.append('projectId', '1');

      const uploadResponse = await fetch(`${API_URL}/api/photos/upload`, {
        method: 'POST',
        body: formData,
      });

      const uploadData = await uploadResponse.json();

      // Analyze blueprint with location data
      const analysisResponse = await fetch(`${API_URL}/api/ai/analyze-blueprint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          blueprintUrl: uploadData.photo.photoUrl,
          location: location.state ? location : null,
        }),
      });

      const analysisData = await analysisResponse.json();
      setAnalysis(analysisData.blueprint);
      
      if (analysisData.buildingCodes) {
        setBuildingCodes(analysisData.buildingCodes);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to analyze blueprint. Please try again.');
      console.error(error);
    } finally {
      setAnalyzing(false);
    }
  };

  const renderMaterialCategory = (category: any) => (
    <View key={category.category} style={styles.categoryCard}>
      <Text style={styles.categoryTitle}>{category.category}</Text>
      {category.items?.map((item: any, idx: number) => (
        <View key={idx} style={styles.materialItem}>
          <Text style={styles.materialName}>{item.name}</Text>
          <Text style={styles.materialQuantity}>
            {item.quantity} {item.unit}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderBuildingCodes = () => {
    if (!buildingCodes?.codes) return null;

    const codes = buildingCodes.codes;
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏛️ Building Code Requirements</Text>
        <Text style={styles.locationText}>
          {buildingCodes.location.city}, {buildingCodes.location.state}
        </Text>

        {Object.keys(codes).map((category) => {
          const categoryData = codes[category];
          if (!categoryData) return null;

          return (
            <View key={category} style={styles.codeCard}>
              <Text style={styles.codeCategory}>
                {category.charAt(0).toUpperCase() + category.slice(1).replace(/([A-Z])/g, ' $1')}
              </Text>
              
              {categoryData.requirements && (
                <View style={styles.codeSection}>
                  <Text style={styles.codeSubtitle}>Requirements:</Text>
                  {categoryData.requirements.map((req: string, idx: number) => (
                    <Text key={idx} style={styles.codeText}>• {req}</Text>
                  ))}
                </View>
              )}

              {categoryData.hardware && (
                <View style={styles.codeSection}>
                  <Text style={styles.codeSubtitle}>Required Hardware:</Text>
                  {categoryData.hardware.map((hw: any, idx: number) => (
                    <View key={idx} style={styles.hardwareItem}>
                      <Text style={styles.hardwareName}>• {hw.name}</Text>
                      <Text style={styles.hardwareDetails}>
                        {hw.quantity} - {hw.code}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Blueprint Analysis</Text>
        <Text style={styles.subtitle}>Professional Material Estimation</Text>
      </View>

      <ScrollView style={styles.content}>
        {!blueprint ? (
          <View style={styles.uploadSection}>
            <Text style={styles.uploadTitle}>Upload Construction Blueprint</Text>
            <Text style={styles.uploadDescription}>
              Get detailed material lists and code requirements
            </Text>
            
            <TouchableOpacity style={styles.button} onPress={pickBlueprint}>
              <Text style={styles.buttonText}>📐 Choose Blueprint/Drawing</Text>
            </TouchableOpacity>

            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>✨ What we analyze:</Text>
              <Text style={styles.infoText}>• Precise measurements from drawings</Text>
              <Text style={styles.infoText}>• Complete material quantities</Text>
              <Text style={styles.infoText}>• Structural requirements</Text>
              <Text style={styles.infoText}>• Local building code compliance</Text>
              <Text style={styles.infoText}>• Required permits and hardware</Text>
            </View>
          </View>
        ) : (
          <View>
            <Image source={{ uri: blueprint }} style={styles.blueprintPreview} />

            {showLocationForm && !analysis && (
              <View style={styles.locationForm}>
                <Text style={styles.formTitle}>Project Location (Optional)</Text>
                <Text style={styles.formDescription}>
                  Add location to check local building codes
                </Text>
                
                <TextInput
                  style={styles.input}
                  placeholder="City"
                  value={location.city}
                  onChangeText={(text) => setLocation({ ...location, city: text })}
                />
                
                <TextInput
                  style={styles.input}
                  placeholder="County"
                  value={location.county}
                  onChangeText={(text) => setLocation({ ...location, county: text })}
                />
                
                <TextInput
                  style={styles.input}
                  placeholder="State (e.g., CA, TX)"
                  value={location.state}
                  onChangeText={(text) => setLocation({ ...location, state: text.toUpperCase() })}
                  maxLength={2}
                />
                
                <TextInput
                  style={styles.input}
                  placeholder="ZIP Code"
                  value={location.zipCode}
                  onChangeText={(text) => setLocation({ ...location, zipCode: text })}
                  keyboardType="numeric"
                  maxLength={5}
                />
              </View>
            )}

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.button}
                onPress={analyzeBlueprint}
                disabled={analyzing}
              >
                {analyzing ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.buttonText}>Analyze Blueprint</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary]}
                onPress={() => {
                  setBlueprint(null);
                  setAnalysis(null);
                  setBuildingCodes(null);
                  setShowLocationForm(false);
                }}
              >
                <Text style={styles.buttonTextSecondary}>Choose Different Blueprint</Text>
              </TouchableOpacity>
            </View>

            {analysis && (
              <View style={styles.analysisSection}>
                <Text style={styles.analysisTitle}>📋 Analysis Results</Text>

                {/* Dimensions */}
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>📏 Dimensions</Text>
                  {Object.entries(analysis.dimensions || {}).map(([key, value]) => (
                    <Text key={key} style={styles.cardText}>
                      {key.replace(/([A-Z])/g, ' $1').trim()}: {value as string}
                    </Text>
                  ))}
                </View>

                {/* Materials by Category */}
                <Text style={styles.sectionTitle}>🔨 Materials List</Text>
                {analysis.materials?.map(renderMaterialCategory)}

                {/* Structural */}
                {analysis.structural && (
                  <View style={styles.card}>
                    <Text style={styles.cardTitle}>🏗️ Structural Details</Text>
                    {Object.entries(analysis.structural).map(([key, value]) => (
                      <Text key={key} style={styles.cardText}>
                        {key.replace(/([A-Z])/g, ' $1').trim()}: 
                        {Array.isArray(value) ? value.join(', ') : value as string}
                      </Text>
                    ))}
                  </View>
                )}

                {/* Specifications */}
                {analysis.specifications && analysis.specifications.length > 0 && (
                  <View style={styles.card}>
                    <Text style={styles.cardTitle}>📝 Specifications</Text>
                    {analysis.specifications.map((spec: string, idx: number) => (
                      <Text key={idx} style={styles.cardText}>• {spec}</Text>
                    ))}
                  </View>
                )}

                {/* Building Codes */}
                {renderBuildingCodes()}

                {/* Notes */}
                {analysis.notes && analysis.notes.length > 0 && (
                  <View style={styles.card}>
                    <Text style={styles.cardTitle}>⚠️ Important Notes</Text>
                    {analysis.notes.map((note: string, idx: number) => (
                      <Text key={idx} style={styles.cardText}>• {note}</Text>
                    ))}
                  </View>
                )}

                <TouchableOpacity
                  style={styles.button}
                  onPress={() => {
                    console.log('Generate detailed quote');
                  }}
                >
                  <Text style={styles.buttonText}>Get Detailed Price Quote</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#059669',
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 14,
    color: '#d1fae5',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  uploadSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 10,
    textAlign: 'center',
  },
  uploadDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 30,
    textAlign: 'center',
  },
  blueprintPreview: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    marginBottom: 20,
    backgroundColor: '#e5e7eb',
  },
  locationForm: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 5,
  },
  formDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    fontSize: 14,
  },
  actions: {
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#059669',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonSecondary: {
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#059669',
  },
  buttonTextSecondary: {
    color: '#059669',
    fontSize: 16,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#ecfdf5',
    padding: 20,
    borderRadius: 12,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#059669',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#065f46',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#047857',
    marginBottom: 5,
  },
  analysisSection: {
    marginTop: 10,
  },
  analysisTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 15,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
    marginTop: 10,
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 10,
  },
  cardText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 5,
    lineHeight: 20,
  },
  categoryCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#059669',
    marginBottom: 12,
  },
  materialItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  materialName: {
    fontSize: 14,
    color: '#1f2937',
    flex: 1,
  },
  materialQuantity: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
  locationText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 10,
  },
  codeCard: {
    backgroundColor: '#fffbeb',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#fbbf24',
  },
  codeCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 10,
  },
  codeSection: {
    marginTop: 8,
  },
  codeSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#78350f',
    marginBottom: 6,
  },
  codeText: {
    fontSize: 13,
    color: '#92400e',
    marginBottom: 4,
    lineHeight: 18,
  },
  hardwareItem: {
    marginBottom: 6,
  },
  hardwareName: {
    fontSize: 13,
    color: '#92400e',
    fontWeight: '500',
  },
  hardwareDetails: {
    fontSize: 12,
    color: '#a16207',
    marginLeft: 12,
  },
});
