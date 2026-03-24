import { Image, StyleSheet, Text, View } from "react-native";
import Button from "../components/Button";

interface IDemoScreen {
    navigation: any;
}

export const DemoScreen: React.FC<IDemoScreen> = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <Image source={{ uri: 'https://reactjs.org/logo-og.png' }}
                style={styles.image} />
            <Text style={styles.red}>just red</Text>
            <Text style={styles.bigBlue}>just bigBlue</Text>
            <Text style={[styles.bigBlue, styles.red]}>bigBlue, then red</Text>
            <Text style={[styles.red, styles.bigBlue]}>red, then bigBlue</Text>
            <Button
                onPress={() => {
                    console.log('You tapped the button!');
                }}
            >
                <Text>Press Me</Text>
            </Button >
            <View style={styles.spacer} />
            <Button
                onPress={() =>
                    navigation.navigate('Home')
                }
            >
                <Text>Go to Home</Text>
            </Button>
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 50,
    },
    bigBlue: {
        color: 'blue',
        fontWeight: 'bold',
        fontSize: 30,
    },
    red: {
        color: 'red',
    },
    image: {
        width: 200,
        height: 200,
    },
    spacer: {
        height: 10,
    },
})