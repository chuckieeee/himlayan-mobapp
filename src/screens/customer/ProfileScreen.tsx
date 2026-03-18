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

type NavigationProp = any;

interface ProfileData {
  fullName?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  plots?: number;
}

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const [user, setUser] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
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
      console.log(resData);
      const userData = resData.data;

      setUser({
        fullName: userData.name,
        email: userData.email,
        phone: userData.phone,
        avatar: userData.avatar,
        plots: userData.plots || 0, // optional
      });

    } catch (error) {
      console.log("Profile load error:", error);
    }

    setLoading(false);
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
        <View style={styles.plotCard}>
          <Text style={styles.plotTitle}>Owned Plots</Text>
          <Text style={styles.plotValue}>
            {user?.plots ?? 0}
          </Text>
        </View>

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