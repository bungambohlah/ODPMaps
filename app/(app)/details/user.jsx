import { useCallback, useEffect, useState } from "react";
import { router, useGlobalSearchParams } from "expo-router";
import { Pressable, RefreshControl, ScrollView, View } from "react-native";
import { ActivityIndicator, Card, DataTable, Icon, MD3Colors, Snackbar } from "react-native-paper";

const UPSTASH_URL = "https://apn1-frank-cowbird-33009.upstash.io";
const UPSTASH_TOKEN =
  "AYDxASQgOWMxZjMwMWItODJkMS00MTg1LTliYjgtOTA5ZGU0OTE0NjA2ODVhODA3MWNhY2Q4NGRmZDhmNDI0NGRkMjViOWYxM2I=";
const totalPorts = 16;

function Page() {
  const { name, snackMessage } = useGlobalSearchParams();
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const capitalizeFirstLetter = (string) => string.charAt(0).toUpperCase() + string.slice(1);

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
        const resultData = JSON.parse(data.result || []);
        if (resultData?.length) {
          const reducedResult = resultData.reduce((previous, current) => {
            if (!previous[current.port]) {
              previous[current.port] = current;
            }
            return previous;
          }, {});
          setUsers(reducedResult);
        }
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

                {Array(totalPorts)
                  .fill(null)
                  .map((_, index) => {
                    return users[index + 1] ? (
                      <DataTable.Row key={users[index + 1].port}>
                        <DataTable.Cell>{users[index + 1].port}</DataTable.Cell>
                        <DataTable.Cell>{users[index + 1].customerID}</DataTable.Cell>
                        <DataTable.Cell>{users[index + 1].name}</DataTable.Cell>
                        <DataTable.Cell>
                          {users[index + 1].status
                            ? capitalizeFirstLetter(users[index + 1].status)
                            : ""}
                        </DataTable.Cell>
                        <DataTable.Cell>
                          <Pressable
                            onPress={() =>
                              router.push({
                                pathname: "/(app)/edit/edit-user",
                                params: { name, user: JSON.stringify(users[index + 1]) },
                              })
                            }
                          >
                            <Icon source="pencil" color={MD3Colors.primary10} size={20} />
                          </Pressable>
                        </DataTable.Cell>
                      </DataTable.Row>
                    ) : (
                      <DataTable.Row key={index + 1}>
                        <DataTable.Cell>{index + 1}</DataTable.Cell>
                        <DataTable.Cell></DataTable.Cell>
                        <DataTable.Cell></DataTable.Cell>
                        <DataTable.Cell>Available</DataTable.Cell>
                        <DataTable.Cell>
                          <Pressable
                            onPress={() =>
                              router.push({
                                pathname: "/(app)/edit/edit-user",
                                params: {
                                  name,
                                  user: JSON.stringify({
                                    port: index + 1,
                                    customerID: "",
                                    name: "",
                                    status: "available",
                                  }),
                                },
                              })
                            }
                          >
                            <Icon source="pencil" color={MD3Colors.primary10} size={20} />
                          </Pressable>
                        </DataTable.Cell>
                      </DataTable.Row>
                    );
                  })}
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
