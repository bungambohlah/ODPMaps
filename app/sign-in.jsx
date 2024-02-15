import { router } from "expo-router";
import { Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { Button, Dialog, Portal, TextInput } from "react-native-paper";
import { useEffect, useState } from "react";
import * as Crypto from "expo-crypto";
import { useAssets } from "expo-asset";
import { useSession } from "../hooks/ctx";

const blurhash =
  "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";
const UPSTASH_URL = "https://adapting-wildcat-40465.upstash.io";
const UPSTASH_TOKEN =
  "AZ4RACQgMmE4NTFjNzYtZTg0MS00NDk3LWIyZTEtYWZlODAwMGE2ZDVkMTc4Nzk5ZmM2ZTFlNGQ1NzllMjU5ODc1ZDc4OTEyZDk=";

export default function SignIn() {
  const { signIn } = useSession();
  const [username, setUsername] = useState("");
  const [pass, setPass] = useState("");
  const [userCreds, setUserCreds] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");

  const [assets, error] = useAssets([require("../assets/biznet_vertical_logo.png")]);

  async function GetUserCreds() {
    const response = await fetch(`${UPSTASH_URL}/get/UserCreds`, {
      headers: {
        Authorization: `Bearer ${UPSTASH_TOKEN}`,
      },
    });
    const data = await response.json();
    const userCreds = JSON.parse(data.result || "[]");
    const reducedUserCreds = userCreds.reduce((obj, val) => {
      obj[val.user] = val.pass;
      return obj;
    }, {});
    setUserCreds(reducedUserCreds);
    return reducedUserCreds;
  }

  async function handleSubmit() {
    try {
      setIsLoading(true);
      const digest = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, pass);
      if (userCreds[username] === digest) {
        signIn(username);
        // Navigate after signing in. You may want to tweak this to ensure sign-in is
        // successful before navigating.
        setTimeout(() => router.replace("/"), 500);
      } else if (userCreds[username] !== pass) {
        setMessage("Invalid username or password");
        setVisible(true);
      }
    } catch (error) {
      setMessage("Something went wrong, please try again later");
      setVisible(true);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  const _handleDialog = () => setVisible(!visible);

  useEffect(() => {
    GetUserCreds();
  }, []);

  return (
    <LinearGradient colors={["#eef0f5", "#d7e1f2", "#b9cae8"]}>
      <View className="flex items-center justify-center w-full h-full">
        <View className="flex items-center justify-center w-full gap-4">
          {assets ? (
            <Image
              style={{ width: "90%", height: 300 }}
              source={{ uri: assets[0].uri }}
              placeholder={blurhash}
              contentFit="contain"
              transition={500}
            />
          ) : null}
          <Text className="font-bold text-2xl text-[#232175] w-1/2 text-center ml-10">
            ODP Maps
          </Text>
          <TextInput
            mode="outlined"
            cursorColor="black"
            outlineColor="black"
            activeOutlineColor="black"
            style={{ width: "70%", borderRadius: 30, backgroundColor: "white" }}
            placeholder="User"
            placeholderTextColor="#7f7f7f"
            value={username}
            onChangeText={(text) => setUsername(text)}
          />
          <TextInput
            secureTextEntry
            mode="outlined"
            cursorColor="black"
            outlineColor="black"
            activeOutlineColor="black"
            style={{ width: "70%", borderRadius: 30, backgroundColor: "white" }}
            placeholder="Password"
            placeholderTextColor="#7f7f7f"
            value={pass}
            onChangeText={(text) => setPass(text)}
          />
        </View>
        <Button
          disabled={isLoading}
          loading={isLoading}
          buttonColor="black"
          textColor="white"
          mode="contained"
          style={{ borderRadius: 10, marginTop: 20, width: 150 }}
          onPress={() => handleSubmit()}
        >
          <Text className="text-xl text-center align-middle">Login</Text>
        </Button>
        <Portal>
          <Dialog visible={visible} onDismiss={_handleDialog}>
            <Dialog.Title>Login Information</Dialog.Title>
            <Dialog.Content>
              <Text variant="bodyMedium">{message}</Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={_handleDialog}>Close</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </View>
    </LinearGradient>
  );
}
