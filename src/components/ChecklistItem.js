import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Animatable from 'react-native-animatable';
import { useTheme } from '../context/ThemeContext';

const ChecklistItem = ({
  item,
  onToggle,
  onDelete,
  animation = 'fadeInRight',
  delay = 0,
}) => {
  const { theme } = useTheme();

  const handleToggle = () => {
    onToggle(item.id);
  };

  const handleDelete = () => {
    onDelete(item.id);
  };

  return (
    <Animatable.View
      animation={animation}
      duration={400}
      delay={delay}
      style={styles.container}
    >
      <TouchableOpacity
        onPress={handleToggle}
        style={[
          styles.itemContainer,
          { backgroundColor: theme.cardBackground }
        ]}
        activeOpacity={0.8}
      >
        <Animatable.View
          animation={item.completed ? 'bounceIn' : undefined}
          style={[
            styles.checkbox,
            {
              backgroundColor: item.completed ? theme.primary : 'transparent',
              borderColor: item.completed ? theme.primary : theme.border,
            },
          ]}
        >
          {item.completed && (
            <Icon name="check" size={16} color="#FFFFFF" />
          )}
        </Animatable.View>
        
        <Text
          style={[
            styles.itemText,
            {
              color: theme.text,
              textDecorationLine: item.completed ? 'line-through' : 'none',
              opacity: item.completed ? 0.7 : 1,
            },
          ]}
        >
          {item.text}
        </Text>
        
        <TouchableOpacity
          onPress={handleDelete}
          style={styles.deleteButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="delete-outline" size={20} color={theme.accent} />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemText: {
    flex: 1,
    fontSize: 16,
  },
  deleteButton: {
    padding: 5,
  },
});

export default ChecklistItem;
