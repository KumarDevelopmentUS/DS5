import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function JoinPage() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const router = useRouter();

  useEffect(() => {
    if (code) {
      // Redirect to the proper match join route
      router.replace(`/match/join/${code}`);
    } else {
      Alert.alert('Error', 'No room code provided');
    }
  }, [code, router]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>🎯</Text>
          <Text style={styles.logoTitle}>DieStats</Text>
        </View>
        
        <Text style={styles.title}>Redirecting...</Text>
        <Text style={styles.subtitle}>Taking you to the join page</Text>
        
        <View style={styles.loadingContainer}>
          <Ionicons name="refresh" size={48} color="#667eea" />
          <Text style={styles.loadingText}>Loading join page...</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: 400,
    alignSelf: 'center',
  },
  logo: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoText: {
    fontSize: 48,
    marginBottom: 10,
  },
  logoTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#667eea',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  loadingContainer: {
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
}); 