import React, { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";
import { ActivityIndicator, Button, Card, TextInput } from "react-native-paper";
import DropDown from "react-native-paper-dropdown";

const UPSTASH_URL = "https://adapting-wildcat-40465.upstash.io";
const UPSTASH_TOKEN =
  "AZ4RACQgMmE4NTFjNzYtZTg0MS00NDk3LWIyZTEtYWZlODAwMGE2ZDVkMTc4Nzk5ZmM2ZTFlNGQ1NzllMjU5ODc1ZDc4OTEyZDk=";
const opt = { headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` } };

function Page() {
  const { name, user: userParams } = useLocalSearchParams();
  const [user, setUser] = useState(
    JSON.parse(userParams || "") || {
      port: 0,
      customerID: "",
      name: "",
      status: "",
    },
  );
  const [disabled, setDisabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDropDownStatus, setShowDropDownStatus] = useState(false);
  const status = [
    {
      label: "Active",
      value: "active",
    },
    {
      label: "Available",
      value: "available",
    },
    {
      label: "Broken",
      value: "broken",
    },
  ];

  async function editUserODP() {
    try {
      // get list of users by ODP first
      const response = await fetch(`${UPSTASH_URL}/get/${name}-Users`, opt);
      const data = await response.json();
      let resultData = JSON.parse(data.result || "[]");
      const userIndex = resultData.findIndex((x) => x.port === user.port);
      if (resultData[userIndex]) {
        resultData[userIndex] = user;
      } else if (!resultData[userIndex]) {
        resultData.push(user);
      }

      // // update list of users by ODP
      await fetch(`${UPSTASH_URL}/set/${name}-Users/${JSON.stringify(resultData)}`, opt);

      router.setParams({ name });
      router.back();
      router.replace({ pathname: "/details/user", params: { name } });
    } catch (error) {
      // console.error(error);
    }
  }

  function handleSubmit() {
    setDisabled(true);
    editUserODP()
      .then(() =>
        router.setParams({
          snackMessage: `Successfully to update user ${user.name} into ODP ${name}.`,
        }),
      )
      .catch(() => router.setParams({ snackMessage: "Failed to update user." }))
      .finally(() => {
        setDisabled(false);
      });
  }

  return (
    <>
      <Card className="p-4 m-4">
        {!loading ? (
          <>
            <View className="flex flex-col gap-4">
              <TextInput
                label="Customer ID"
                mode="outlined"
                value={user.customerID}
                onChangeText={(customerID) => setUser((s) => ({ ...s, customerID }))}
              />
              <TextInput
                label="Name"
                mode="outlined"
                value={user.name}
                onChangeText={(name) => setUser((s) => ({ ...s, name }))}
              />
              <View>
                <DropDown
                  label={"Status"}
                  mode={"outlined"}
                  visible={showDropDownStatus}
                  showDropDown={() => setShowDropDownStatus(true)}
                  onDismiss={() => setShowDropDownStatus(false)}
                  value={user.status}
                  setValue={(status) => setUser((s) => ({ ...s, status }))}
                  list={status}
                />
              </View>
              <Button mode="contained" onPress={handleSubmit} disabled={disabled}>
                Submit
              </Button>
            </View>
          </>
        ) : (
          <ActivityIndicator animating={true} />
        )}
      </Card>
    </>
  );
}

export default Page;
