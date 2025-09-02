import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Switch,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUXCamContext } from '../context/UXCamContext';

interface UXCamPrivacyControlsProps {
  showIcon?: boolean;
  showModal?: boolean;
  onPrivacyChange?: (enabled: boolean) => void;
}

const UXCamPrivacyControls: React.FC<UXCamPrivacyControlsProps> = ({
  showIcon = true,
  showModal = false,
  onPrivacyChange,
}) => {
  const [isOptedOut, setIsOptedOut] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const { isEnabled, optIn, optOut, isOptedOut: checkOptedOut } = useUXCamContext();

  useEffect(() => {
    const checkOptOutStatus = async () => {
      try {
        const optedOut = await checkOptedOut();
        setIsOptedOut(optedOut);
      } catch (error) {
        console.error('Failed to check opt out status:', error);
      }
    };

    checkOptOutStatus();
  }, [checkOptedOut]);

  const handlePrivacyToggle = async (enabled: boolean) => {
    try {
      if (enabled) {
        optIn();
        setIsOptedOut(false);
      } else {
        optOut();
        setIsOptedOut(true);
      }
      
      onPrivacyChange?.(enabled);
    } catch (error) {
      console.error('Failed to toggle privacy setting:', error);
      Alert.alert('Error', 'Failed to update privacy settings');
    }
  };

  const showPrivacyInfo = () => {
    if (showModal) {
      setShowPrivacyModal(true);
    } else {
      Alert.alert(
        'UXCam Privacy',
        'UXCam helps us improve the app by recording how you use it. We respect your privacy and never record sensitive information like passwords or personal data. You can disable this feature at any time.',
        [
          { text: 'OK', style: 'default' },
          { 
            text: 'Learn More', 
            onPress: () => {
              // You can add a link to your privacy policy here
              console.log('Navigate to privacy policy');
            }
          }
        ]
      );
    }
  };

  const PrivacyModal = () => (
    <Modal
      visible={showPrivacyModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowPrivacyModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Privacy Settings</Text>
            <TouchableOpacity
              onPress={() => setShowPrivacyModal(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.modalDescription}>
            UXCam helps us improve the app by recording how you use it. We respect your privacy and never record sensitive information like passwords or personal data.
          </Text>
          
          <View style={styles.privacyOption}>
            <View style={styles.privacyOptionText}>
              <Text style={styles.privacyOptionTitle}>Enable Usage Analytics</Text>
              <Text style={styles.privacyOptionSubtitle}>
                Help us improve the app by allowing anonymous usage tracking
              </Text>
            </View>
            <Switch
              value={!isOptedOut && isEnabled}
              onValueChange={handlePrivacyToggle}
              trackColor={{ false: '#e0e0e0', true: '#007AFF' }}
              thumbColor={!isOptedOut && isEnabled ? '#fff' : '#f4f3f4'}
            />
          </View>
          
          <TouchableOpacity
            style={styles.learnMoreButton}
            onPress={() => {
              setShowPrivacyModal(false);
              // Navigate to privacy policy
              console.log('Navigate to privacy policy');
            }}
          >
            <Text style={styles.learnMoreText}>Learn More About Privacy</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.closeModalButton}
            onPress={() => setShowPrivacyModal(false)}
          >
            <Text style={styles.closeModalText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  if (showIcon) {
    return (
      <>
        <TouchableOpacity
          style={styles.iconContainer}
          onPress={showPrivacyInfo}
        >
          <Ionicons
            name={!isOptedOut && isEnabled ? 'eye' : 'eye-off'}
            size={20}
            color={!isOptedOut && isEnabled ? '#007AFF' : '#666'}
          />
        </TouchableOpacity>
        {showModal && <PrivacyModal />}
      </>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.privacyRow}>
        <View style={styles.privacyInfo}>
          <Text style={styles.privacyTitle}>Usage Analytics</Text>
          <Text style={styles.privacySubtitle}>
            Help us improve the app by allowing anonymous usage tracking
          </Text>
        </View>
        <Switch
          value={!isOptedOut && isEnabled}
          onValueChange={handlePrivacyToggle}
          trackColor={{ false: '#e0e0e0', true: '#007AFF' }}
          thumbColor={!isOptedOut && isEnabled ? '#fff' : '#f4f3f4'}
        />
      </View>
      
      <TouchableOpacity
        style={styles.infoButton}
        onPress={showPrivacyInfo}
      >
        <Text style={styles.infoText}>Learn More</Text>
        <Ionicons name="chevron-forward" size={16} color="#007AFF" />
      </TouchableOpacity>
      
      {showModal && <PrivacyModal />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  privacyInfo: {
    flex: 1,
    marginRight: 16,
  },
  privacyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  privacySubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  infoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  iconContainer: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    margin: 20,
    maxWidth: 400,
    width: '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  modalDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 24,
  },
  privacyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  privacyOptionText: {
    flex: 1,
    marginRight: 16,
  },
  privacyOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  privacyOptionSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  learnMoreButton: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  learnMoreText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    textAlign: 'center',
  },
  closeModalButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
  },
  closeModalText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default UXCamPrivacyControls;
