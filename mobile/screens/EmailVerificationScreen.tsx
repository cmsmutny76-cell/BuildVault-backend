import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface EmailVerificationScreenProps {
  email: string;
  onNavigateToLogin: () => void;
  onBack: () => void;
}

const EmailVerificationScreen: React.FC<EmailVerificationScreenProps> = ({
  email,
  onNavigateToLogin,
  onBack,
}) => {
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const handleResendEmail = async () => {
    if (resendCooldown > 0) {
      Alert.alert(
        'Please Wait',
        `You can resend the email in ${resendCooldown} seconds`
      );
      return;
    }

    setResending(true);

    try {
      const response = await fetch('http://localhost:3000/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        Alert.alert(
          'Email Sent!',
          'A new verification email has been sent to your inbox.'
        );

        // Start 60-second cooldown
        setResendCooldown(60);
        const interval = setInterval(() => {
          setResendCooldown((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        Alert.alert('Error', data.error || 'Failed to resend email');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to connect to server. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&q=80' }}
      style={styles.backgroundImage}
      blurRadius={3}
    >
      <LinearGradient
        colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.9)']}
        style={styles.container}
      >
        <View style={styles.content}>
          {/* Header */}
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>

          {/* Icon */}
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>📧</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>Check Your Email</Text>
          <Text style={styles.subtitle}>
            We've sent a verification link to:
          </Text>
          <Text style={styles.email}>{email}</Text>

          {/* Instructions */}
          <View style={styles.instructionsBox}>
            <Text style={styles.instructionsTitle}>Next Steps:</Text>
            
            <View style={styles.step}>
              <Text style={styles.stepNumber}>1</Text>
              <Text style={styles.stepText}>
                Open your email inbox and look for our verification email
              </Text>
            </View>

            <View style={styles.step}>
              <Text style={styles.stepNumber}>2</Text>
              <Text style={styles.stepText}>
                Click the verification link in the email
              </Text>
            </View>

            <View style={styles.step}>
              <Text style={styles.stepNumber}>3</Text>
              <Text style={styles.stepText}>
                Return here and log in with your credentials
              </Text>
            </View>
          </View>

          {/* Info Banner */}
          <View style={styles.infoBanner}>
            <Text style={styles.infoBannerIcon}>💡</Text>
            <Text style={styles.infoBannerText}>
              The verification link expires in 24 hours
            </Text>
          </View>

          {/* Resend Button */}
          <TouchableOpacity
            style={[
              styles.resendButton,
              (resending || resendCooldown > 0) && styles.resendButtonDisabled,
            ]}
            onPress={handleResendEmail}
            disabled={resending || resendCooldown > 0}
          >
            {resending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.resendButtonText}>
                {resendCooldown > 0
                  ? `Resend Email (${resendCooldown}s)`
                  : 'Resend Verification Email'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Go to Login */}
          <TouchableOpacity
            style={styles.loginButton}
            onPress={onNavigateToLogin}
          >
            <Text style={styles.loginButtonText}>
              Already verified? Log In →
            </Text>
          </TouchableOpacity>

          {/* Help Text */}
          <View style={styles.helpBox}>
            <Text style={styles.helpTitle}>Didn't receive the email?</Text>
            <Text style={styles.helpText}>
              • Check your spam/junk folder{'\n'}
              • Make sure you entered the correct email address{'\n'}
              • Wait a few minutes and try resending
            </Text>
          </View>
        </View>
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
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  icon: {
    fontSize: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 5,
  },
  email: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4FC3F7',
    textAlign: 'center',
    marginBottom: 30,
  },
  instructionsBox: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 15,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#4FC3F7',
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 30,
    marginRight: 12,
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    color: '#fff',
    lineHeight: 22,
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,193,7,0.2)',
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  infoBannerIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 14,
    color: '#FFC107',
    fontWeight: '500',
  },
  resendButton: {
    backgroundColor: '#4FC3F7',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 15,
  },
  resendButtonDisabled: {
    backgroundColor: '#555',
  },
  resendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  loginButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  helpBox: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 15,
  },
  helpTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 13,
    color: '#ccc',
    lineHeight: 20,
  },
});

export default EmailVerificationScreen;
