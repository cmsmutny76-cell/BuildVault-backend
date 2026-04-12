import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Modal,
  Alert,
  ImageBackground,
  TextInput,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import BrandLockup from '../components/BrandLockup';

interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  isPrimary: boolean;
  activeProjects: number;
  projectStatus?: 'in-progress' | 'pending' | 'completed' | 'none';
}

interface HomeScreenProps {
  onNavigate: (screen: 'home' | 'profile' | 'settings' | 'contractorProfile' | 'projectProfile' | 'projectSelector' | 'newEstimate' | 'projectDetails' | 'photoAnalysis' | 'blueprintAnalysis' | 'buildingCodes' | 'findContractors' | 'findSuppliers' | 'supplierProfile' | 'projectScheduling' | 'priceComparison' | 'permitAssistance' | 'help' | 'contractorView' | 'contractorSearch' | 'estimateView' | 'estimateList' | 'commercial' | 'multiFamily' | 'apartment' | 'developer' | 'landscaping' | 'foodProvider' | 'careerOpportunities' | 'employment' | 'laborPool' | 'messaging') => void;
  onLogout?: () => void;
  user: { id: string; email: string; isContractor: boolean } | null;
  selectedProject?: {
    id: string;
    title: string;
    projectType: string;
    location: { city: string; state: string };
    status: string;
  } | null;
}

type ProjectCategory = 'residential' | 'commercial' | 'multi-family' | 'apartment' | 'landscaping' | 'career-opportunities' | 'labor-pool' | 'employment' | 'developer' | 'food-service' | null;

