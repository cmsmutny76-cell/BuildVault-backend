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
import ProjectSelectorScreen from './screens/ProjectSelectorScreen';
import CreateProjectScreen from './screens/CreateProjectScreen';
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
// Email Verification
import EmailVerificationScreen from './screens/EmailVerificationScreen';
import EmailVerificationResultScreen from './screens/EmailVerificationResultScreen';
import { revenueCatService } from './services/revenueCat';
import { MockContractor, MockEstimate, mockContractors, mockEstimates } from './services/mockData';
import { Contractor } from './screens/ContractorSearchScreen';

type Screen = 'home' | 'profile' | 'settings' | 'login' | 'register' | 'emailVerification' | 'emailVerificationResult' | 'projectSelector' | 'createProject' | 'photoAnalysis' | 'blueprintAnalysis' | 'buildingCodes' | 'priceComparison' | 'findContractors' | 'permitAssistance' | 'help' | 'projectDetails' | 'newEstimate' | 'projectProfile' | 'contractorProfile' | 'contractorView' | 'contractorSearch' | 'estimateView' | 'estimateList' | 'commercial' | 'multiFamily' | 'apartment' | 'developer' | 'landscaping' | 'foodProvider' | 'careerOpportunities' | 'employment' | 'laborPool' | 'messaging' | 'chat';

interface User {
  id: string;
  email: string;
  isContractor: boolean;
}

interface Project {
  id: string;
  ownerId: string;
  title: string;
  description?: string;
  projectType: string;
  location: {
    city: string;
    state: string;
    zipCode: string;
    street?: string;
  };
  status: string;
  createdAt: string;
}

