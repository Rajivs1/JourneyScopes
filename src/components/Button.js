import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const Button = ({
  title,
  onPress,
  style,
  textStyle,
  disabled = false,
  loading = false,
  variant = 'primary', // primary, secondary, outline
  size = 'medium', // small, medium, large
}) => {
  const { theme } = useTheme();
  
  // Determine background color based on variant and theme
  const getBackgroundColor = () => {
    if (disabled) return '#CCCCCC';
    
    switch (variant) {
      case 'primary':
        return theme.primary;
      case 'secondary':
        return theme.secondary;
      case 'outline':
        return 'transparent';
      default:
        return theme.primary;
    }
  };
  
  // Determine text color based on variant and theme
  const getTextColor = () => {
    if (disabled) return '#888888';
    
    switch (variant) {
      case 'outline':
        return theme.primary;
      default:
        return '#FFFFFF';
    }
  };
  
  // Determine padding based on size
  const getPadding = () => {
    switch (size) {
      case 'small':
        return 8;
      case 'large':
        return 16;
      default:
        return 12;
    }
  };
  
  // Determine border based on variant
  const getBorderStyle = () => {
    return variant === 'outline' ? { borderWidth: 1, borderColor: theme.primary } : {};
  };
  
  return (
    <TouchableOpacity
      style={[
        styles.button,
        { 
          backgroundColor: getBackgroundColor(),
          padding: getPadding(),
          ...getBorderStyle(),
        },
        style
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <Text style={[
          styles.text,
          { color: getTextColor() },
          textStyle
        ]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  text: {
    fontWeight: '600',
    fontSize: 16,
  },
});

export default Button; 