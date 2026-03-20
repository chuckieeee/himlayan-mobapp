import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Image
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { RootStackParamList } from "../../navigation/types";
import { STORAGE_KEYS, API_BASE_URL } from "../../config/api";
import { colors, spacing, typography } from "@styles/theme";
import { commonStyles } from "@styles/commonStyles";
import api from "@services/api";

type NavigationProp = any;

interface ProfileData {
  fullName?: string;
  email?: string;
  phone?: string;
  avatar?: string;
}

interface Plot {
  id: number;
  plot_number: string;
  section: string;
}

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const [user, setUser] = useState<ProfileData | null>(null);
  const [plotCount, setPlotCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

      const response = await fetch(`${API_BASE_URL}/user`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const resData = await response.json();
      const userData = resData.data;
      console.log("USER DATA:", userData);
      // ⚠️ Handle token expiration (401 Unauthorized)
      if (!response.ok) {
        if (response.status === 401) {
          console.log('⚠️ Token expired - clearing auth');
          await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
          await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        }
        throw new Error(resData.message || 'Failed to load profile');
      }

      setUser({
        fullName: userData.name,
        email: userData.email,
        phone: userData.phone || userData.phone_number || userData.contact_number || userData.mobile,
        avatar: userData.avatar
          ? `https://himlayangpilipino.com/storage/${userData.avatar}`
          : null,
      });
      // Load user's plots
      loadMyPlots();

    } catch (error) {
      console.log("Profile load error:", error);
    }

    setLoading(false);
  };

  const loadMyPlots = async () => {
    try {
      const response = await api.get('/member/my-plots');
      if (response.success) {
        const plots = response.data || [];
        setPlotCount(plots.length);
        
        // Get phone from first burial record's contact info
        if (plots.length > 0) {
          const firstPlot = plots[0];
          
          if (firstPlot.burial_record?.contact_phone) {
            setUser(prevUser => prevUser ? { ...prevUser, phone: firstPlot.burial_record.contact_phone } : prevUser);
          }
        }
      }
    } catch (err) {
      console.log('No plots found or API not ready');
      setPlotCount(0);
    }
  };

  if (loading) {
    return (
      <View style={commonStyles.centeredContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={commonStyles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* PROFILE IMAGE */}
        <View style={styles.avatarContainer}>
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {user?.fullName?.charAt(0)}
              </Text>
            </View>
          )}
        </View>

        {/* USER INFO */}
        <View style={commonStyles.card}>
          <ProfileItem label="Full Name" value={user?.fullName} />
          <ProfileItem label="Email" value={user?.email} />
          <ProfileItem label="Contact Number" value={user?.phone} />
        </View>

        {/* PLOTS BOX */}
        <TouchableOpacity 
          style={styles.plotCard}
          onPress={() => navigation.navigate('MyPlots')}
          activeOpacity={0.7}
        >
          <Text style={styles.plotTitle}>Owned Plots</Text>
          <Text style={styles.plotValue}>
            {plotCount}
          </Text>
          <Text style={styles.plotTapText}>Tap to view details →</Text>
        </TouchableOpacity>

        <Text style={styles.note}>
          Profile information can only be updated through the website.
        </Text>

      </ScrollView>
    </View>
  );
};

const ProfileItem = ({ label, value }: { label: string; value?: string }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value || "Not available"}</Text>
  </View>
);

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    paddingTop: 50,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.surface,
  },
  backButton: {
    color: colors.surface,
    marginBottom: spacing.sm,
  },
  scrollContent: {
    padding: spacing.md,
  },

  avatarContainer: {
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 40,
    fontWeight: "bold",
  },

  plotCard: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 12,
    alignItems: "center",
    elevation: 3,
  },
  plotTitle: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  plotValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.primary,
  },

  plotTapText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
    marginTop: spacing.sm,
  },

  row: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  value: {
    ...typography.body1,
    fontWeight: "600",
    color: colors.text,
  },

  note: {
    marginTop: spacing.md,
    textAlign: "center",
    color: colors.textSecondary,
  },
});

export default ProfileScreen;