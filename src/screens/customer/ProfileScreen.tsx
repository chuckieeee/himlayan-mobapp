import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../navigation/types";
import { AuthService } from "@services/AuthService";
import { colors, spacing, typography } from "@styles/theme";
import { commonStyles } from "@styles/commonStyles";

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface ProfileData {
  fullName?: string;
  email?: string;
  phone?: string;
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

      const currentUser = await AuthService.getCurrentUser();

      if (!currentUser) {
        setLoading(false);
        return;
      }

      console.log("Logged in user:", currentUser);

      const response = await fetch(
        `https://himlayangpilipino.com/api/profile?email=${currentUser.email}`
      );

      const profile = await response.json();

      console.log("Profile API response:", profile);

      const fullName =
        `${profile.contact_first_name ?? ""} ` +
        `${profile.contact_middle_initial ? profile.contact_middle_initial + " " : ""}` +
        `${profile.contact_last_name ?? ""}`;

      setUser({
        fullName: fullName.trim(),
        email: currentUser.email,
        phone: profile.contact_phone,
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
        <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
        >
        <Text style={styles.backButtonText}>
        ← Back
        </Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          My Profile
        </Text>

      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>

        <View style={commonStyles.card}>

          <ProfileItem label="Full Name" value={user?.fullName} />
          <ProfileItem label="Email" value={user?.email} />
          <ProfileItem label="Contact Number" value={user?.phone} />

        </View>

        <Text style={styles.note}>
          Profile information can only be updated through the website.
        </Text>

      </ScrollView>

    </View>

  );

};

const ProfileItem = ({ label, value }: { label: string; value?: string }) => {

  return (

    <View style={styles.row}>

      <Text style={styles.label}>
        {label}
      </Text>

      <Text style={styles.value}>
        {value ? value : "Not available"}
      </Text>

    </View>

  );

};

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

  scrollContent: {
    padding: spacing.md,
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
  backButton: {
  marginBottom: spacing.sm,
},
    backButtonText: {
    ...typography.body1,
    color: colors.surface,
    },

});

export default ProfileScreen;