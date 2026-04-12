import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import HomeScreen from './screens/HomeScreen';
import ProfileScreen from './screens/ProfileScreen';
import SettingsScreen from './screens/SettingsScreen';
import LandingScreen from './screens/LandingScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import PhotoAnalysisScreen from './screens/PhotoAnalysisScreen';
import BlueprintAnalysisScreen from './screens/BlueprintAnalysisScreen';
import BuildingCodesScreen from './screens/BuildingCodesScreen';
import PriceComparisonScreen from './screens/PriceComparisonScreen';
import HelpScreen from './screens/HelpScreen';
import FindSuppliersScreen from './screens/FindSuppliersScreen';
import SupplierProfileScreen from './screens/SupplierProfileScreen';
import ProjectSchedulingScreen from './screens/ProjectSchedulingScreen';
import ProjectProfileScreen from './screens/ProjectProfileScreen';
import ContractorProfileScreen from './screens/ContractorProfileScreen';
import CommercialBuilderProfileScreen from './screens/CommercialBuilderProfileScreen';
import MultiFamilyProfileScreen from './screens/MultiFamilyProfileScreen';
import ApartmentOwnerProfileScreen from './screens/ApartmentOwnerProfileScreen';
import DeveloperProfileScreen from './screens/DeveloperProfileScreen';
import LandscaperProfileScreen from './screens/LandscaperProfileScreen';
import SchoolProfileScreen from './screens/SchoolProfileScreen';
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
import { saveAuthSession, getAuthSession, clearAuthSession } from './services/authStorage';
import type { MobileUserType } from './services/api';
import { MockContractor, MockEstimate, mockContractors, mockEstimates } from './services/mockData';
import { Contractor } from './screens/ContractorSearchScreen';

type Screen = 'landing' | 'home' | 'profile' | 'settings' | 'login' | 'register' | 'emailVerification' | 'emailVerificationResult' | 'projectSelector' | 'createProject' | 'photoAnalysis' | 'blueprintAnalysis' | 'buildingCodes' | 'priceComparison' | 'findContractors' | 'findSuppliers' | 'supplierProfile' | 'projectScheduling' | 'permitAssistance' | 'help' | 'projectDetails' | 'newEstimate' | 'projectProfile' | 'contractorProfile' | 'commercialBuilderProfile' | 'multiFamilyProfile' | 'apartmentOwnerProfile' | 'developerProfile' | 'landscaperProfile' | 'schoolProfile' | 'contractorView' | 'contractorSearch' | 'estimateView' | 'estimateList' | 'commercial' | 'multiFamily' | 'apartment' | 'developer' | 'landscaping' | 'foodProvider' | 'careerOpportunities' | 'employment' | 'laborPool' | 'messaging' | 'chat';