export default function App() {
  const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL;
  const configuredApiOrigin = configuredApiUrl
    ? configuredApiUrl.replace(/\/api\/?$/, '')
    : null;

  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [navigationStack, setNavigationStack] = useState<Screen[]>([]);
  const [user, setUser] = useState<User | null>(null);
  
  // State for passing data between screens
  const [selectedContractor, setSelectedContractor] = useState<Contractor | MockContractor | null>(null);
  const [selectedEstimate, setSelectedEstimate] = useState<MockEstimate | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  // Email verification state
  const [verificationEmail, setVerificationEmail] = useState<string>('');
  const [verificationToken, setVerificationToken] = useState<string>('');
  const [verificationUserId, setVerificationUserId] = useState<string>('');

  // Initialize RevenueCat on app start
  useEffect(() => {
    if (user) {
      revenueCatService.initialize(user.id);
    }
  }, [user]);

  // Rewrite legacy localhost API calls to configured backend host
  useEffect(() => {
    if (!configuredApiOrigin) {
      console.warn('EXPO_PUBLIC_API_URL is not set. App may fail to reach backend outside local development.');
      return;
    }

    const originalFetch = global.fetch.bind(global);

    global.fetch = ((input: any, init?: RequestInit) => {
      const localhostOrigin = 'http://localhost:3000';

      if (typeof input === 'string' && input.startsWith(localhostOrigin)) {
        const rewritten = input.replace(localhostOrigin, configuredApiOrigin);
        return originalFetch(rewritten, init);
      }

      if (input instanceof Request && input.url.startsWith(localhostOrigin)) {
        const rewrittenRequest = new Request(
          input.url.replace(localhostOrigin, configuredApiOrigin),
          input
        );
        return originalFetch(rewrittenRequest, init);
      }

      return originalFetch(input, init);
    }) as typeof fetch;

    return () => {
      global.fetch = originalFetch as typeof fetch;
    };
  }, [configuredApiOrigin]);

  // Handle deep links for email verification
  useEffect(() => {
    // Check for verification link on app open
    const checkInitialUrl = async () => {
      try {
        // This requires expo-linking to be installed
        // For now, verification can be tested through the resend email flow
        // TODO: Install expo-linking and implement deep link handling
        // import * as Linking from 'expo-linking';
        // const url = await Linking.getInitialURL();
        // if (url && url.includes('verify')) {
        //   const params = new URL(url).searchParams;
        //   const token = params.get('token');
        //   const userId = params.get('userId');
        //   if (token && userId) {
        //     setVerificationToken(token);
        //     setVerificationUserId(userId);
        //     setCurrentScreen('emailVerificationResult');
        //   }
        // }
      } catch (error) {
        console.log('Deep linking not configured');
      }
    };

    checkInitialUrl();
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    setCurrentScreen('home');
    setNavigationStack([]);
  };

  const handleLogout = () => {
    setUser(null);
    setSelectedProject(null);
    setCurrentScreen('login');
    setNavigationStack([]);
  };

  const handleRegister = (userData: User) => {
    setUser(userData);
    setCurrentScreen('home');
    setNavigationStack([]);
  };

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    handleBack();
  };

  const handleProjectCreated = (project: Project) => {
    setSelectedProject(project);
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
          onNavigateToEmailVerification={(email) => {
            setVerificationEmail(email);
            setCurrentScreen('emailVerification');
          }}
        />
      );
    }

    if (currentScreen === 'emailVerification') {
      return (
        <EmailVerificationScreen
          email={verificationEmail}
          onNavigateToLogin={() => setCurrentScreen('login')}
          onBack={() => setCurrentScreen('register')}
        />
      );
    }

    if (currentScreen === 'emailVerificationResult') {
      return (
        <EmailVerificationResultScreen
          token={verificationToken}
          userId={verificationUserId}
          onNavigateToLogin={() => setCurrentScreen('login')}
          onBack={() => {
            setVerificationEmail('');
            setCurrentScreen('emailVerification');
          }}
        />
      );
    }

    // Authenticated screens
    switch (currentScreen) {
      // Project Management
      case 'projectSelector':
        return user ? (
          <ProjectSelectorScreen
            currentUserId={user.id}
            currentProjectId={selectedProject?.id || null}
            onSelectProject={handleProjectSelect}
            onCreateNewProject={() => handleNavigate('createProject')}
            onBack={handleBack}
          />
        ) : (
          <HomeScreen onNavigate={handleNavigate} user={user} />
        );
      
      case 'createProject':
        return user ? (
          <CreateProjectScreen
            currentUserId={user.id}
            onProjectCreated={handleProjectCreated}
            onBack={handleBack}
          />
        ) : (
          <HomeScreen onNavigate={handleNavigate} user={user} />
        );
      
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
        return <FindContractorsScreen onBack={handleBack} onNavigate={handleNavigate} hasSelectedProject={!!selectedProject} />;
      case 'contractorSearch':
        return (
          <ContractorSearchScreen
            projectId={selectedProject?.id}
            onBack={handleBack}
            onViewContractor={(contractor) => {
              setSelectedContractor(contractor);
              handleNavigate('contractorView');
            }}
          />
        );
      case 'contractorView':
        return selectedContractor && 'companyName' in selectedContractor ? (
          <ContractorViewScreen
            contractor={selectedContractor as MockContractor}
            onBack={handleBack}
            onSendMessage={(contractorId) => {
              alert(`Message feature coming soon! Contractor ID: ${contractorId}`);
            }}
            onRequestEstimate={(contractorId) => {
              alert(`Estimate request sent to contractor ${contractorId}!`);
            }}
          />
        ) : (
          <HomeScreen onNavigate={handleNavigate} user={user} selectedProject={selectedProject} />
        );
      case 'estimateList':
        return selectedProject ? (
          <EstimateListScreen
            projectId={selectedProject.id}
            onBack={handleBack}
            onViewEstimate={(estimate) => {
              setSelectedEstimate(estimate);
              handleNavigate('estimateView');
            }}
          />
        ) : (
          <HomeScreen onNavigate={handleNavigate} user={user} selectedProject={selectedProject} />
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
          <HomeScreen onNavigate={handleNavigate} user={user} selectedProject={selectedProject} />
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
        return <MessagingListScreen onBack={handleBack} onNavigate={handleNavigate} currentUserId={user?.id || ''} />;
      case 'chat':
        return <ChatScreen onBack={handleBack} currentUserId={user?.id || ''} />;
      
      default:
        return <HomeScreen onNavigate={handleNavigate} user={user} selectedProject={selectedProject} />;
    }
  };

  return (
    <>
      {renderScreen()}
      <StatusBar style="auto" />
    </>
  );
}
