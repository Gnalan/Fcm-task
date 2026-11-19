import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Welcome from "../views/Welcome";
import CaseList from "../views/CaseList";
import CaseDetail from "../views/CaseDetail";

import { MyTransition } from "../components/navigationslide";

const Stack = createStackNavigator();

const Routes = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    ...MyTransition,
                    headerShown: false,
                }}
                initialRouteName="Welcome"
            >
                <Stack.Screen name="Welcome" component={Welcome} />
                <Stack.Screen name="CaseList" component={CaseList} />
                <Stack.Screen name="CaseDetail" component={CaseDetail} />

            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default Routes;
