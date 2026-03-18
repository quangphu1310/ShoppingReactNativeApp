import { Button, Text, View } from "react-native";

interface IProfileScreen {
    navigation: any;
}

export const ProfileScreen: React.FC<IProfileScreen> = ({ navigation }) => {
    return (
        <View>
            <Text>Profile Screen</Text>
            <Button
                title="Go to Home"
                onPress={() =>
                    navigation.navigate('Home')
                }
            />
            <View style={{ height: 10 }} />
            <Button
                title="Go to Demo"
                onPress={() =>
                    navigation.navigate('Demo')
                }
            />
        </View>
    );
}