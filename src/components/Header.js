import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../context/ThemeContext';

const Header = ({
  title,
  leftIcon,
  rightIcon,
  onLeftPress,
  onRightPress,
  style,
  titleStyle,
}) => {
  const { theme } = useTheme();

  return (
    <View 
      style={[
        styles.container, 
        { backgroundColor: theme.cardBackground },
        style
      ]}
    >
      {leftIcon ? (
        <TouchableOpacity
          style={styles.iconContainer}
          onPress={onLeftPress}
          disabled={!onLeftPress}
        >
          <Icon name={leftIcon} size={24} color={theme.text} />
        </TouchableOpacity>
      ) : (
        <View style={styles.iconPlaceholder} />
      )}

      <Text 
        style={[
          styles.title, 
          { color: theme.text },
          titleStyle
        ]}
        numberOfLines={1}
      >
        {title}
      </Text>

      {rightIcon ? (
        <TouchableOpacity
          style={styles.iconContainer}
          onPress={onRightPress}
          disabled={!onRightPress}
        >
          <Icon name={rightIcon} size={24} color={theme.text} />
        </TouchableOpacity>
      ) : (
        <View style={styles.iconPlaceholder} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    zIndex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  iconPlaceholder: {
    width: 40,
  },
});

export default Header; 