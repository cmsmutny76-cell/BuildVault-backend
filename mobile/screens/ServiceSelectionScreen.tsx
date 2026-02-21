import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
} from 'react-native';

interface ServiceSelectionScreenProps {
  onBack: (selectedServices: string[]) => void;
  initialSelectedServices?: string[];
}

interface ServiceCategory {
  name: string;
  icon: string;
  services: string[];
}

const serviceCategories: ServiceCategory[] = [
  {
    name: 'General Construction',
    icon: '🏗️',
    services: [
      'Full Project Management',
      'New Construction',
      'Additions & Extensions',
      'Structural Repairs',
      'Foundation Work',
      'Demolition',
      'Framing',
      'General Contracting',
    ],
  },
  {
    name: 'Plumbing',
    icon: '🚰',
    services: [
      'Pipe Installation & Repair',
      'Drain Cleaning',
      'Water Heater Installation',
      'Bathroom Plumbing',
      'Kitchen Plumbing',
      'Sewer Line Repair',
      'Gas Line Installation',
      'Fixture Installation',
      'Emergency Plumbing',
    ],
  },
  {
    name: 'Electrical',
    icon: '⚡',
    services: [
      'Electrical Wiring',
      'Panel Upgrades',
      'Lighting Installation',
      'Outlet & Switch Installation',
      'Generator Installation',
      'Smart Home Wiring',
      'EV Charger Installation',
      'Electrical Inspection',
      'Emergency Electrical',
    ],
  },
  {
    name: 'HVAC',
    icon: '❄️',
    services: [
      'AC Installation',
      'Heating Installation',
      'HVAC Repair',
      'Duct Cleaning',
      'Duct Installation',
      'Thermostat Installation',
      'Air Quality Systems',
      'HVAC Maintenance',
    ],
  },
  {
    name: 'Roofing',
    icon: '🏠',
    services: [
      'Roof Replacement',
      'Roof Repair',
      'Roof Inspection',
      'Gutter Installation',
      'Gutter Cleaning',
      'Skylight Installation',
      'Roof Ventilation',
      'Emergency Roof Repair',
    ],
  },
  {
    name: 'Flooring',
    icon: '🪵',
    services: [
      'Hardwood Flooring',
      'Tile Installation',
      'Carpet Installation',
      'Laminate Flooring',
      'Vinyl Flooring',
      'Floor Refinishing',
      'Floor Repair',
      'Concrete Flooring',
    ],
  },
  {
    name: 'Painting',
    icon: '🎨',
    services: [
      'Interior Painting',
      'Exterior Painting',
      'Cabinet Painting',
      'Deck Staining',
      'Pressure Washing',
      'Drywall Repair',
      'Wallpaper Installation',
      'Wallpaper Removal',
    ],
  },
  {
    name: 'Kitchen & Bath',
    icon: '🛁',
    services: [
      'Kitchen Remodel',
      'Bathroom Remodel',
      'Cabinet Installation',
      'Countertop Installation',
      'Backsplash Installation',
      'Shower Installation',
      'Bathtub Installation',
      'Vanity Installation',
    ],
  },
  {
    name: 'Landscaping',
    icon: '🌳',
    services: [
      'Lawn Maintenance',
      'Irrigation Systems',
      'Hardscaping',
      'Deck Building',
      'Patio Installation',
      'Fence Installation',
      'Tree Services',
      'Landscape Design',
      'Retaining Walls',
    ],
  },
  {
    name: 'Windows & Doors',
    icon: '🚪',
    services: [
      'Window Installation',
      'Window Replacement',
      'Door Installation',
      'Door Repair',
      'Garage Door Installation',
      'Sliding Door Installation',
      'Storm Door Installation',
      'Window Repair',
    ],
  },
  {
    name: 'Masonry',
    icon: '🧱',
    services: [
      'Brick Work',
      'Stone Work',
      'Concrete Work',
      'Chimney Repair',
      'Fireplace Installation',
      'Retaining Walls',
      'Paver Installation',
      'Stucco Work',
    ],
  },
  {
    name: 'Carpentry',
    icon: '🔨',
    services: [
      'Custom Carpentry',
      'Trim Installation',
      'Crown Molding',
      'Built-in Shelving',
      'Closet Systems',
      'Stair Repair',
      'Railing Installation',
      'Wood Repairs',
    ],
  },
  {
    name: 'Insulation',
    icon: '🧊',
    services: [
      'Attic Insulation',
      'Wall Insulation',
      'Crawl Space Insulation',
      'Spray Foam Insulation',
      'Weatherproofing',
      'Air Sealing',
    ],
  },
  {
    name: 'Handyman',
    icon: '🛠️',
    services: [
      'General Repairs',
      'Minor Fixes',
      'Assembly Services',
      'Maintenance',
      'Small Projects',
      'Home Improvements',
    ],
  },
  {
    name: 'Specialty Services',
    icon: '⭐',
    services: [
      'Pool Installation',
      'Home Automation',
      'Security Systems',
      'Home Theater',
      'Solar Panel Installation',
      'Waterproofing',
      'Mold Remediation',
      'Asbestos Removal',
      'Lead Paint Removal',
    ],
  },
];