export default function HomeScreen({ onNavigate, onLogout, user, selectedProject }: HomeScreenProps) {
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ProjectCategory>(null);
  const [viewMode, setViewMode] = useState<'homeowner' | 'contractor'>(
    user?.isContractor ? 'contractor' : 'homeowner'
  );
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: '1',
      name: 'Primary Residence',
      street: '123 Main Street',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90001',
      isPrimary: true,
      activeProjects: 2,
      projectStatus: 'in-progress',
    }
  ]);
  const [addAddressModalVisible, setAddAddressModalVisible] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    isPrimary: false,
  });

  const handleAddAddress = () => {
    setAddAddressModalVisible(true);
  };

  const handleSaveAddress = () => {
    // Validate fields
    if (!newAddress.name || !newAddress.street || !newAddress.city || !newAddress.state || !newAddress.zipCode) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Create new address
    const address: Address = {
      id: Date.now().toString(),
      name: newAddress.name,
      street: newAddress.street,
      city: newAddress.city,
      state: newAddress.state,
      zipCode: newAddress.zipCode,
      isPrimary: addresses.length === 0 ? true : newAddress.isPrimary,
      activeProjects: 0,
      projectStatus: 'none',
    };

    setAddresses([...addresses, address]);
    setAddAddressModalVisible(false);
    setNewAddress({
      name: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      isPrimary: false,
    });
  };

  const handleCancelAddAddress = () => {
    setAddAddressModalVisible(false);
    setNewAddress({
      name: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      isPrimary: false,
    });
  };

  const handleAddressClick = (address: Address) => {
    setMenuVisible(false);
    onNavigate('projectDetails');
  };

  const handleCategorySelect = (category: ProjectCategory) => {
    setMenuVisible(false);
    switch (category) {
      case 'residential':
        setSelectedCategory('residential');
        break;
      case 'commercial':
        onNavigate('commercial');
        break;
      case 'multi-family':
        onNavigate('multiFamily');
        break;
      case 'apartment':
        onNavigate('apartment');
        break;
      case 'landscaping':
        onNavigate('landscaping');
        break;
      case 'labor-pool':
        onNavigate('laborPool');
        break;
      case 'employment':
        onNavigate('employment');
        break;
      case 'career-opportunities':
        onNavigate('careerOpportunities');
        break;
      case 'developer':
        onNavigate('developer');
        break;
      case 'food-service':
        onNavigate('foodProvider');
        break;
      default:
        onNavigate('contractorSearch');
    }
  };

  const handleMenuOption = (screen: 'profile' | 'settings' | 'contractorProfile' | 'projectProfile' | 'newEstimate' | 'projectDetails' | 'photoAnalysis' | 'blueprintAnalysis' | 'buildingCodes' | 'findContractors' | 'findSuppliers' | 'supplierProfile' | 'projectScheduling' | 'priceComparison' | 'permitAssistance' | 'help' | 'contractorView' | 'contractorSearch' | 'estimateView' | 'estimateList') => {
    setMenuVisible(false);
    onNavigate(screen);
  };

  const handleLogout = () => {
    setMenuVisible(false);
    onLogout?.();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Dropdown Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuDropdown}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => handleMenuOption('profile')}
            >
              <Text style={styles.menuItemIcon}>👤</Text>
              <Text style={styles.menuItemText}>Profile</Text>
            </TouchableOpacity>
            
            <View style={styles.menuDivider} />
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => handleMenuOption('photoAnalysis')}
            >
              <Text style={styles.menuItemIcon}>📸</Text>
              <Text style={styles.menuItemText}>Photo Analysis</Text>
            </TouchableOpacity>
            
            <View style={styles.menuDivider} />
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => handleMenuOption('blueprintAnalysis')}
            >
              <Text style={styles.menuItemIcon}>📐</Text>
              <Text style={styles.menuItemText}>Blueprint Analysis</Text>
            </TouchableOpacity>
            
            <View style={styles.menuDivider} />
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => handleMenuOption('buildingCodes')}
            >
              <Text style={styles.menuItemIcon}>🏛️</Text>
              <Text style={styles.menuItemText}>Building Codes</Text>
            </TouchableOpacity>
            
            <View style={styles.menuDivider} />
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => handleMenuOption('priceComparison')}
            >
              <Text style={styles.menuItemIcon}>💰</Text>
              <Text style={styles.menuItemText}>Price Comparison</Text>
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => handleMenuOption('projectScheduling')}
            >
              <Text style={styles.menuItemIcon}>📅</Text>
              <Text style={styles.menuItemText}>Project Scheduling</Text>
            </TouchableOpacity>
            
            <View style={styles.menuDivider} />
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => handleMenuOption('contractorSearch')}
            >
              <Text style={styles.menuItemIcon}>👷</Text>
              <Text style={styles.menuItemText}>Find Contractors</Text>
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleMenuOption('findSuppliers')}
            >
              <Text style={styles.menuItemIcon}>🏗️</Text>
              <Text style={styles.menuItemText}>Find Suppliers</Text>
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleMenuOption('supplierProfile')}
            >
              <Text style={styles.menuItemIcon}>🏪</Text>
              <Text style={styles.menuItemText}>Supplier Profile</Text>
            </TouchableOpacity>
            
            <View style={styles.menuDivider} />
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => handleMenuOption('permitAssistance')}
            >
              <Text style={styles.menuItemIcon}>📋</Text>
              <Text style={styles.menuItemText}>Permit Assistance</Text>
            </TouchableOpacity>
            
            <View style={styles.menuDivider} />
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => handleMenuOption('settings')}
            >
              <Text style={styles.menuItemIcon}>⚙️</Text>
              <Text style={styles.menuItemText}>Settings</Text>
            </TouchableOpacity>
            
            <View style={styles.menuDivider} />
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => handleMenuOption('help')}
            >
              <Text style={styles.menuItemIcon}>ℹ️</Text>
              <Text style={styles.menuItemText}>Help & Support</Text>
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleLogout}
            >
              <Text style={styles.menuItemIcon}>🚪</Text>
              <Text style={styles.logoutMenuItemText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Add Address Modal */}
      <Modal
        visible={addAddressModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCancelAddAddress}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.addAddressModalOverlay}
        >
          <View style={styles.addAddressModal}>
            <View style={styles.addAddressHeader}>
              <Text style={styles.addAddressTitle}>Add New Property</Text>
              <TouchableOpacity onPress={handleCancelAddAddress}>
                <Text style={styles.addAddressClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.addAddressForm}>
              <Text style={styles.addAddressLabel}>Property Name</Text>
              <TextInput
                style={styles.addAddressInput}
                placeholder="e.g., Primary Residence, Rental Property"
                placeholderTextColor="#9ca3af"
                value={newAddress.name}
                onChangeText={(text) => setNewAddress({ ...newAddress, name: text })}
              />

              <Text style={styles.addAddressLabel}>Street Address</Text>
              <TextInput
                style={styles.addAddressInput}
                placeholder="123 Main Street"
                placeholderTextColor="#9ca3af"
                value={newAddress.street}
                onChangeText={(text) => setNewAddress({ ...newAddress, street: text })}
              />

              <Text style={styles.addAddressLabel}>City</Text>
              <TextInput
                style={styles.addAddressInput}
                placeholder="Los Angeles"
                placeholderTextColor="#9ca3af"
                value={newAddress.city}
                onChangeText={(text) => setNewAddress({ ...newAddress, city: text })}
              />

              <View style={styles.addAddressRow}>
                <View style={styles.addAddressHalf}>
                  <Text style={styles.addAddressLabel}>State</Text>
                  <TextInput
                    style={styles.addAddressInput}
                    placeholder="CA"
                    placeholderTextColor="#9ca3af"
                    value={newAddress.state}
                    onChangeText={(text) => setNewAddress({ ...newAddress, state: text })}
                    maxLength={2}
                    autoCapitalize="characters"
                  />
                </View>

                <View style={styles.addAddressHalf}>
                  <Text style={styles.addAddressLabel}>ZIP Code</Text>
                  <TextInput
                    style={styles.addAddressInput}
                    placeholder="90001"
                    placeholderTextColor="#9ca3af"
                    value={newAddress.zipCode}
                    onChangeText={(text) => setNewAddress({ ...newAddress, zipCode: text })}
                    keyboardType="numeric"
                    maxLength={5}
                  />
                </View>
              </View>

              <View style={styles.addAddressToggleRow}>
                <View>
                  <Text style={styles.addAddressLabel}>Set as Primary</Text>
                  <Text style={styles.addAddressSubtext}>Your main property address</Text>
                </View>
                <Switch
                  value={newAddress.isPrimary}
                  onValueChange={(value) => setNewAddress({ ...newAddress, isPrimary: value })}
                  trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
                  thumbColor={newAddress.isPrimary ? '#1e40af' : '#f3f4f6'}
                />
              </View>
            </ScrollView>

            <View style={styles.addAddressActions}>
              <TouchableOpacity
                style={styles.addAddressCancelButton}
                onPress={handleCancelAddAddress}
              >
                <Text style={styles.addAddressCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.addAddressSaveButton}
                onPress={handleSaveAddress}
              >
                <Text style={styles.addAddressSaveButtonText}>Save Property</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Header */}
      <View style={styles.header}>
        {selectedCategory && (
          <TouchableOpacity onPress={() => setSelectedCategory(null)} style={styles.backButtonTop}>
            <Text style={styles.backButtonTopText}>← Back to Categories</Text>
          </TouchableOpacity>
        )}
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <BrandLockup
              subtitle={selectedCategory ? `${selectedCategory.charAt(0).toUpperCase()}${selectedCategory.slice(1).replace('-', ' ')} Projects` : 'Select Project Type'}
              theme="dark"
              variant="compact"
            />
          </View>
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => setMenuVisible(true)}
          >
            <View style={styles.menuIcon}>
              <View style={styles.menuLine} />
              <View style={styles.menuLine} />
              <View style={styles.menuLine} />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {!selectedCategory ? (
        // Category Selection View
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&q=80&blur=2' }}
          style={styles.backgroundImage}
          resizeMode="stretch"
        >
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            {/* Project Selector Banner */}
            {!user?.isContractor && (
              <TouchableOpacity
                style={styles.projectBanner}
                onPress={() => onNavigate('projectSelector')}
                activeOpacity={0.8}
              >
                {selectedProject ? (
                  <View style={styles.projectBannerContent}>
                    <View style={styles.projectBannerLeft}>
                      <Text style={styles.projectBannerLabel}>Active Project</Text>
                      <Text style={styles.projectBannerTitle}>{selectedProject.title}</Text>
                      <Text style={styles.projectBannerDetails}>
                        {selectedProject.location.city}, {selectedProject.location.state} • {selectedProject.projectType}
                      </Text>
                    </View>
                    <View style={styles.projectBannerRight}>
                      <Text style={styles.projectBannerChange}>Change</Text>
                      <Text style={styles.projectBannerArrow}>→</Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.projectBannerContent}>
                    <View style={styles.projectBannerLeft}>
                      <Text style={styles.projectBannerIcon}>📋</Text>
                      <View>
                        <Text style={styles.projectBannerTitle}>No Project Selected</Text>
                        <Text style={styles.projectBannerSubtitle}>Tap to select or create a project</Text>
                      </View>
                    </View>
                    <Text style={styles.projectBannerArrow}>→</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}

            {/* Welcome Card */}
            <View style={styles.welcomeCard}>
              <Text style={styles.welcomeTitle}>Welcome {user?.email ? '👋' : ''}</Text>
              <Text style={styles.welcomeText}>
                Choose your project category to get started with AI-powered contractor matching
              </Text>
            </View>

            {/* Category Tiles */}
            <View style={styles.categoryGrid}>
          {/* Residential */}
          <TouchableOpacity
            style={styles.categoryTile}
            onPress={() => handleCategorySelect('residential')}
            activeOpacity={0.8}
          >
            <ImageBackground
              source={{ uri: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80' }}
              style={styles.categoryImageBg}
              resizeMode="cover"
            >
              <View style={styles.categoryOverlay}>
                <Text style={styles.categoryTitle}>Residential</Text>
                <Text style={styles.categorySubtitle}>Homes & Single-Family</Text>
              </View>
            </ImageBackground>
          </TouchableOpacity>

          {/* Commercial */}
          <TouchableOpacity
            style={styles.categoryTile}
            onPress={() => handleCategorySelect('commercial')}
            activeOpacity={0.8}
          >
            <ImageBackground
              source={{ uri: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80' }}
              style={styles.categoryImageBg}
              resizeMode="cover"
            >
              <View style={styles.categoryOverlay}>
                <Text style={styles.categoryTitle}>Commercial</Text>
                <Text style={styles.categorySubtitle}>Business & Retail</Text>
              </View>
            </ImageBackground>
          </TouchableOpacity>

          {/* Multi-Family */}
          <TouchableOpacity
            style={styles.categoryTile}
            onPress={() => handleCategorySelect('multi-family')}
            activeOpacity={0.8}
          >
            <ImageBackground
              source={{ uri: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80' }}
              style={styles.categoryImageBg}
              resizeMode="cover"
            >
              <View style={styles.categoryOverlay}>
                <Text style={styles.categoryTitle}>Multi-Family</Text>
                <Text style={styles.categorySubtitle}>Condos & Duplexes</Text>
              </View>
            </ImageBackground>
          </TouchableOpacity>

          {/* Apartment */}
          <TouchableOpacity
            style={styles.categoryTile}
            onPress={() => handleCategorySelect('apartment')}
            activeOpacity={0.8}
          >
            <ImageBackground
              source={{ uri: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80&sat=-100&brightness=1.1' }}
              style={styles.categoryImageBg}
              resizeMode="cover"
            >
              <View style={styles.categoryOverlay}>
                <Text style={styles.categoryTitle}>Apartment</Text>
                <Text style={styles.categorySubtitle}>Complex & High-Rise</Text>
              </View>
            </ImageBackground>
          </TouchableOpacity>

          {/* Landscaping */}
          <TouchableOpacity
            style={styles.categoryTile}
            onPress={() => handleCategorySelect('landscaping')}
            activeOpacity={0.8}
          >
            <ImageBackground
              source={{ uri: 'https://images.unsplash.com/photo-1558904541-efa843a96f01?w=800&q=80' }}
              style={styles.categoryImageBg}
              resizeMode="cover"
            >
              <View style={styles.categoryOverlay}>
                <Text style={styles.categoryTitle}>Landscaping</Text>
                <Text style={styles.categorySubtitle}>Outdoor & Hardscape</Text>
              </View>
            </ImageBackground>
          </TouchableOpacity>

          {/* Labor Pool */}
          <TouchableOpacity
            style={styles.categoryTile}
            onPress={() => handleCategorySelect('labor-pool')}
            activeOpacity={0.8}
          >
            <ImageBackground
              source={{ uri: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80' }}
              style={styles.categoryImageBg}
              resizeMode="cover"
            >
              <View style={styles.categoryOverlay}>
                <Text style={styles.categoryTitle}>Labor Pool</Text>
                <Text style={styles.categorySubtitle}>Find Workers & Crews</Text>
              </View>
            </ImageBackground>
          </TouchableOpacity>

          {/* Employment Opportunities */}
          <TouchableOpacity
            style={styles.categoryTile}
            onPress={() => handleCategorySelect('employment')}
            activeOpacity={0.8}
          >
            <ImageBackground
              source={{ uri: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80' }}
              style={styles.categoryImageBg}
              resizeMode="cover"
            >
              <View style={styles.categoryOverlay}>
                <Text style={styles.categoryTitle}>Employment</Text>
                <Text style={styles.categorySubtitle}>Job Opportunities</Text>
              </View>
            </ImageBackground>
          </TouchableOpacity>

          {/* Developer */}
          <TouchableOpacity
            style={styles.categoryTile}
            onPress={() => handleCategorySelect('developer')}
            activeOpacity={0.8}
          >
            <ImageBackground
              source={{ uri: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&q=80' }}
              style={styles.categoryImageBg}
              resizeMode="cover"
            >
              <View style={styles.categoryOverlay}>
                <Text style={styles.categoryTitle}>Developer</Text>
                <Text style={styles.categorySubtitle}>Property Development</Text>
              </View>
            </ImageBackground>
          </TouchableOpacity>

          {/* Food Service */}
          <TouchableOpacity
            style={styles.categoryTile}
            onPress={() => handleCategorySelect('food-service')}
            activeOpacity={0.8}
          >
            <ImageBackground
              source={{ uri: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80' }}
              style={styles.categoryImageBg}
              resizeMode="cover"
            >
              <View style={styles.categoryOverlay}>
                <Text style={styles.categoryTitle}>Food Service</Text>
                <Text style={styles.categorySubtitle}>Construction Site Catering</Text>
              </View>
            </ImageBackground>
          </TouchableOpacity>

          {/* Career Opportunities */}
          <TouchableOpacity
            style={styles.categoryTile}
            onPress={() => handleCategorySelect('career-opportunities')}
            activeOpacity={0.8}
          >
            <ImageBackground
              source={{ uri: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&q=80' }}
              style={styles.categoryImageBg}
              resizeMode="cover"
            >
              <View style={styles.categoryOverlay}>
                <Text style={styles.categoryTitle}>Career Opportunities</Text>
                <Text style={styles.categorySubtitle}>Training & Development</Text>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        </View>

        {/* Info Section */}
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>✨</Text>
          <Text style={styles.infoTitle}>AI-Powered Matching</Text>
          <Text style={styles.infoText}>
            Our intelligent system matches you with the perfect contractors based on your project requirements, timeline, and budget
          </Text>
        </View>
      </ScrollView>
        </ImageBackground>
      ) : (
        // Residential Content View
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&q=80&blur=2' }}
          style={styles.backgroundImage}
          resizeMode="stretch"
        >
          
          {user?.isContractor && (
            <View style={styles.viewModeToggle}>
              <TouchableOpacity
                style={[styles.toggleButton, viewMode === 'homeowner' && styles.toggleButtonActive]}
                onPress={() => setViewMode('homeowner')}
              >
                <Text style={[styles.toggleText, viewMode === 'homeowner' && styles.toggleTextActive]}>
                  🏠 Homeowner View
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleButton, viewMode === 'contractor' && styles.toggleButtonActive]}
                onPress={() => setViewMode('contractor')}
              >
                <Text style={[styles.toggleText, viewMode === 'contractor' && styles.toggleTextActive]}>
                  🔨 Contractor View
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            <View style={styles.welcomeCard}>
              <Text style={styles.welcomeTitle}>
                {viewMode === 'contractor' ? 'Contractor Dashboard' : 'My Properties'}
              </Text>
              <Text style={styles.welcomeText}>
                {viewMode === 'contractor' 
                  ? 'Manage your active projects and customer locations'
                  : 'Track construction projects across all your properties'}
              </Text>
            </View>

            {/* Service Addresses Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Service Addresses</Text>
                <TouchableOpacity 
                  style={styles.addButton}
                  onPress={handleAddAddress}
                >
                  <Text style={styles.addButtonText}>+ Add</Text>
                </TouchableOpacity>
              </View>

              {addresses.map((address) => (
                <TouchableOpacity
                  key={address.id}
                  style={[
                    styles.addressCard,
                    address.isPrimary && styles.primaryAddressCard
                  ]}
                  onPress={() => handleAddressClick(address)}
                >
                  <View style={styles.addressHeader}>
                    <View style={styles.addressTitleRow}>
                      <Text style={styles.addressName}>{address.name}</Text>
                      {address.isPrimary && (
                        <View style={styles.primaryBadge}>
                          <Text style={styles.primaryBadgeText}>PRIMARY</Text>
                        </View>
                      )}
                    </View>
                    {address.activeProjects > 0 && (
                      <View style={[
                        styles.statusBadge,
                        address.projectStatus === 'in-progress' && styles.statusInProgress,
                        address.projectStatus === 'pending' && styles.statusPending,
                        address.projectStatus === 'completed' && styles.statusCompleted
                      ]}>
                        <Text style={styles.statusBadgeText}>
                          {address.activeProjects} Active
                        </Text>
                      </View>
                    )}
                  </View>
                  
                  <Text style={styles.addressStreet}>{address.street}</Text>
                  <Text style={styles.addressCity}>
                    {address.city}, {address.state} {address.zipCode}
                  </Text>

                  {address.activeProjects > 0 && (
                    <View style={styles.projectStatusBar}>
                      <Text style={styles.projectStatusIcon}>
                        {address.projectStatus === 'in-progress' && '🔨'}
                        {address.projectStatus === 'pending' && '⏳'}
                        {address.projectStatus === 'completed' && '✅'}
                      </Text>
                      <Text style={styles.projectStatusText}>
                        {address.projectStatus === 'in-progress' && 'Construction in Progress'}
                        {address.projectStatus === 'pending' && 'Awaiting Contractor'}
                        {address.projectStatus === 'completed' && 'Project Completed'}
                      </Text>
                      <Text style={styles.viewDetailsText}>View Details →</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              
              {viewMode === 'contractor' && (
                <TouchableOpacity 
                  style={styles.quickActionCard}
                  onPress={() => handleMenuOption('contractorProfile')}
                >
                  <Text style={styles.quickActionIcon}>🏆</Text>
                  <View style={styles.quickActionContent}>
                    <Text style={styles.quickActionTitle}>Complete Contractor Profile</Text>
                    <Text style={styles.quickActionDescription}>
                      Set up your profile for AI-powered project matching
                    </Text>
                  </View>
                </TouchableOpacity>
              )}

              {viewMode === 'homeowner' && (
                <TouchableOpacity 
                  style={styles.quickActionCard}
                  onPress={() => handleMenuOption('projectProfile')}
                >
                  <Text style={styles.quickActionIcon}>📋</Text>
                  <View style={styles.quickActionContent}>
                    <Text style={styles.quickActionTitle}>Create Project Profile</Text>
                    <Text style={styles.quickActionDescription}>
                      Get matched with the right contractors for your project
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity 
                style={styles.quickActionCard}
                onPress={() => handleMenuOption('newEstimate')}
              >
                <Text style={styles.quickActionIcon}>📸</Text>
                <View style={styles.quickActionContent}>
                  <Text style={styles.quickActionTitle}>Start New Estimate</Text>
                  <Text style={styles.quickActionDescription}>
                    Upload photos for AI-powered material analysis
                  </Text>
                </View>
              </TouchableOpacity>

              {viewMode === 'homeowner' && (
                <TouchableOpacity 
                  style={styles.quickActionCard}
                  onPress={() => handleMenuOption('contractorSearch')}
                >
                  <Text style={styles.quickActionIcon}>👷</Text>
                  <View style={styles.quickActionContent}>
                    <Text style={styles.quickActionTitle}>Find Contractors</Text>
                    <Text style={styles.quickActionDescription}>
                      Connect with qualified professionals in your area
                    </Text>
                  </View>
                </TouchableOpacity>
              )}

              {viewMode === 'homeowner' && (
                <TouchableOpacity 
                  style={[styles.quickActionCard, styles.demoCard]}
                  onPress={() => handleMenuOption('contractorSearch')}
                >
                  <Text style={styles.quickActionIcon}>🎯</Text>
                  <View style={styles.quickActionContent}>
                    <Text style={styles.quickActionTitle}>AI Contractor Search (DEMO)</Text>
                    <Text style={styles.quickActionDescription}>
                      Search contractors with AI matching algorithm
                    </Text>
                  </View>
                </TouchableOpacity>
              )}

              {viewMode === 'homeowner' && (
                <TouchableOpacity 
                  style={[styles.quickActionCard, styles.demoCard]}
                  onPress={() => handleMenuOption('estimateList')}
                >
                  <Text style={styles.quickActionIcon}>💰</Text>
                  <View style={styles.quickActionContent}>
                    <Text style={styles.quickActionTitle}>View Estimates (DEMO)</Text>
                    <Text style={styles.quickActionDescription}>
                      See sample estimates with detailed breakdowns
                    </Text>
                  </View>
                </TouchableOpacity>
              )}

              {viewMode === 'contractor' && (
                <>
                  <TouchableOpacity 
                    style={styles.quickActionCard}
                    onPress={() => handleMenuOption('findContractors')}
                  >
                    <Text style={styles.quickActionIcon}>🔍</Text>
                    <View style={styles.quickActionContent}>
                      <Text style={styles.quickActionTitle}>Browse Available Projects</Text>
                      <Text style={styles.quickActionDescription}>
                        View projects that match your expertise
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.quickActionCard}
                    onPress={() => handleMenuOption('projectDetails')}
                  >
                    <Text style={styles.quickActionIcon}>📊</Text>
                    <View style={styles.quickActionContent}>
                      <Text style={styles.quickActionTitle}>My Active Projects</Text>
                      <Text style={styles.quickActionDescription}>
                        Manage ongoing jobs and client communications
                      </Text>
                    </View>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </ScrollView>
        </ImageBackground>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
  },
  header: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(212, 175, 55, 0.3)',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  backButtonTop: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    borderRadius: 8,
  },
  backButtonTopText: {
    fontSize: 16,
    color: '#0f172a',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  menuButton: {
    padding: 8,
    marginLeft: 12,
  },
  menuIcon: {
    width: 24,
    gap: 4,
  },
  menuLine: {
    width: 24,
    height: 3,
    backgroundColor: '#D4AF37',
    borderRadius: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  menuDropdown: {
    backgroundColor: 'rgba(30, 41, 59, 0.98)',
    marginTop: 60,
    marginRight: 20,
    borderRadius: 12,
    minWidth: 220,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  menuItemIcon: {
    fontSize: 20,
  },
  menuItemText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
  logoutMenuItemText: {
    fontSize: 16,
    color: '#fca5a5',
    fontWeight: '700',
  },
  menuDivider: {
    height: 1,
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    marginHorizontal: 12,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#D4AF37',
    letterSpacing: -0.3,
  },
  addButton: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  addButtonText: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '700',
  },
  addressCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    padding: 18,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  primaryAddressCard: {
    borderWidth: 2,
    borderColor: '#D4AF37',
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  addressTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  addressName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  primaryBadge: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  primaryBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: 0.5,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusInProgress: {
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
  },
  statusPending: {
    backgroundColor: 'rgba(251, 191, 36, 0.3)',
  },
  statusCompleted: {
    backgroundColor: 'rgba(16, 185, 129, 0.3)',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  addressStreet: {
    fontSize: 15,
    color: '#e2e8f0',
    marginBottom: 4,
  },
  addressCity: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 12,
  },
  projectStatusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 175, 55, 0.2)',
    gap: 8,
  },
  projectStatusIcon: {
    fontSize: 16,
  },
  projectStatusText: {
    fontSize: 13,
    color: '#cbd5e1',
    flex: 1,
  },
  viewDetailsText: {
    fontSize: 12,
    color: '#D4AF37',
    fontWeight: '600',
  },
  quickActionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  quickActionIcon: {
    fontSize: 32,
  },
  quickActionContent: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  quickActionDescription: {
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 18,
  },
  viewModeToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#D4AF37',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
  },
  toggleTextActive: {
    color: '#0f172a',
  },
  addAddressModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  addAddressModal: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  addAddressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  addAddressTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
  },
  addAddressClose: {
    fontSize: 28,
    color: '#6b7280',
    fontWeight: '300',
  },
  addAddressForm: {
    padding: 20,
  },
  addAddressLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 12,
  },
  addAddressInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: '#1f2937',
  },
  addAddressRow: {
    flexDirection: 'row',
    gap: 12,
  },
  addAddressHalf: {
    flex: 1,
  },
  addAddressToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  addAddressSubtext: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  addAddressActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  addAddressCancelButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  addAddressCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  addAddressSaveButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  addAddressSaveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  projectBanner: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 2,
    borderColor: '#667eea',
  },
  projectBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  projectBannerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  projectBannerIcon: {
    fontSize: 32,
  },
  projectBannerLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  projectBannerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 2,
  },
  projectBannerSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  projectBannerDetails: {
    fontSize: 13,
    color: '#64748b',
  },
  projectBannerRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  projectBannerChange: {
    fontSize: 13,
    color: '#667eea',
    fontWeight: '600',
  },
  projectBannerArrow: {
    fontSize: 24,
    color: '#667eea',
    fontWeight: '600',
  },
  welcomeCard: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#D4AF37',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 15,
    color: '#cbd5e1',
    lineHeight: 22,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  categoryTile: {
    width: '48%',
    aspectRatio: 1,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  categoryImageBg: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  categoryOverlay: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  categorySubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  infoCard: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    alignItems: 'center',
  },
  infoIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3b82f6',
    marginBottom: 8,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 20,
  },
  demoCard: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 2,
    borderColor: '#D4AF37',
    borderStyle: 'dashed',
  },
});
