import { StyleSheet } from 'react-native';
import { Platform } from 'react-native';

const dynamicStyles = (appStyles, colorScheme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: appStyles.colorSet[colorScheme].mainThemeBackgroundColor,
    },
    logo: {
      width: 370,
      height: 200,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
      marginTop: -100,
    },
    logoImage: {
      width: '80%',
      height: '80%',
      resizeMode: 'contain',
      // tintColor: appStyles.colorSet[colorScheme].mainThemeForegroundColor,
    },
    title: {
      fontSize: 30,
      fontWeight: 'normal',
      color: appStyles.colorSet[colorScheme].mainThemeForegroundColor,
      marginTop: 20,
      marginBottom: 20,
      textAlign: 'center',
    },
    caption: {
      fontSize: 16,
      paddingHorizontal: 50,
      marginBottom: 20,
      textAlign: 'center',
      color: appStyles.colorSet[colorScheme].mainTextColor,
    },
    loginContainer: {
      width: '70%',
      backgroundColor: appStyles.colorSet[colorScheme].mainThemeForegroundColor,
      borderRadius: 30,
      padding: 20,
      marginTop: 30,
      alignSelf: 'center',
      justifyContent: 'center',
      // height: 48,
    },
    loginText: {
      fontWeight: 'bold',
      color: appStyles.colorSet[colorScheme].mainThemeBackgroundColor,
    },
    signupContainer: {
      justifyContent: 'center',
      width: '70%',
      backgroundColor: appStyles.colorSet[colorScheme].mainThemeBackgroundColor,
      borderRadius: 30,
      borderWidth: Platform.OS === 'ios' ? 0.5 : 1.0,
      borderColor: appStyles.colorSet[colorScheme].mainThemeForegroundColor,
      padding: 20,
      marginTop: 20,
      alignSelf: 'center',
      // height: 45,
    },
    signupText: {
      fontWeight: 'bold',
      color: appStyles.colorSet[colorScheme].mainThemeForegroundColor,
    },
    dismissButton: {
      position: 'absolute',
      top: 36,
      right: 24,
    }
  });
};

export default dynamicStyles;
