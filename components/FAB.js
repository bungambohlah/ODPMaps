import { Pressable } from "react-native";

const FAB = ({ onPress, children, customClassName }) => {
  return (
    <Pressable
      className={`justify-center items-center rounded-full absolute bottom-[70px] ${customClassName}`}
      onPress={onPress}
    >
      {children}
    </Pressable>
  );
};
export default FAB;
