import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import * as Animatable from 'react-native-animatable';

const Card = ({
  children,
  style,
  onPress,
  animation = 'fadeIn',
  duration = 400,
  delay = 0,
  shadow = true,
}) => {
  const { theme } = useTheme();
  
  const cardContent = (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.cardBackground,
          ...(shadow && {
            shadowColor: theme.cardShadow,
            elevation: 5,
          }),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
  
  // If animation is provided, wrap with Animatable
  const animatedCard = (
    <Animatable.View
      animation={animation}
      duration={duration}
      delay={delay}
      style={styles.animationWrapper}
    >
      {onPress ? (
        <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
          {cardContent}
        </TouchableOpacity>
      ) : (
        cardContent
      )}
    </Animatable.View>
  );
  
  // If no animation, or onPress is provided without animation
  if (!animation) {
    return onPress ? (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {cardContent}
      </TouchableOpacity>
    ) : (
      cardContent
    );
  }
  
  return animatedCard;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    padding: 16,
    marginVertical: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
  },
  animationWrapper: {
    width: '100%',
  },
});

export default Card; 