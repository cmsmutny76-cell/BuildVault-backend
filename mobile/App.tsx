import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import HomeScreen from './screens/HomeScreen';
import ProfileScreen from './screens/ProfileScreen';
import SettingsScreen from './screens/SettingsScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import PhotoAnalysisScreen from './screens/PhotoAnalysisScreen';
import BlueprintAnalysisScreen from './screens/BlueprintAnalysisScreen';
import BuildingCodesScreen from './screens/BuildingCodesScreen';
import PriceComparisonScreen from './screens/PriceComparisonScreen';
import FindContractorsScreen from './screens/FindContractorsScreen';
import PermitAssistanceScreen from './screens/PermitAssistanceScreen';
import HelpScreen from './screens/HelpScreen';
import ProjectDetailsScreen from './screens/ProjectDetailsScreen';
import NewEstimateScreen from './screens/NewEstimateScreen';
import ProjectProfileScreen from './screens/ProjectProfileScreen';
import ContractorProfileScreen from './screens/ContractorProfileScreen';
import { revenueCatService } from './services/revenueCat';

type Screen = 'home' | 'profile' | 'settings' | 'login' | 'register' | 'photoAnalysis' | 'blueprintAnalysis' | 'buildingCodes' | 'priceComparison' | 'findContractors' | 'permitAssistance' | 'help' | 'projectDetails' | 'newEstimate' | 'projectProfile' | 'contractorProfile';

interface User {
  id: string;
  email: string;
  isContractor: boolean;
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [navigationStack, setNavigationStack] = useState<Screen[]>([]);
  const [user, setUser] = useState<User | null>(null);

  // Initialize RevenueCat on app start
  useEffect(() => {
    if (user) {
      revenueCatService.initialize(user.id);
    }
  }, [user]);

  const handleLogin = (userData: User) => {
    setUser(userData);
    setCurrentScreen('home');
    setNavigationStack([]);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentScreen('login');
    setNavigationStack([]);
  };

  const handleRegister = (userData: User) => {
    setUser(userData);
    setCurrentScreen('home');
    setNavigationStack([]);
  };

  const handleNavigate = (screen: Screen) => {
    // Add current screen to navigation stack before navigating
    if (currentScreen !== 'login' && currentScreen !== 'register') {
      setNavigationStack([...navigationStack, currentScreen]);
    }
    setCurrentScreen(screen);
  };

  const handleBack = () => {
    // Pop from navigation stack if it exists, otherwise go to home
    if (navigationStack.length > 0) {
      const previousScreen = navigationStack[navigationStack.length - 1];
      setNavigationStack(navigationStack.slice(0, -1));
      setCurrentScreen(previousScreen);
    } else {
      setCurrentScreen('home');
    }
  };

  const renderScreen = () => {
    // Auth screens
    if (currentScreen === 'login') {
      return (
        <LoginScreen
          onLogin={handleLogin}
          onNavigateToRegister={() => setCurrentScreen('register')}
        />
      );
    }

    if (currentScreen === 'register') {
      return (
        <RegisterScreen
          onRegister={handleRegister}
          onNavigateToLogin={() => setCurrentScreen('login')}
        />
      );
    }

    // Authenticated screens
    switch (currentScreen) {
      // User Profile & Settings
      case 'profile':
        return <ProfileScreen onBack={handleBack} onNavigate={handleNavigate} />;
      case 'settings':
        return <SettingsScreen onBack={handleBack} onLogout={handleLogout} />;
      
      // Profile Setup (Contractor/Homeowner)
      case 'contractorProfile':
        return <ContractorProfileScreen onBack={handleBack} />;
      case 'projectProfile':
        return <ProjectProfileScreen onBack={handleBack} />;
      
      // Project Management
      case 'newEstimate':
        return <NewEstimateScreen onBack={handleBack} />;
      case 'projectDetails':
        return <ProjectDetailsScreen onBack={handleBack} />;
      
      // Analysis Tools
      case 'photoAnalysis':
        return <PhotoAnalysisScreen onBack={handleBack} />;
      case 'blueprintAnalysis':
        return <BlueprintAnalysisScreen onBack={handleBack} />;
      case 'buildingCodes':
        return <BuildingCodesScreen onBack={handleBack} />;
      
      // Contractor Services
      case 'findContractors':
        return <FindContractorsScreen onBack={handleBack} />;
      case 'priceComparison':
        return <PriceComparisonScreen onBack={handleBack} />;
      case 'permitAssistance':
        return <PermitAssistanceScreen onBack={handleBack} />;
      
      // Help & Support
      case 'help':
        return <HelpScreen onBack={handleBack} />;
      
      default:
        return <HomeScreen onNavigate={handleNavigate} user={user} />;
    }
  };

  return (
    <>
      {renderScreen()}
      <StatusBar style="auto" />
    </>
  );
}
