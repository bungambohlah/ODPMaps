import React, { useCallback, useEffect, useState } from "react";
import { router, useGlobalSearchParams } from "expo-router";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import { ActivityIndicator, Card, Snackbar } from "react-native-paper";

const UPSTASH_URL = "https://apn1-frank-cowbird-33009.upstash.io";
const UPSTASH_TOKEN =
  "AYDxASQgOWMxZjMwMWItODJkMS00MTg1LTliYjgtOTA5ZGU0OTE0NjA2ODVhODA3MWNhY2Q4NGRmZDhmNDI0NGRkMjViOWYxM2I=";

function Page() {
  const { name, snackMessage } = useGlobalSearchParams();
  const [information, setInformation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = React.useState(false);

  const onDismissSnackBar = () => router.setParams({ snackMessage: "" });

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setLoading(true);
    getInformationODP().finally(() => {
      setLoading(false);
      setRefreshing(false);
    });
  }, [name]);

  async function getInformationODP() {
    try {
      if (name) {
        const response = await fetch(`${UPSTASH_URL}/get/${name}-Information`, {
          headers: {
            Authorization: `Bearer ${UPSTASH_TOKEN}`,
          },
        });
        const data = await response.json();
        const resultData = JSON.parse(data.result || "");
        const formattedData = resultData.replaceAll("<enter>", "\n");
        setInformation(formattedData);
      }
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    onRefresh();
  }, [information, name, onRefresh]);

  return (
    <>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <Card className="p-4 m-4">
          {!loading ? (
            <>
              <Text className="text-xl font-bold">{name}</Text>
              <View className="mt-4">
                <Text className={`text-sm ${!information?.length ? "italic" : ""}`}>
                  {information?.length ? information : "No description"}
                </Text>
              </View>
            </>
          ) : (
            <ActivityIndicator animating={true} />
          )}
        </Card>
      </ScrollView>
      <Snackbar visible={snackMessage?.length || false} onDismiss={onDismissSnackBar}>
        {snackMessage}
      </Snackbar>
    </>
  );
}

export default Page;
