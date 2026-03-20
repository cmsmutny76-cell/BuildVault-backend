import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface EmailVerificationResultScreenProps {
  token: string;
  userId: string;
  onNavigateToLogin: () => void;
  onBack: () => void;
}

type VerificationState = 'loading' | 'success' | 'error';

const EmailVerificationResultScreen: React.FC<EmailVerificationResultScreenProps> = ({
  token,
  userId,
  onNavigateToLogin,
  onBack,
}) => {
  const [state, setState] = useState<VerificationState>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    verifyEmail();
  }, [token, userId]);

  const verifyEmail = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/auth/verify-email?token=${token}&userId=${userId}`
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setState('success');
      } else {
        setState('error');
        setErrorMessage(data.error || 'Verification failed');
      }
    } catch (error) {
      setState('error');
      setErrorMessage('Unable to connect to server. Please try again.');
    }
  };

  const renderContent = () => {
    switch (state) {
      case 'loading':
        return (
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <ActivityIndicator size="large" color="#4FC3F7" />
            </View>
            <Text style={styles.title}>Verifying Your Email</Text>
            <Text style={styles.subtitle}>Please wait a moment...</Text>
          </View>
        );

      case 'success':
        return (
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Text style={styles.successIcon}>✓</Text>
            </View>
            <Text style={styles.title}>Email Verified!</Text>
            <Text style={styles.subtitle}>
              Your email has been successfully verified. You can now log in and start using the app.
            </Text>

            <View style={styles.successBox}>
              <View style={styles.successRow}>
                <Text style={styles.successCheckmark}>✓</Text>
                <Text style={styles.successText}>Email confirmed</Text>
              </View>
              <View style={styles.successRow}>
                <Text style={styles.successCheckmark}>✓</Text>
                <Text style={styles.successText}>Account activated</Text>
              </View>
              <View style={styles.successRow}>
                <Text style={styles.successCheckmark}>✓</Text>
                <Text style={styles.successText}>Ready to use</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={onNavigateToLogin}
            >
              <Text style={styles.loginButtonText}>Continue to Login →</Text>
            </TouchableOpacity>

            <View style={styles.nextStepsBox}>
              <Text style={styles.nextStepsTitle}>What's Next?</Text>
              <Text style={styles.nextStepsText}>
                • Log in with your email and password{'\n'}
                • Complete your profile{'\n'}
                • Start posting projects or finding work
              </Text>
            </View>
          </View>
        );

      case 'error':
        return (
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Text style={styles.errorIcon}>✗</Text>
            </View>
            <Text style={styles.title}>Verification Failed</Text>
            <Text style={styles.subtitle}>{errorMessage}</Text>

            <View style={styles.errorBox}>
              <Text style={styles.errorBoxTitle}>Common Issues:</Text>
              <Text style={styles.errorBoxText}>
                • The verification link may have expired (valid for 24 hours){'\n'}
                • The link may have already been used{'\n'}
                • The link may be incorrect or incomplete
              </Text>
            </View>

            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                setState('loading');
                verifyEmail();
              }}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backButton}
              onPress={onBack}
            >
              <Text style={styles.backButtonText}>
                Request New Verification Email
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginButtonSecondary}
              onPress={onNavigateToLogin}
            >
              <Text style={styles.loginButtonSecondaryText}>
                Already verified? Log In
              </Text>
            </TouchableOpacity>
          </View>
        );
    }
  };

  return (
    <ImageBackground
      source={{
        uri:
          state === 'success'
            ? 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&q=80'
            : 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80',
      }}
      style={styles.backgroundImage}
      blurRadius={3}
    >
      <LinearGradient
        colors={
          state === 'success'
            ? ['rgba(46,125,50,0.9)', 'rgba(27,94,32,0.95)']
            : state === 'error'
            ? ['rgba(183,28,28,0.9)', 'rgba(136,14,79,0.95)']
            : ['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.9)']
        }
        style={styles.container}
      >
        {renderContent()}
      </LinearGradient>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    padding: 30,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIcon: {
    fontSize: 100,
    color: '#4CAF50',
    fontWeight: 'bold',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(76,175,80,0.2)',
    textAlign: 'center',
    lineHeight: 120,
    borderWidth: 4,
    borderColor: '#4CAF50',
  },
  errorIcon: {
    fontSize: 100,
    color: '#F44336',
    fontWeight: 'bold',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(244,67,54,0.2)',
    textAlign: 'center',
    lineHeight: 120,
    borderWidth: 4,
    borderColor: '#F44336',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 16,
    color: '#ddd',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  successBox: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    width: '100%',
  },
  successRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  successCheckmark: {
    fontSize: 20,
    color: '#4CAF50',
    marginRight: 12,
    fontWeight: 'bold',
  },
  successText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  errorBox: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
    width: '100%',
  },
  errorBoxTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 10,
  },
  errorBoxText: {
    fontSize: 14,
    color: '#ddd',
    lineHeight: 22,
  },
  loginButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  loginButtonText: {
    color: '#2E7D32',
    fontSize: 18,
    fontWeight: '700',
  },
  retryButton: {
    backgroundColor: '#4FC3F7',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  backButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  loginButtonSecondary: {
    padding: 12,
    alignItems: 'center',
  },
  loginButtonSecondaryText: {
    color: '#ddd',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  nextStepsBox: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    marginTop: 10,
  },
  nextStepsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 10,
  },
  nextStepsText: {
    fontSize: 14,
    color: '#ddd',
    lineHeight: 22,
  },
});

export default EmailVerificationResultScreen;
