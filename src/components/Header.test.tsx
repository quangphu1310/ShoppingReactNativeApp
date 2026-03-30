import React from 'react';
import { Pressable, Text } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Header } from './Header';

const mockGoBack = jest.fn();
const mockCanGoBack = jest.fn(() => true);

jest.mock('@react-navigation/native', () => ({
    useNavigation: jest.fn(() => ({
        canGoBack: mockCanGoBack,
        goBack: mockGoBack,
    })),
}));

jest.mock('react-native-safe-area-context', () => ({
    useSafeAreaInsets: () => ({ top: 10, right: 0, bottom: 0, left: 0 }),
}));

describe('Header', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockCanGoBack.mockReturnValue(true);
    });

    it('should render title and trigger goBack on default left button press', () => {
        render(<Header title="Profile Settings" />);

        expect(screen.getByText('Profile Settings')).toBeTruthy();

        fireEvent.press(screen.getByLabelText('Go back'));

        expect(mockCanGoBack).toHaveBeenCalledTimes(1);
        expect(mockGoBack).toHaveBeenCalledTimes(1);
    });

    it('should not call goBack when navigation cannot go back', () => {
        mockCanGoBack.mockReturnValue(false);

        render(<Header title="Orders" />);

        fireEvent.press(screen.getByLabelText('Go back'));

        expect(mockCanGoBack).toHaveBeenCalledTimes(1);
        expect(mockGoBack).not.toHaveBeenCalled();
    });

    it('should render right action and call handler when pressed', () => {
        const onRightPress = jest.fn();

        render(
            <Header
                title="Checkout"
                rightIcon={<Text>Done</Text>}
                onRightPress={onRightPress}
                rightAccessibilityLabel="Complete checkout"
            />,
        );

        fireEvent.press(screen.getByLabelText('Complete checkout'));

        expect(onRightPress).toHaveBeenCalledTimes(1);
    });

    it('should disable right action button when right icon exists but handler is missing', () => {
        render(<Header title="Checkout" rightIcon={<Text>Done</Text>} />);

        const rightButton = screen.getByLabelText('Header right action');

        fireEvent.press(rightButton);

        expect(rightButton.props.accessibilityRole).toBe('button');
        expect(rightButton.props.onPress).toBeUndefined();
    });

    it('should support custom left icon and custom accessibility label', () => {
        render(
            <Header
                title="Details"
                leftIcon={<Pressable accessibilityLabel="Custom left icon" />}
                leftAccessibilityLabel="Back to previous screen"
                centerTitle={false}
            />,
        );

        expect(screen.getByLabelText('Back to previous screen')).toBeTruthy();
        expect(screen.queryByLabelText('Header right action')).toBeNull();
    });
});