interface User {
  id: string;
  email: string;
  isContractor: boolean;
  userType?: MobileUserType;
  firstName?: string;
  lastName?: string;
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


const DEFAULT_API_BASE_URL = 'http://localhost:3000/api';
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_BASE_URL;
const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');
const LOCAL_API_ORIGIN = 'http://localhost:3000';

function patchGlobalFetchForApiOrigin() {
  const globalWithPatchFlag = globalThis as typeof globalThis & {
    __buildVaultFetchPatched?: boolean;
  };

  if (globalWithPatchFlag.__buildVaultFetchPatched) {
    return;
  }

  const originalFetch = globalWithPatchFlag.fetch.bind(globalWithPatchFlag);

  globalWithPatchFlag.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    if (typeof input === 'string' && input.startsWith(LOCAL_API_ORIGIN)) {
      const rewrittenUrl = `${API_ORIGIN}${input.slice(LOCAL_API_ORIGIN.length)}`;
      return originalFetch(rewrittenUrl, init);
    }

    if (input instanceof URL && input.origin === LOCAL_API_ORIGIN) {
      const rewrittenUrl = `${API_ORIGIN}${input.pathname}${input.search}${input.hash}`;
      return originalFetch(rewrittenUrl, init);
    }

    return originalFetch(input, init);
  }) as typeof fetch;

  globalWithPatchFlag.__buildVaultFetchPatched = true;
}
export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');
  const [navigationStack, setNavigationStack] = useState<Screen[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  
  // State for passing data between screens
  const [selectedContractor, setSelectedContractor] = useState<Contractor | MockContractor | null>(null);
  const [selectedEstimate, setSelectedEstimate] = useState<MockEstimate | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  // Email verification state
  const [verificationEmail, setVerificationEmail] = useState<string>('');
  const [verificationToken, setVerificationToken] = useState<string>('');
  const [verificationUserId, setVerificationUserId] = useState<string>('');

  useEffect(() => {
    patchGlobalFetchForApiOrigin();
  }, []);

  // Restore persisted session on app start
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const session = await getAuthSession();
        if (session) {
          setUser(session.user);
          setCurrentScreen('home');
        }
      } catch {
        // No valid session, stay on landing
      } finally {
        setSessionLoading(false);
      }
    };
    restoreSession();
  }, []);

  // Initialize RevenueCat on app start
  useEffect(() => {
    if (user) {
      revenueCatService.initialize(user.id);
    }
  }, [user]);

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

  const handleLogin = (userData: User, token?: string) => {
    setUser(userData);
    setCurrentScreen('home');
    setNavigationStack([]);
    if (token) {
      saveAuthSession(token, userData).catch(() => {});
    }
  };

  const handleLogout = () => {
    setUser(null);
    setSelectedProject(null);
    setCurrentScreen('login');
    setNavigationStack([]);
    clearAuthSession().catch(() => {});
  };

  const handleRegister = (userData: User, token?: string) => {
    setUser(userData);
    setCurrentScreen('home');
    setNavigationStack([]);
    if (token) {
      saveAuthSession(token, userData).catch(() => {});
    }
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
    if (currentScreen !== 'landing' && currentScreen !== 'login' && currentScreen !== 'register') {
      setNavigationStack([...navigationStack, currentScreen]);
    }
    setCurrentScreen(screen);
  };

  const handleStringNavigate = (screen: string) => {
    handleNavigate(screen as Screen);
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
    if (sessionLoading) {
      return null;
    }

    // Auth screens
    if (currentScreen === 'landing') {
      return <LandingScreen onContinue={() => setCurrentScreen('login')} />;
    }

    if (currentScreen === 'login') {
      return (
        <LoginScreen
          onLogin={handleLogin}
          onNavigateToRegister={() => setCurrentScreen('register')}
          onBackToLanding={() => setCurrentScreen('landing')}
        />
      );
    }

    if (currentScreen === 'register') {
      return (
        <RegisterScreen
          onNavigateToLogin={() => setCurrentScreen('login')}
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
          <HomeScreen onNavigate={handleNavigate} onLogout={handleLogout} user={user} />
        );
      
      case 'createProject':
        return user ? (
          <CreateProjectScreen
            currentUserId={user.id}
            onProjectCreated={handleProjectCreated}
            onBack={handleBack}
          />
        ) : (
          <HomeScreen onNavigate={handleNavigate} onLogout={handleLogout} user={user} />
        );
      
      // User Profile & Settings
      case 'profile':
        return <ProfileScreen onBack={handleBack} onNavigate={handleNavigate} userId={user?.id} />;
      case 'settings':
        return <SettingsScreen onBack={handleBack} onLogout={handleLogout} />;
      
      // Profile Setup (Contractor/Homeowner)
      case 'contractorProfile':
        return <ContractorProfileScreen onBack={handleBack} />;
      case 'commercialBuilderProfile':
        return <CommercialBuilderProfileScreen onBack={handleBack} />;
      case 'multiFamilyProfile':
        return <MultiFamilyProfileScreen onBack={handleBack} />;
      case 'apartmentOwnerProfile':
        return <ApartmentOwnerProfileScreen onBack={handleBack} />;
      case 'developerProfile':
        return <DeveloperProfileScreen onBack={handleBack} />;
      case 'landscaperProfile':
        return <LandscaperProfileScreen onBack={handleBack} />;
      case 'schoolProfile':
        return <SchoolProfileScreen onBack={handleBack} />;
      case 'projectProfile':
        return <ProjectProfileScreen onBack={handleBack} />;
      
      // Project Management
      case 'newEstimate':
        return <PhotoAnalysisScreen onBack={handleBack} />;
      case 'projectDetails':
        return user ? (
          <ProjectSelectorScreen
            currentUserId={user.id}
            currentProjectId={selectedProject?.id || null}
            onSelectProject={handleProjectSelect}
            onCreateNewProject={() => handleNavigate('createProject')}
            onBack={handleBack}
          />
        ) : (
          <HomeScreen onNavigate={handleNavigate} onLogout={handleLogout} user={user} selectedProject={selectedProject} />
        );
      
      // Analysis Tools
      case 'photoAnalysis':
        return <PhotoAnalysisScreen onBack={handleBack} />;
      case 'blueprintAnalysis':
        return <BlueprintAnalysisScreen onBack={handleBack} />;
      case 'buildingCodes':
        return <BuildingCodesScreen onBack={handleBack} />;
      
      // Contractor Services
      case 'findContractors':
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
      case 'findSuppliers':
        return (
          <FindSuppliersScreen
            onBack={handleBack}
            viewerType={user?.isContractor ? 'contractor' : 'homeowner'}
          />
        );
      case 'supplierProfile':
        return user ? (
          <SupplierProfileScreen onBack={handleBack} userId={user.id} />
        ) : (
          <HomeScreen onNavigate={handleNavigate} onLogout={handleLogout} user={user} selectedProject={selectedProject} />
        );
      case 'projectScheduling':
        return user ? (
          <ProjectSchedulingScreen onBack={handleBack} userId={user.id} />
        ) : (
          <HomeScreen onNavigate={handleNavigate} onLogout={handleLogout} user={user} selectedProject={selectedProject} />
        );
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
          <HomeScreen onNavigate={handleNavigate} onLogout={handleLogout} user={user} selectedProject={selectedProject} />
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
          <HomeScreen onNavigate={handleNavigate} onLogout={handleLogout} user={user} selectedProject={selectedProject} />
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
          <HomeScreen onNavigate={handleNavigate} onLogout={handleLogout} user={user} selectedProject={selectedProject} />
        );
      case 'priceComparison':
        return <PriceComparisonScreen onBack={handleBack} />;
      case 'permitAssistance':
        return <BuildingCodesScreen onBack={handleBack} />;
      
      // Help & Support
      case 'help':
        return <HelpScreen onBack={handleBack} />;
      
      // Category Dashboards
      case 'commercial':
        return <CommercialDashboard onBack={handleBack} onNavigate={handleStringNavigate} />;
      case 'multiFamily':
        return <MultiFamilyDashboard onBack={handleBack} onNavigate={handleStringNavigate} />;
      case 'apartment':
        return <ApartmentDashboard onBack={handleBack} onNavigate={handleStringNavigate} />;
      case 'developer':
        return <DeveloperDashboard onBack={handleBack} onNavigate={handleStringNavigate} />;
      case 'landscaping':
        return <LandscapingDashboard onBack={handleBack} onNavigate={handleStringNavigate} />;
      case 'foodProvider':
        return <FoodProviderDashboard onBack={handleBack} onNavigate={handleStringNavigate} />;
      case 'careerOpportunities':
        return <CareerOpportunitiesDashboard onBack={handleBack} onNavigate={handleStringNavigate} />;
      case 'employment':
        return <EmploymentDashboard onBack={handleBack} onNavigate={handleStringNavigate} />;
      case 'laborPool':
        return <LaborPoolDashboard onBack={handleBack} onNavigate={handleStringNavigate} />;
      
      // Messaging
      case 'messaging':
        return <MessagingListScreen onBack={handleBack} onNavigate={handleNavigate} currentUserId={user?.id || ''} />;
      case 'chat':
        return <ChatScreen onBack={handleBack} currentUserId={user?.id || ''} />;
      
      default:
        return <HomeScreen onNavigate={handleNavigate} onLogout={handleLogout} user={user} selectedProject={selectedProject} />;
    }
  };

  return (
    <>
      {renderScreen()}
      <StatusBar style="auto" />
    </>
  );
}
