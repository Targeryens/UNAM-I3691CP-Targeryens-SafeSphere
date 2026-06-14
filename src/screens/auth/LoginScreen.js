import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import colors from '../../styles/colors';

const logo = require('../../../assets/Copilot_20260608_111229 (1).png');

function getInitials(name, username) {
  const source = name.trim() || username.trim() || 'User';
  const words = source.split(/\s+/).filter(Boolean);
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }
  return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

export default function LoginScreen({ auth }) {
  const [mode, setMode] = useState('login');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const initials = getInitials(fullName, username);

  function updateField(setter, value) {
    setter(value);
    if (message) {
      setMessage('');
    }
  }

  function updateUsername(value) {
    updateField(setUsername, value.trim().toLowerCase());
  }

  function switchMode(nextMode) {
    setMode(nextMode);
    setMessage('');
    setPassword('');
    setShowPassword(false);
    setIsResetMode(false);
  }

  async function handleSubmit() {
    setMessage('');
    setIsSubmitting(true);

    if (!auth.isFirebaseConfigured) {
      setMessage('Firebase is not configured. Please set Expo Firebase env values to sign in.');
      setIsSubmitting(false);
      return;
    }

    if (mode === 'register') {
      const cleanUsername = username.trim().toLowerCase();
      const cleanEmail = email.trim().toLowerCase();

      if (!fullName.trim() || !cleanUsername || !cleanEmail || !password.trim()) {
        setMessage('Please complete your name, username, email, and password.');
        setIsSubmitting(false);
        return;
      }

      if (password.length < 6) {
        setMessage('Password must be at least 6 characters.');
        setIsSubmitting(false);
        return;
      }

      const result = await auth.registerAccount({
        fullName: fullName.trim(),
        username: cleanUsername,
        email: cleanEmail,
        password,
        initials,
      });

      if (!result.ok) {
        setMessage(result.message);
        setIsSubmitting(false);
      }
      return;
    }

    const cleanIdentifier = identifier.trim();

    if (!cleanIdentifier || !password.trim()) {
      setMessage('Enter your username or email and password.');
      setIsSubmitting(false);
      return;
    }

    const result = await auth.loginAccount({ identifier: cleanIdentifier, password });
    if (!result.ok) {
      setMessage(result.message);
      setIsSubmitting(false);
    }
  }

  function openResetMode() {
    setMessage('');
    setIsResetMode(true);
    if (identifier.includes('@')) {
      setResetEmail(identifier.trim().toLowerCase());
    }
  }

  async function handlePasswordReset() {
    setMessage('');

    if (!auth.isFirebaseConfigured) {
      setMessage('Firebase is not configured. Please set Expo Firebase env values to reset your password.');
      return;
    }

    setIsResettingPassword(true);
    const result = await auth.resetPassword(resetEmail);
    setMessage(result.message);
    setIsResettingPassword(false);

    if (result.ok) {
      setIsResetMode(false);
      setResetEmail('');
      setPassword('');
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.brand}>
          <View style={styles.logoCircle}>
            <Image source={logo} style={styles.logoImage} resizeMode="contain" />
          </View>
          <Text style={styles.title}>Safe Sphere</Text>
          <Text style={styles.subtitle}>Safety Hazard Awareness & Prevention</Text>
          <View style={styles.trainingPill}>
            <View style={styles.pillDot} />
            <Text style={styles.trainingText}>INDUSTRIAL SAFETY TRAINING</Text>
          </View>
        </View>

        <View style={styles.authWrap}>
          <View style={styles.switcher}>
            <Pressable
              onPress={() => switchMode('login')}
              style={[styles.switchButton, mode === 'login' && styles.switchActive]}
            >
              <Text style={[styles.switchText, mode === 'login' && styles.switchTextActive]}>Login</Text>
            </Pressable>
            <Pressable
              onPress={() => switchMode('register')}
              style={[styles.switchButton, mode === 'register' && styles.switchActive]}
            >
              <Text style={[styles.switchText, mode === 'register' && styles.switchTextActive]}>Register</Text>
            </Pressable>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>{mode === 'login' ? 'Welcome Back' : 'Create Account'}</Text>
            <Text style={styles.cardSubtitle}>
              {mode === 'login' ? 'Sign in to continue your safety training' : 'Register to begin your safety training'}
            </Text>
            {!auth.isFirebaseConfigured ? (
              <Text style={styles.configError}>
                {auth.firebaseConfigError || 'Firebase is not configured. Sign-in requires Expo Firebase env values.'}
              </Text>
            ) : null}

            {mode === 'register' ? (
              <View>
                <View style={styles.profileRow}>
                  <View style={styles.photoSlot}>
                    <Text style={styles.photoInitials}>{initials}</Text>
                  </View>
                  <View style={styles.profileCopy}>
                    <Text style={styles.profileTitle}>Training Profile</Text>
                    <Text style={styles.profileHint}>Initials are shown until a photo is added</Text>
                  </View>
                </View>

                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  value={fullName}
                  onChangeText={(value) => updateField(setFullName, value)}
                  placeholder="Enter your full name"
                  placeholderTextColor="#8c8f99"
                  style={styles.input}
                  autoCapitalize="words"
                />

                <Text style={styles.label}>Username</Text>
                <TextInput
                  value={username}
                  onChangeText={updateUsername}
                  placeholder="Choose a username"
                  placeholderTextColor="#8c8f99"
                  style={styles.input}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            ) : null}

            {mode === 'login' ? (
              <>
                <Text style={styles.label}>Username or Email</Text>
                <TextInput
                  value={identifier}
                  onChangeText={(value) => updateField(setIdentifier, value)}
                  placeholder="username or your.email@example.com"
                  placeholderTextColor="#8c8f99"
                  style={styles.input}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </>
            ) : (
              <>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  value={email}
                  onChangeText={(value) => updateField(setEmail, value.trim().toLowerCase())}
                  placeholder="your.email@example.com"
                  placeholderTextColor="#8c8f99"
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </>
            )}

            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                value={password}
                onChangeText={(value) => updateField(setPassword, value)}
                placeholder="Enter your password"
                placeholderTextColor="#8c8f99"
                style={[styles.input, styles.passwordInput]}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete={mode === 'login' ? 'password' : 'new-password'}
                textContentType={mode === 'login' ? 'password' : 'newPassword'}
              />
              <Pressable
                onPress={() => setShowPassword((current) => !current)}
                style={styles.passwordToggle}
                accessibilityRole="button"
                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
              >
                <Text style={styles.passwordToggleText}>{showPassword ? 'Hide' : 'Show'}</Text>
              </Pressable>
            </View>

            {mode === 'login' && !isResetMode ? (
              <Pressable onPress={openResetMode} style={styles.forgotButton}>
                <Text style={styles.forgotText}>Forgot password?</Text>
              </Pressable>
            ) : null}

            {mode === 'login' && isResetMode ? (
              <View style={styles.resetPanel}>
                <Text style={styles.resetTitle}>Reset Password</Text>
                <Text style={styles.label}>Account Email</Text>
                <TextInput
                  value={resetEmail}
                  onChangeText={(value) => updateField(setResetEmail, value.trim().toLowerCase())}
                  placeholder="your.email@example.com"
                  placeholderTextColor="#8c8f99"
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  textContentType="emailAddress"
                />
                <View style={styles.resetActions}>
                  <Pressable
                    onPress={() => {
                      setIsResetMode(false);
                      setMessage('');
                    }}
                    style={[styles.resetButton, styles.resetCancelButton]}
                  >
                    <Text style={[styles.resetButtonText, styles.resetCancelText]}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    onPress={handlePasswordReset}
                    disabled={isResettingPassword || !auth.isFirebaseConfigured}
                    style={[
                      styles.resetButton,
                      styles.resetSendButton,
                      (isResettingPassword || !auth.isFirebaseConfigured) && styles.submitDisabled,
                    ]}
                  >
                    <Text style={styles.resetButtonText}>
                      {isResettingPassword ? 'Sending...' : 'Send Reset Link'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            ) : null}

            {message ? <Text style={styles.message}>{message}</Text> : null}

            <Pressable
              style={[styles.submitButton, (isSubmitting || !auth.isFirebaseConfigured) && styles.submitDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting || !auth.isFirebaseConfigured}
            >
              <Text style={styles.submitText}>
                {isSubmitting
                  ? 'Please wait...'
                  : !auth.isFirebaseConfigured
                  ? 'Firebase Required'
                  : mode === 'login'
                  ? 'Sign In'
                  : 'Register'}
              </Text>
            </Pressable>
          </View>

          <View style={styles.notice}>
            <Text style={styles.noticeText}>
              <Text style={styles.noticeStrong}>IMPORTANT:</Text>
              {' This app does not replace official workplace certification or on-site safety protocols'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.navy,
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 44,
    backgroundColor: colors.navy,
  },
  brand: {
    alignItems: 'center',
    marginBottom: 34,
  },
  logoCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    shadowColor: colors.navy,
    shadowOpacity: 0.15,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  logoImage: {
    width: 120,
    height: 120,
  },
  title: {
    color: '#ffffff',
    fontSize: 50,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    color: '#f2d4c8',
    fontSize: 19,
    textAlign: 'center',
    marginTop: 10,
  },
  trainingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(244, 207, 69, 0.55)',
    backgroundColor: 'rgba(170, 130, 36, 0.45)',
    paddingHorizontal: 22,
    paddingVertical: 10,
    marginTop: 24,
  },
  pillDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.warning,
  },
  trainingText: {
    color: '#fff0b3',
    fontWeight: '800',
    letterSpacing: 0,
    fontSize: 14,
  },
  authWrap: {
    width: '100%',
    maxWidth: 520,
  },
  switcher: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 12,
  },
  switchButton: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.orange,
    borderRadius: 12,
    opacity: 0.82,
  },
  switchActive: {
    opacity: 1,
  },
  switchText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  switchTextActive: {
    color: '#ffffff',
  },
  card: {
    backgroundColor: '#f8f8fb',
    borderRadius: 12,
    padding: 30,
    shadowColor: colors.shadow,
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  cardTitle: {
    color: colors.ink,
    fontSize: 27,
    fontWeight: '900',
    marginBottom: 10,
  },
  cardSubtitle: {
    color: colors.muted,
    fontSize: 17,
    marginBottom: 26,
  },
  configError: {
    color: colors.amber,
    fontSize: 12,
    fontWeight: '700',
    marginTop: -16,
    marginBottom: 22,
  },
  label: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 8,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: '#edf0f4',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 18,
  },
  photoSlot: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoInitials: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
  },
  profileCopy: {
    flex: 1,
  },
  profileTitle: {
    color: colors.ink,
    fontWeight: '900',
    fontSize: 15,
  },
  profileHint: {
    color: colors.muted,
    marginTop: 4,
    fontSize: 13,
  },
  input: {
    minHeight: 48,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#edf0f4',
    paddingHorizontal: 14,
    fontSize: 15,
    marginBottom: 18,
    color: colors.ink,
  },
  passwordRow: {
    position: 'relative',
    marginBottom: 10,
  },
  passwordInput: {
    marginBottom: 0,
    paddingRight: 82,
  },
  passwordToggle: {
    position: 'absolute',
    top: 7,
    right: 8,
    minHeight: 34,
    minWidth: 62,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f3f6',
    borderWidth: 1,
    borderColor: '#e3e6ec',
    paddingHorizontal: 10,
  },
  passwordToggleText: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '900',
  },
  forgotButton: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  forgotText: {
    color: colors.red,
    fontSize: 13,
    fontWeight: '900',
  },
  resetPanel: {
    borderTopWidth: 1,
    borderTopColor: '#e8ebf0',
    paddingTop: 16,
    marginBottom: 14,
  },
  resetTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 14,
  },
  resetActions: {
    flexDirection: 'row',
    gap: 10,
  },
  resetButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  resetCancelButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e3e6ec',
  },
  resetSendButton: {
    backgroundColor: colors.red,
  },
  resetButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'center',
  },
  resetCancelText: {
    color: colors.ink,
  },
  message: {
    color: colors.red,
    fontWeight: '700',
    marginTop: -4,
    marginBottom: 12,
  },
  submitButton: {
    minHeight: 58,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.red,
    marginTop: 10,
    shadowColor: colors.red,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  submitDisabled: {
    opacity: 0.65,
  },
  submitText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
  },
  notice: {
    marginTop: 28,
    borderWidth: 2,
    borderColor: 'rgba(244, 207, 69, 0.45)',
    backgroundColor: 'rgba(244, 207, 69, 0.12)',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 18,
  },
  noticeText: {
    color: '#ffe6a3',
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 24,
  },
  noticeStrong: {
    color: '#ffe076',
    fontWeight: '900',
  },
});
