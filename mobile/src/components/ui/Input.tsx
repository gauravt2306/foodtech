'use client';

import { TextInput, View, Text, ViewStyle, TextStyle } from 'react-native';
import { forwardRef, useImperativeHandle, useRef } from 'react';

interface InputProps extends React.ComponentPropsWithoutRef<typeof TextInput> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

interface InputRef {
  focus: () => void;
  blur: () => void;
  clear: () => void;
}

const Input = forwardRef<InputRef, InputProps>(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  style,
  className,
  ...props
}, ref) => {
  const inputRef = useRef<TextInput>(null);

  useImperativeHandle(ref, () => ({
    focus: () => { (inputRef.current as any)?.focus(); },
    blur: () => { (inputRef.current as any)?.blur(); },
    clear: () => { (inputRef.current as any)?.clear(); },
  }), []);

  const containerStyle: ViewStyle = {
    gap: 6,
  };

  const inputContainerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: error ? '#EF4444' : '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    gap: 12,
  };

  const focusedStyle: ViewStyle = {
    borderColor: '#FF5722',
    borderWidth: 2,
    shadowColor: '#FF5722',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  };

  const inputStyle: TextStyle = {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
    paddingVertical: 14,
  };

  const labelStyle: TextStyle = {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
  };

  const errorStyle: TextStyle = {
    fontSize: 12,
    color: '#EF4444',
  };

  const helperStyle: TextStyle = {
    fontSize: 12,
    color: '#9CA3AF',
  };

  return (
    <View style={[{ ...containerStyle, ...style } as ViewStyle]}>
      {label && <Text style={labelStyle}>{label}</Text>}
      <View style={[inputContainerStyle, props.onFocus ? focusedStyle : {}] as ViewStyle[]}>
        {leftIcon && <View style={{ marginRight: 4 }}>{leftIcon}</View>}
        <TextInput
          ref={inputRef as any}
          style={inputStyle}
          placeholderTextColor="#9CA3AF"
          {...props}
        />
        {rightIcon && <View style={{ marginLeft: 4 }}>{rightIcon}</View>}
      </View>
      {error && <Text style={errorStyle}>{error}</Text>}
      {!error && helperText && <Text style={helperStyle}>{helperText}</Text>}
    </View>
  );
});

Input.displayName = 'Input';

export { Input };