import React, { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";
import { ActivityIndicator, Button, Card, TextInput } from "react-native-paper";
import DropDown from "react-native-paper-dropdown";

const UPSTASH_URL = "https://adapting-wildcat-40465.upstash.io";
const UPSTASH_TOKEN =
  "AZ4RACQgMmE4NTFjNzYtZTg0MS00NDk3LWIyZTEtYWZlODAwMGE2ZDVkMTc4Nzk5ZmM2ZTFlNGQ1NzllMjU5ODc1ZDc4OTEyZDk=";
const opt = { headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` } };
const totalPorts = 16;

function Page() {
  const { name } = useLocalSearchParams();
  const [user, setUser] = useState({
    port: 0,
    customerID: "",
    name: "",
    status: "",
  });
  const [ports, setPorts] = useState([]);
  const [disabled, setDisabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDropDownPort, setShowDropDownPort] = useState(false);
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

  async function getExistingPorts() {
    setLoading(true);
    try {
      const response = await fetch(`${UPSTASH_URL}/get/${name}-Users`, opt);
      const data = await response.json();
      const resultData = JSON.parse(data.result || "[]");
      const reducedResult = resultData.reduce((previous, current) => {
        if (!previous[current.port]) {
          previous[current.port] = current;
        }

        return previous;
      }, {});

      for (let i = 1; i <= totalPorts; i++) {
        if (!reducedResult[i]) {
          setPorts((prev) => [...prev, { label: `PORT ${i}`, value: i }]);
        }
      }
    } catch (error) {
      setPorts([]);
    } finally {
      setLoading(false);
    }
  }

  async function addUserODP() {
    try {
      // get list of users by ODP first
      const response = await fetch(`${UPSTASH_URL}/get/${name}-Users`, opt);
      const data = await response.json();
      if (!data.result) return;
      let resultData = JSON.parse(data.result || "[]");
      // add user into current existing list of users
      resultData.push(user);

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
    addUserODP()
      .then(() => router.setParams({ snackMessage: `Successfully to add user into ODP ${name}.` }))
      .catch(() => router.setParams({ snackMessage: "Failed to add user." }))
      .finally(() => {
        setDisabled(false);
      });
  }

  useEffect(() => {
    // execute if ports is empty
    if (!ports.length) {
      getExistingPorts();
    }
  }, [name, ports]);

  return (
    <>
      <Card className="p-4 m-4">
        {!loading ? (
          <>
            <View className="flex flex-col gap-4">
              <View>
                <DropDown
                  label={"Ports"}
                  mode={"outlined"}
                  visible={showDropDownPort}
                  showDropDown={() => setShowDropDownPort(true)}
                  onDismiss={() => setShowDropDownPort(false)}
                  value={user.port}
                  setValue={(port) => setUser((s) => ({ ...s, port }))}
                  list={ports}
                />
              </View>
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
