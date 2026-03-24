import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export interface BottomTabItem {
    key: string;
    label: string;
    onPress: () => void;
    icon: React.ReactNode | ((active: boolean, color: string) => React.ReactNode);
    accessibilityLabel?: string;
}

export interface BottomTabProps {
    tabs: BottomTabItem[];
    activeTabKey: string;
    activeColor?: string;
    inactiveColor?: string;
    height?: number;
    backgroundColor?: string;
    borderTopColor?: string;
}

interface TabItemProps {
    item: BottomTabItem;
    active: boolean;
    activeColor: string;
    inactiveColor: string;
}

const TabItem: React.FC<TabItemProps> = ({
    item,
    active,
    activeColor,
    inactiveColor,
}) => {
    const color = active ? activeColor : inactiveColor;
    const renderedIcon =
        typeof item.icon === "function" ? item.icon(active, color) : item.icon;

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={item.accessibilityLabel ?? `${item.label} tab`}
            hitSlop={8}
            onPress={item.onPress}
            style={styles.tabItem}
        >
            {renderedIcon}
            <Text style={[styles.tabLabel, { color }]}>{item.label}</Text>
        </Pressable>
    );
};

export const BottomTab: React.FC<BottomTabProps> = ({
    tabs,
    activeTabKey,
    activeColor = "#0DF2F2",
    inactiveColor = "#9CA3AF",
    height = 68,
    backgroundColor = "#FFFFFF",
    borderTopColor = "#F3F4F6",
}) => {
    const insets = useSafeAreaInsets();
    const visibleTabs = tabs.slice(0, 4);

    return (
        <View
            style={[
                styles.container,
                {
                    minHeight: height + insets.bottom,
                    paddingBottom: insets.bottom,
                    backgroundColor,
                    borderTopColor,
                },
            ]}
        >
            {visibleTabs.map((tab) => (
                <TabItem
                    active={activeTabKey === tab.key}
                    activeColor={activeColor}
                    inactiveColor={inactiveColor}
                    item={tab}
                    key={tab.key}
                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderTopWidth: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
        paddingTop: 8,
    },
    tabItem: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        minWidth: 64,
    },
    tabLabel: {
        marginTop: 4,
        fontSize: 10,
        lineHeight: 15,
        fontWeight: "500",
    },
});
