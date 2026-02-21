import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export default function PhotoUploadScreen() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
      setAnalysis(null);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
      setAnalysis(null);
    }
  };

  const analyzePhoto = async () => {
    if (!photo) return;

    setAnalyzing(true);
    try {
      // Upload photo first
      const formData = new FormData();
      formData.append('photo', {
        uri: photo,
        type: 'image/jpeg',
        name: 'construction-photo.jpg',
      } as any);
      formData.append('projectId', '1');

      const uploadResponse = await fetch(`${API_URL}/api/photos/upload`, {
        method: 'POST',
        body: formData,
      });

      const uploadData = await uploadResponse.json();

      // Analyze photo
      const analysisResponse = await fetch(`${API_URL}/api/ai/analyze-photo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          photoUrl: uploadData.photo.photoUrl,
          projectType: 'flooring',
        }),
      });

      const analysisData = await analysisResponse.json();
      setAnalysis(analysisData.analysis);
    } catch (error) {
      Alert.alert('Error', 'Failed to analyze photo. Please try again.');
      console.error(error);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Photo Analysis</Text>
      </View>

      <View style={styles.content}>
        {!photo ? (
          <View style={styles.uploadSection}>
            <Text style={styles.uploadTitle}>Upload Construction Photo</Text>
            
            <TouchableOpacity style={styles.button} onPress={takePhoto}>
              <Text style={styles.buttonText}>📸 Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={pickImage}
            >
              <Text style={styles.buttonTextSecondary}>🖼️ Choose from Gallery</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.photoSection}>
            <Image source={{ uri: photo }} style={styles.photoPreview} />
            
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.button}
                onPress={analyzePhoto}
                disabled={analyzing}
              >
                {analyzing ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.buttonText}>Analyze Photo</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary]}
                onPress={() => {
                  setPhoto(null);
                  setAnalysis(null);
                }}
              >
                <Text style={styles.buttonTextSecondary}>Choose Different Photo</Text>
              </TouchableOpacity>
            </View>

            {analysis && (
              <View style={styles.analysisSection}>
                <Text style={styles.analysisTitle}>Analysis Results</Text>
                
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>📏 Measurements</Text>
                  <Text style={styles.cardText}>
                    {analysis.measurements?.estimatedArea || 'N/A'}
                  </Text>
                  <Text style={styles.cardText}>
                    {analysis.measurements?.dimensions || 'N/A'}
                  </Text>
                </View>

                <View style={styles.card}>
                  <Text style={styles.cardTitle}>🔨 Materials Needed</Text>
                  {analysis.materials?.map((material: any, index: number) => (
                    <Text key={index} style={styles.cardText}>
                      • {material.name}: {material.quantity} {material.unit}
                    </Text>
                  ))}
                </View>

                <View style={styles.card}>
                  <Text style={styles.cardTitle}>✅ Condition</Text>
                  <Text style={styles.cardText}>{analysis.condition}</Text>
                </View>

                {analysis.recommendations && (
                  <View style={styles.card}>
                    <Text style={styles.cardTitle}>💡 Recommendations</Text>
                    {analysis.recommendations.map((rec: string, index: number) => (
                      <Text key={index} style={styles.cardText}>
                        • {rec}
                      </Text>
                    ))}
                  </View>
                )}

                <TouchableOpacity
                  style={styles.button}
                  onPress={() => {
                    /* Navigate to quote screen */
                    console.log('Generate quote');
                  }}
                >
                  <Text style={styles.buttonText}>Get Price Quote</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2563eb',
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
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
    marginBottom: 30,
  },
  photoSection: {
    flex: 1,
  },
  photoPreview: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    marginBottom: 20,
  },
  actions: {
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#2563eb',
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
    borderColor: '#2563eb',
  },
  buttonTextSecondary: {
    color: '#2563eb',
    fontSize: 16,
    fontWeight: '600',
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
});
