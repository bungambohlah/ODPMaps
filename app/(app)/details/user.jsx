import { useCallback, useEffect, useState } from "react";
import { router, useGlobalSearchParams } from "expo-router";
import { RefreshControl, ScrollView, View } from "react-native";
import { ActivityIndicator, Card, DataTable, Icon, MD3Colors, Snackbar } from "react-native-paper";

const UPSTASH_URL = "https://apn1-frank-cowbird-33009.upstash.io";
const UPSTASH_TOKEN =
  "AYDxASQgOWMxZjMwMWItODJkMS00MTg1LTliYjgtOTA5ZGU0OTE0NjA2ODVhODA3MWNhY2Q4NGRmZDhmNDI0NGRkMjViOWYxM2I=";

function Page() {
  const { name, snackMessage } = useGlobalSearchParams();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const page = 0;
  const itemsPerPage = 16;
  const from = page * itemsPerPage;
  const to = Math.min((page + 1) * itemsPerPage, users.length);

  const onDismissSnackBar = () => router.setParams({ snackMessage: "" });

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setLoading(true);
    getUsersODP();
  }, [name]);

  async function getUsersODP() {
    setLoading(true);
    try {
      if (name) {
        const response = await fetch(`${UPSTASH_URL}/get/${name}-Users`, {
          headers: {
            Authorization: `Bearer ${UPSTASH_TOKEN}`,
          },
        });
        const data = await response.json();
        if (!data.result) return;
        const resultData = JSON.parse(data.result || "");
        setUsers(resultData);
      }
    } catch (error) {
      setUsers([]);
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    onRefresh();
  }, []);

  useEffect(() => {
    if (snackMessage?.length) {
      onRefresh();
    }
  }, [snackMessage]);

  return (
    <>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <Card className="p-4 m-4">
          <View className="flex">
            {loading ? (
              <ActivityIndicator animating={true} />
            ) : (
              <DataTable>
                <DataTable.Header>
                  <DataTable.Title>Port</DataTable.Title>
                  <DataTable.Title>ID</DataTable.Title>
                  <DataTable.Title>Name</DataTable.Title>
                  <DataTable.Title>Status</DataTable.Title>
                  <DataTable.Title>#</DataTable.Title>
                </DataTable.Header>

                {users.slice(from, to).map((item) => (
                  <DataTable.Row key={item.port}>
                    <DataTable.Cell>{item.port}</DataTable.Cell>
                    <DataTable.Cell>{item.customerID}</DataTable.Cell>
                    <DataTable.Cell>{item.name}</DataTable.Cell>
                    <DataTable.Cell>{item.status}</DataTable.Cell>
                    <DataTable.Cell>
                      <Icon source="pencil" color={MD3Colors.primary10} size={20} />
                      <Icon source="trash-can" color={MD3Colors.error50} size={20} />
                    </DataTable.Cell>
                  </DataTable.Row>
                ))}
              </DataTable>
            )}
          </View>
        </Card>
      </ScrollView>
      <Snackbar visible={snackMessage?.length || false} onDismiss={onDismissSnackBar}>
        {snackMessage}
      </Snackbar>
    </>
  );
}

export default Page;
