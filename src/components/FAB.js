import { Pressable } from "react-native";

const FAB = ({ onPress, children }) => {
  return (
    <Pressable
      className="justify-center items-center rounded-full absolute bottom-[70px] right-4 bg-blue-500 px-3 py-3 shadow-2xl shadow-blue-500 border-2 border-blue-700"
      onPress={onPress}
    >
      {children}
    </Pressable>
  );
};
export default FAB;
