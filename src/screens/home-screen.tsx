import { Button, Text, View } from "react-native";

interface HomeSceenProps {
    navigation: any;
}

export const HomeScreen: React.FC<HomeSceenProps> = ({ navigation }) => {
    return (
        <View>
            <Text>Home Screen</Text>
            <Button
                title="Go to Demo"
                onPress={() =>
                    navigation.navigate('Demo')
                }
            />
            <View style={{ height: 10 }}></View>
            <Button
                title="Go to Profile"
                onPress={() =>
                    navigation.navigate('Profile')
                }
            />
        </View>
    );
}