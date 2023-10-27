import { Tabs, useLocalSearchParams } from "expo-router";
import React from "react";
import { Text, View } from "react-native";
import { Card, Menu } from "react-native-paper";

function Page() {
  const { name } = useLocalSearchParams();

  return (
    <>
      <Card className="p-4 m-4">
        <Text className="text-xl font-bold">{name}</Text>
        <View className="flex mt-[-32px]">
          <Menu.Item leadingIcon="account" title="User 1 (Port 1)" />
        </View>
      </Card>
    </>
  );
}

export default Page;
