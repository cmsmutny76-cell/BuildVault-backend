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
import ContractorViewScreen from './screens/ContractorViewScreen';
import ContractorSearchScreen from './screens/ContractorSearchScreen';
import EstimateViewScreen, { EstimateListScreen } from './screens/EstimateViewScreen';
// Category Dashboards
import CommercialDashboard from './screens/CommercialDashboard';
import MultiFamilyDashboard from './screens/MultiFamilyDashboard';
import ApartmentDashboard from './screens/ApartmentDashboard';
import DeveloperDashboard from './screens/DeveloperDashboard';
import LandscapingDashboard from './screens/LandscapingDashboard';
import FoodProviderDashboard from './screens/FoodProviderDashboard';
import CareerOpportunitiesDashboard from './screens/CareerOpportunitiesDashboard';
import EmploymentDashboard from './screens/EmploymentDashboard';
import LaborPoolDashboard from './screens/LaborPoolDashboard';
// Messaging
import MessagingListScreen from './screens/MessagingListScreen';
import ChatScreen from './screens/ChatScreen';
import { revenueCatService } from './services/revenueCat';
import { MockContractor, MockEstimate, mockContractors, mockEstimates } from './services/mockData';

type Screen = 'home' | 'profile' | 'settings' | 'login' | 'register' | 'photoAnalysis' | 'blueprintAnalysis' | 'buildingCodes' | 'priceComparison' | 'findContractors' | 'permitAssistance' | 'help' | 'projectDetails' | 'newEstimate' | 'projectProfile' | 'contractorProfile' | 'contractorView' | 'contractorSearch' | 'estimateView' | 'estimateList' | 'commercial' | 'multiFamily' | 'apartment' | 'developer' | 'landscaping' | 'foodProvider' | 'careerOpportunities' | 'employment' | 'laborPool' | 'messaging' | 'chat';

interface User {
  id: string;
  email: string;
  isContractor: boolean;
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [navigationStack, setNavigationStack] = useState<Screen[]>([]);
  const [user, setUser] = useState<User | null>(null);
  
  // State for passing data between screens
  const [selectedContractor, setSelectedContractor] = useState<MockContractor | null>(null);
  const [selectedEstimate, setSelectedEstimate] = useState<MockEstimate | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

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
      case 'contractorSearch':
        return (
          <ContractorSearchScreen
            projectId={selectedProjectId || undefined}
            onBack={handleBack}
            onViewContractor={(contractor) => {
              setSelectedContractor(contractor);
              handleNavigate('contractorView');
            }}
          />
        );
      case 'contractorView':
        return selectedContractor ? (
          <ContractorViewScreen
            contractor={selectedContractor}
            onBack={handleBack}
            onSendMessage={(contractorId) => {
              alert(`Message feature coming soon! Contractor ID: ${contractorId}`);
            }}
            onRequestEstimate={(contractorId) => {
              alert(`Estimate request sent to contractor ${contractorId}!`);
            }}
          />
        ) : (
          <HomeScreen onNavigate={handleNavigate} user={user} />
        );
      case 'estimateList':
        return selectedProjectId ? (
          <EstimateListScreen
            projectId={selectedProjectId}
            onBack={handleBack}
            onViewEstimate={(estimate) => {
              setSelectedEstimate(estimate);
              handleNavigate('estimateView');
            }}
          />
        ) : (
          <HomeScreen onNavigate={handleNavigate} user={user} />
        );
      case 'estimateView':
        return selectedEstimate ? (
          <EstimateViewScreen
            estimate={selectedEstimate}
            onBack={handleBack}
            onAccept={(estimateId) => {
              alert(`Estimate ${estimateId} accepted!`);
              handleBack();
            }}
            onReject={(estimateId) => {
              alert(`Estimate ${estimateId} rejected.`);
              handleBack();
            }}
            onContactContractor={(contractorId) => {
              const contractor = mockContractors.find(c => c.id === contractorId);
              if (contractor) {
                setSelectedContractor(contractor);
                handleNavigate('contractorView');
              }
            }}
          />
        ) : (
          <HomeScreen onNavigate={handleNavigate} user={user} />
        );
      case 'priceComparison':
        return <PriceComparisonScreen onBack={handleBack} />;
      case 'permitAssistance':
        return <PermitAssistanceScreen onBack={handleBack} />;
      
      // Help & Support
      case 'help':
        return <HelpScreen onBack={handleBack} />;
      
      // Category Dashboards
      case 'commercial':
        return <CommercialDashboard onBack={handleBack} onNavigate={handleNavigate} />;
      case 'multiFamily':
        return <MultiFamilyDashboard onBack={handleBack} onNavigate={handleNavigate} />;
      case 'apartment':
        return <ApartmentDashboard onBack={handleBack} onNavigate={handleNavigate} />;
      case 'developer':
        return <DeveloperDashboard onBack={handleBack} onNavigate={handleNavigate} />;
      case 'landscaping':
        return <LandscapingDashboard onBack={handleBack} onNavigate={handleNavigate} />;
      case 'foodProvider':
        return <FoodProviderDashboard onBack={handleBack} onNavigate={handleNavigate} />;
      case 'careerOpportunities':
        return <CareerOpportunitiesDashboard onBack={handleBack} onNavigate={handleNavigate} />;
      case 'employment':
        return <EmploymentDashboard onBack={handleBack} onNavigate={handleNavigate} />;
      case 'laborPool':
        return <LaborPoolDashboard onBack={handleBack} onNavigate={handleNavigate} />;
      
      // Messaging
      case 'messaging':
        return <MessagingListScreen onBack={handleBack} onNavigate={handleNavigate} />;
      case 'chat':
        return <ChatScreen onBack={handleBack} />;
      
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
