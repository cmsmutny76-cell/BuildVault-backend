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
} from 'react-native';

interface PhotoAnalysisScreenProps {
  onBack: () => void;
}

export default function PhotoAnalysisScreen({ onBack }: PhotoAnalysisScreenProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const handleSelectPhoto = () => {
    // For web, we can't use camera/gallery picker
    // This would work on mobile with expo-image-picker
    Alert.alert(
      'Photo Upload',
      'On mobile devices, you can take a photo or select from gallery. For web demo, analysis uses mock data.',
      [
        {
          text: 'Use Demo Photo',
          onPress: () => {
            setSelectedImage('https://via.placeholder.com/400x300.png?text=Construction+Site');
            analyzePhoto('demo_photo.jpg');
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const analyzePhoto = async (photoUri: string) => {
    setAnalyzing(true);
    setAnalysis(null);

    try {
      // TODO: In a real app, upload the photo file first
      // For now, just call the analysis endpoint with mock data
      const response = await fetch('http://localhost:3000/api/ai/analyze-photo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          photoUrl: photoUri,
          projectType: 'renovation',
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAnalysis(data.analysis);
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
      const response = await fetch('http://localhost:3000/api/quotes/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          materials: analysis.materials,
          projectType: 'renovation',
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        Alert.alert(
          'Price Quotes',
          `Total Estimate: ${data.quotes.totalEstimate}\n\nQuotes from: Home Depot, Lowe's, Ace Hardware`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to fetch quotes');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Photo Analysis</Text>
        <Text style={styles.subtitle}>AI-Powered Material Estimation</Text>
      </View>

      <ScrollView style={styles.content}>
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
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 20,
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
    color: '#0f172a',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  uploadButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  uploadButtonText: {
    color: '#ffffff',
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
    backgroundColor: '#e2e8f0',
  },
  changePhotoButton: {
    marginTop: 12,
    alignItems: 'center',
  },
  changePhotoText: {
    color: '#3b82f6',
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
    color: '#0f172a',
    marginTop: 16,
  },
  analyzingSubtext: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 8,
  },
  resultsContainer: {
    marginTop: 8,
  },
  resultsTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
  },
  cardText: {
    fontSize: 15,
    color: '#475569',
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
    color: '#334155',
    fontWeight: '500',
  },
  materialQuantity: {
    fontSize: 15,
    color: '#64748b',
  },
  measurementText: {
    fontSize: 15,
    color: '#475569',
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
    color: '#64748b',
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