export default function ServiceSelectionScreen({ onBack, initialSelectedServices = [] }: ServiceSelectionScreenProps) {
  const [selectedServices, setSelectedServices] = useState<string[]>(initialSelectedServices);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['General Construction']);

  // Get all services from all categories
  const allServices = serviceCategories.flatMap(category => category.services);
  const isAllSelected = allServices.length > 0 && allServices.every(service => selectedServices.includes(service));

  const toggleService = (service: string) => {
    if (selectedServices.includes(service)) {
      setSelectedServices(selectedServices.filter(s => s !== service));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  const toggleSelectAll = () => {
    if (isAllSelected) {
      // Deselect all
      setSelectedServices([]);
    } else {
      // Select all
      setSelectedServices([...allServices]);
    }
  };

  const toggleCategory = (categoryName: string) => {
    if (expandedCategories.includes(categoryName)) {
      setExpandedCategories(expandedCategories.filter(c => c !== categoryName));
    } else {
      setExpandedCategories([...expandedCategories, categoryName]);
    }
  };

  const handleDone = () => {
    onBack(selectedServices);
  };

  const filteredCategories = serviceCategories.map(category => ({
    ...category,
    services: category.services.filter(service =>
      service.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(category => category.services.length > 0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleDone} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Services</Text>
        <TouchableOpacity onPress={handleDone} style={styles.doneButton}>
          <Text style={styles.doneButtonText}>Done ({selectedServices.length})</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search services..."
          placeholderTextColor="#94a3b8"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView style={styles.content}>
        {/* Full Project / Select All Tile */}
        <View style={styles.fullProjectContainer}>
          <TouchableOpacity
            style={[
              styles.fullProjectTile,
              isAllSelected && styles.fullProjectTileSelected,
            ]}
            onPress={toggleSelectAll}
          >
            <View style={styles.fullProjectContent}>
              <Text style={styles.fullProjectIcon}>🏗️</Text>
              <View style={styles.fullProjectTextContainer}>
                <Text style={[
                  styles.fullProjectTitle,
                  isAllSelected && styles.fullProjectTitleSelected,
                ]}>
                  Full Project - All Services
                </Text>
                <Text style={styles.fullProjectSubtitle}>
                  {isAllSelected ? 'All services selected' : 'Select all services at once'}
                </Text>
              </View>
              {isAllSelected && (
                <Text style={styles.fullProjectCheckmark}>✓</Text>
              )}
            </View>
          </TouchableOpacity>
        </View>

        {filteredCategories.map((category) => (
          <View key={category.name} style={styles.categoryContainer}>
            <TouchableOpacity
              style={styles.categoryHeader}
              onPress={() => toggleCategory(category.name)}
            >
              <View style={styles.categoryTitleRow}>
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text style={styles.categoryName}>{category.name}</Text>
              </View>
              <Text style={styles.expandIcon}>
                {expandedCategories.includes(category.name) ? '▼' : '▶'}
              </Text>
            </TouchableOpacity>

            {expandedCategories.includes(category.name) && (
              <View style={styles.servicesContainer}>
                {category.services.map((service) => (
                  <TouchableOpacity
                    key={service}
                    style={[
                      styles.serviceItem,
                      selectedServices.includes(service) && styles.serviceItemSelected,
                    ]}
                    onPress={() => toggleService(service)}
                  >
                    <Text style={[
                      styles.serviceText,
                      selectedServices.includes(service) && styles.serviceTextSelected,
                    ]}>
                      {service}
                    </Text>
                    {selectedServices.includes(service) && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  doneButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  doneButtonText: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    margin: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 16,
    paddingVertical: 12,
  },
  content: {
    flex: 1,
  },
  categoryContainer: {
    marginBottom: 16,
    marginHorizontal: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 64, 175, 0.3)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  categoryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryIcon: {
    fontSize: 24,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  expandIcon: {
    fontSize: 14,
    color: '#D4AF37',
  },
  servicesContainer: {
    marginTop: 8,
    gap: 8,
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  serviceItemSelected: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderColor: '#D4AF37',
  },
  serviceText: {
    fontSize: 15,
    color: '#cbd5e1',
    flex: 1,
  },
  serviceTextSelected: {
    color: '#D4AF37',
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 20,
    color: '#D4AF37',
    fontWeight: '700',
  },
  fullProjectContainer: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  fullProjectTile: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#D4AF37',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  fullProjectTileSelected: {
    backgroundColor: 'rgba(212, 175, 55, 0.3)',
    borderColor: '#D4AF37',
    shadowOpacity: 0.5,
  },
  fullProjectContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  fullProjectIcon: {
    fontSize: 36,
  },
  fullProjectTextContainer: {
    flex: 1,
  },
  fullProjectTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#D4AF37',
    marginBottom: 4,
  },
  fullProjectTitleSelected: {
    color: '#ffffff',
  },
  fullProjectSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
  },
  fullProjectCheckmark: {
    fontSize: 28,
    color: '#D4AF37',
    fontWeight: '700',
  },
});
